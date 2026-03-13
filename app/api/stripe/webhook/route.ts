import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { query } from '@/lib/db'
import { provisionSchool } from '@/lib/provision'
import Stripe from 'stripe'

// Tell Next.js not to parse the body — Stripe needs the raw bytes to verify signature
export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Log the event
  try {
    await query(`
      INSERT INTO billing_events (stripe_event_id, event_type, status)
      VALUES ($1, $2, 'received')
      ON CONFLICT (stripe_event_id) DO NOTHING
    `, [event.id, event.type])
  } catch (_) {}

  try {
    switch (event.type) {

      // ── Payment succeeded → provision the school
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const schoolId = session.metadata?.schoolId
        const subscriptionId = session.subscription as string

        if (!schoolId) break

        // Save subscription ID + billing cycle end
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        await query(`
          UPDATE schools
          SET stripe_subscription_id = $1,
              billing_cycle_end = to_timestamp($2),
              status = 'provisioning'
          WHERE id = $3
        `, [subscriptionId, (subscription as any).current_period_end, schoolId])

        // Provision the school ecosystem
        await provisionSchool(schoolId)

        await query(`
          UPDATE billing_events SET status = 'processed' WHERE stripe_event_id = $1
        `, [event.id])
        break
      }

      // ── Subscription renewed successfully
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await query(`
          UPDATE schools SET status = 'active' WHERE stripe_customer_id = $1
        `, [customerId])

        await query(`
          INSERT INTO billing_events (stripe_event_id, event_type, amount, status)
          VALUES ($1, $2, $3, 'processed')
          ON CONFLICT (stripe_event_id) DO NOTHING
        `, [event.id, event.type, invoice.amount_paid])
        break
      }

      // ── Payment failed → suspend the school
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await query(`
          UPDATE schools SET status = 'suspended' WHERE stripe_customer_id = $1
        `, [customerId])

        // TODO: send suspension email

        await query(`
          INSERT INTO billing_events (stripe_event_id, event_type, status)
          VALUES ($1, $2, 'processed')
          ON CONFLICT (stripe_event_id) DO NOTHING
        `, [event.id, event.type])
        break
      }

      // ── Subscription cancelled
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await query(`
          UPDATE schools SET status = 'cancelled' WHERE stripe_customer_id = $1
        `, [customerId])

        // Data preserved for 60 days — deletion handled by a cron job
        // TODO: send cancellation email with data export link

        break
      }

      // ── Plan upgraded or downgraded
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const newPriceId = subscription.items.data[0].price.id

        // Map price ID back to plan name
        const planMap: Record<string, string> = {
          [process.env.STRIPE_STARTER_PRICE_ID!]: 'starter',
          [process.env.STRIPE_GROWTH_PRICE_ID!]:  'growth',
          [process.env.STRIPE_PRO_PRICE_ID!]:     'pro',
        }
        const newPlan = planMap[newPriceId]
        if (newPlan) {
          await query(`
            UPDATE schools SET plan = $1 WHERE stripe_customer_id = $2
          `, [newPlan, customerId])
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error(`Error handling event ${event.type}:`, error)
    await query(`
      UPDATE billing_events SET status = 'failed' WHERE stripe_event_id = $1
    `, [event.id])
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Plan config — maps plan names to Stripe price IDs and limits
export const PLANS = {
  starter: {
    name: 'Starter',
    price: 150,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    limits: {
      students: 300,
      staff: 15,
      dbStorageGB: 1,
      cloudStorageGB: 5,
    },
    features: {
      customDomain: false,
      parentLogin: false,
      messaging: false,
      analytics: false,
      aiRecommendations: false,
      apiAccess: false,
    }
  },
  growth: {
    name: 'Growth',
    price: 299,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID!,
    limits: {
      students: 1500,
      staff: 75,
      dbStorageGB: 5,
      cloudStorageGB: 25,
    },
    features: {
      customDomain: true,
      parentLogin: true,
      messaging: true,
      analytics: true,
      aiRecommendations: false,
      apiAccess: false,
    }
  },
  pro: {
    name: 'Pro',
    price: 499,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    limits: {
      students: 5000,
      staff: -1, // unlimited
      dbStorageGB: 20,
      cloudStorageGB: 100,
    },
    features: {
      customDomain: true,
      parentLogin: true,
      messaging: true,
      analytics: true,
      aiRecommendations: true,
      apiAccess: true,
    }
  },
} as const

export type PlanName = keyof typeof PLANS

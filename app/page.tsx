import Link from 'next/link'

const features = [
  { icon: '🎓', title: 'Student Dashboard', desc: 'Results, resources, tests — all in one place.' },
  { icon: '👩‍🏫', title: 'Teacher Tools', desc: 'Upload materials, create tests, track performance.' },
  { icon: '🏫', title: 'Admin Control', desc: 'Full school management from one dashboard.' },
  { icon: '📝', title: 'MCQ Test System', desc: 'Timed, auto-graded tests with instant results.' },
  { icon: '📊', title: 'Report Cards', desc: 'Digital results and term reports, zero paperwork.' },
  { icon: '📚', title: 'eLibrary', desc: 'Centralised resources — PDFs, videos, ebooks.' },
]

const plans = [
  {
    name: 'Starter', price: 150, popular: false,
    limits: '300 students • 15 staff • 5GB storage',
    features: ['All core modules', 'Basic branding', 'Email support', 'Weekly backups'],
    locked: ['Custom domain', 'Parent login', 'Messaging'],
  },
  {
    name: 'Growth', price: 299, popular: true,
    limits: '1,500 students • 75 staff • 25GB storage',
    features: ['All core modules', 'Full branding', 'Custom domain', 'Parent login', 'Messaging', 'Analytics', 'Priority support'],
    locked: ['AI recommendations', 'API access'],
  },
  {
    name: 'Pro', price: 499, popular: false,
    limits: '5,000 students • Unlimited staff • 100GB storage',
    features: ['Everything in Growth', 'AI study recommendations', 'API access', 'Daily backups', 'Priority support'],
    locked: [],
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <span className="text-xl font-bold text-xeno-900">xeno<span className="text-xeno-600">Campus</span></span>
        <div className="flex items-center gap-6">
          <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</Link>
          <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Login</Link>
          <Link href="/signup" className="bg-xeno-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-xeno-700 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <div className="inline-block bg-xeno-50 text-xeno-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
          The school ecosystem platform
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Your school.<br />
          <span className="text-xeno-600">Your ecosystem.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Give your school a complete digital platform — learning, assessments, results, and administration. 
          Up and running in minutes.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="bg-xeno-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-xeno-700 transition-colors text-lg">
            Create your ecosystem
          </Link>
          <Link href="#features" className="text-gray-600 px-8 py-3 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors text-lg">
            See features
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">No setup required. Cancel anytime.</p>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Everything your school needs</h2>
        <p className="text-center text-gray-500 mb-14">One platform. Every role covered.</p>
        <div className="grid grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="border border-gray-100 rounded-2xl p-6 hover:border-xeno-200 transition-colors">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Simple pricing</h2>
          <p className="text-center text-gray-500 mb-14">Save 20% with annual billing.</p>
          <div className="grid grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className={`bg-white rounded-2xl p-6 flex flex-col ${plan.popular ? 'ring-2 ring-xeno-600' : 'border border-gray-200'}`}>
                {plan.popular && (
                  <span className="bg-xeno-50 text-xeno-700 text-xs font-medium px-3 py-1 rounded-full self-start mb-3">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-400 mt-1 mb-4">{plan.limits}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-400 text-sm"> / month</span>
                </div>
                <div className="space-y-2 mb-6 flex-1">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">✓</span> {f}
                    </div>
                  ))}
                  {plan.locked.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <span>✗</span> {f}
                    </div>
                  ))}
                </div>
                <Link
                  href={`/signup?plan=${plan.name.toLowerCase()}`}
                  className={`text-center py-3 rounded-xl text-sm font-medium transition-colors ${
                    plan.popular
                      ? 'bg-xeno-600 text-white hover:bg-xeno-700'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-8">
            Need more? <Link href="mailto:hello@xenocampus.com" className="text-xeno-600 hover:underline">Contact us</Link> for Enterprise pricing.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-bold text-gray-900">xeno<span className="text-xeno-600">Campus</span></span>
          <p className="text-sm text-gray-400">© 2026 xenoCampus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

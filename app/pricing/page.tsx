'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Check, Coins, Crown, Zap } from 'lucide-react'

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      name: 'Free',
      price: 'Free',
      period: '',
      tokens: 20,
      tokensPerMonth: 20,
      description: 'Perfect for trying out IntelliExtract',
      features: [
        '20 free tokens on signup',
        '10 tokens per extraction',
        '2 free extractions',
        'All AI models',
        'Basic templates',
        'Email support'
      ],
      cta: 'Get Started',
      highlighted: false,
      popular: false
    },
    {
      name: 'Starter',
      price: billingPeriod === 'monthly' ? '$19' : '$190',
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      tokens: 200,
      tokensPerMonth: 200,
      description: 'Best for individuals and small projects',
      features: [
        `${billingPeriod === 'monthly' ? '200 tokens/month' : '2,400 tokens/year'}`,
        '10 tokens per extraction',
        `${billingPeriod === 'monthly' ? '20 extractions/month' : '240 extractions/year'}`,
        'All AI models',
        'All templates',
        'Priority email support',
        'Export to CSV/Excel'
      ],
      cta: 'Subscribe',
      highlighted: true,
      popular: true
    },
    {
      name: 'Pro',
      price: billingPeriod === 'monthly' ? '$49' : '$490',
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      tokens: 1000,
      tokensPerMonth: 1000,
      description: 'For power users and businesses',
      features: [
        `${billingPeriod === 'monthly' ? '1,000 tokens/month' : '12,000 tokens/year'}`,
        '10 tokens per extraction',
        `${billingPeriod === 'monthly' ? '100 extractions/month' : '1,200 extractions/year'}`,
        'All AI models',
        'All templates',
        'Custom schemas',
        'Priority support',
        'API access',
        'Batch processing',
        'Advanced analytics'
      ],
      cta: 'Subscribe',
      highlighted: false,
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Token-Based Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Choose the plan that fits your needs. Each extraction costs 10 tokens.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingPeriod === 'yearly' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Yearly
              <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs font-semibold">
                Save 17%
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl transform scale-105 border-2 border-blue-400'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-xs font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className={`text-2xl font-bold ${
                    plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {plan.name}
                  </h3>
                  {plan.name === 'Pro' && (
                    <Crown className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
                <p className={`mb-4 ${
                  plan.highlighted ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {plan.description}
                </p>
                <div className="mb-4">
                  <span className={`text-5xl font-bold ${
                    plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-lg ml-2 ${
                      plan.highlighted ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  plan.highlighted 
                    ? 'bg-blue-500/30' 
                    : 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20'
                }`}>
                  <Coins className={`w-5 h-5 ${
                    plan.highlighted ? 'text-white' : 'text-yellow-600 dark:text-yellow-400'
                  }`} />
                  <div>
                    <p className={`text-sm font-semibold ${
                      plan.highlighted ? 'text-white' : 'text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {billingPeriod === 'monthly' 
                        ? `${plan.tokensPerMonth} tokens/month`
                        : `${plan.tokensPerMonth * 12} tokens/year`
                      }
                    </p>
                    <p className={`text-xs ${
                      plan.highlighted ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {billingPeriod === 'monthly'
                        ? `${Math.floor(plan.tokensPerMonth / 10)} extractions/month`
                        : `${Math.floor((plan.tokensPerMonth * 12) / 10)} extractions/year`
                      }
                    </p>
                  </div>
                </div>
              </div>

              <button
                className={`w-full py-3 rounded-lg font-semibold transition mb-6 ${
                  plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-gray-100'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {plan.cta}
              </button>

              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      plan.highlighted ? 'text-white' : 'text-green-500'
                    }`} />
                    <span className={
                      plan.highlighted ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                    }>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Token Information */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 border border-blue-200 dark:border-gray-600">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  How Tokens Work
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>Each document extraction costs <strong>10 tokens</strong></span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>Tokens reset monthly (or yearly for annual plans)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>Unused tokens don't roll over to the next period</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <span>Pro users get unlimited extractions (no token limit)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                How many tokens do I get?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Free users get 20 tokens on signup (2 extractions). Starter plan includes 200 tokens/month (20 extractions), and Pro plan includes 1,000 tokens/month (100 extractions). Pro users can also get unlimited tokens with an add-on.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I buy more tokens?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! You can purchase additional token packs anytime. Token packs are one-time purchases and don't expire. Contact support for bulk token purchases.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What happens if I run out of tokens?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You'll need to upgrade to a higher plan or purchase additional tokens. Free users can upgrade to Starter or Pro. Pro users can purchase unlimited token add-ons.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, and downgrades take effect at the end of your billing period.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! All new users get 20 free tokens (2 extractions) when they sign up. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

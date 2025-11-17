'use client'

import { Shield, Zap, Code, Globe, Lock, BarChart, Webhook, Users, FileCheck, Cloud } from 'lucide-react'

export default function EnterpriseFeatures() {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Enterprise Security',
      description: 'SOC 2 Type II certified, HIPAA compliant, end-to-end encryption, and GDPR ready. Your data is protected with bank-level security.',
      badge: 'Security'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Multi-Model AI Engine',
      description: 'Choose from 5+ AI models including OpenAI GPT-4, Google Gemini, Ollama (local), and Hugging Face. Optimize for speed, accuracy, or cost.',
      badge: 'AI'
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'RESTful API & Webhooks',
      description: 'Comprehensive REST API with webhook support. Integrate with QuickBooks, Xero, Salesforce, Zapier, and custom systems. Full API documentation included.',
      badge: 'Integration'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Cloud-Native Architecture',
      description: 'Built on Next.js 16, Supabase, and serverless infrastructure. Auto-scales to handle millions of documents. 99.99% uptime SLA.',
      badge: 'Infrastructure'
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Privacy-First Processing',
      description: 'Local AI processing option with Ollama. Data never leaves your infrastructure. Perfect for healthcare and financial services.',
      badge: 'Privacy'
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: 'Advanced Analytics',
      description: 'Real-time dashboards, extraction success rates, processing times, cost analytics, and custom reporting. Export to CSV, Excel, JSON.',
      badge: 'Analytics'
    },
    {
      icon: <Webhook className="w-6 h-6" />,
      title: 'Automated Workflows',
      description: 'Webhook triggers, batch processing, scheduled extractions, and integration with Zapier, Make.com, and custom automation platforms.',
      badge: 'Automation'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Team Collaboration',
      description: 'Role-based access control, team workspaces, shared templates, audit logs, and enterprise SSO support (SAML, OAuth).',
      badge: 'Collaboration'
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: 'Custom Templates',
      description: 'Build custom extraction schemas for your document types. Train models on your data. Template marketplace with 50+ pre-built templates.',
      badge: 'Templates'
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: 'Multi-Format Support',
      description: 'PDF, DOCX, PNG, JPG, TXT, HTML, and more. OCR for scanned documents. Handles complex layouts, tables, and multi-page documents.',
      badge: 'Formats'
    }
  ]

  return (
    <div className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Enterprise-Grade Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Built for scale, security, and seamless integration. Everything you need for enterprise document automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition">
                  {feature.icon}
                </div>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-semibold">
                  {feature.badge}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


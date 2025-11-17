import { FileText, Zap, Shield, Globe, Brain, Code } from 'lucide-react'

export default function Features() {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-white" />,
      title: 'AI-Powered Extraction',
      description: 'Advanced AI models extract data with human-level accuracy from any document format.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Zap className="w-8 h-8 text-white" />,
      title: 'Lightning Fast',
      description: 'Process documents in seconds with optimized AI inference and parallel processing.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <FileText className="w-8 h-8 text-white" />,
      title: 'Multi-Format Support',
      description: 'Works with PDFs, images, DOCX, HTML, and more. One API for all formats.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Shield className="w-8 h-8 text-white" />,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with end-to-end encryption. Your data stays private.',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      icon: <Code className="w-8 h-8 text-white" />,
      title: 'Custom Schemas',
      description: 'Define your own extraction schemas or use auto-schema generation for flexibility.',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      icon: <Globe className="w-8 h-8 text-white" />,
      title: 'Multiple AI Models',
      description: 'Choose from OpenAI, Google Gemini, or open-source models based on your needs.',
      gradient: 'from-yellow-500 to-amber-500'
    }
  ]

  return (
    <div className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to extract, process, and structure document data at scale
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}



import { Upload, Brain, Download, CheckCircle } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      icon: <Upload className="w-8 h-8 text-white" />,
      title: 'Upload Document',
      description: 'Upload your PDF, image, or document file through our simple interface.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Brain className="w-8 h-8 text-white" />,
      title: 'AI Processing',
      description: 'Our AI analyzes and extracts structured data from your document.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-white" />,
      title: 'Validate Results',
      description: 'Review and validate the extracted data with our intuitive interface.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Download className="w-8 h-8 text-white" />,
      title: 'Export Data',
      description: 'Download structured data in JSON, CSV, or integrate via API.',
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <div className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            How It Works
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Four simple steps to transform your documents into structured data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="flex flex-col items-center text-center">
                <div className={`w-24 h-24 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center mb-6 relative shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105`}>
                  {step.icon}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 via-gray-300 to-transparent dark:from-gray-700 dark:via-gray-600 -z-10 transform translate-x-6" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}



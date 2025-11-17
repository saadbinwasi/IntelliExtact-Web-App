'use client'

import { Star, Quote } from 'lucide-react'

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'VP of Operations',
      company: 'HealthTech Solutions',
      image: '👩‍💼',
      quote: 'IntelliExtract reduced our document processing time by 95%. What used to take our team 2 hours now takes 5 minutes. The API integration with our EHR system was seamless.',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'CTO',
      company: 'FinTech Innovations',
      image: '👨‍💻',
      quote: 'We process thousands of bank statements daily. IntelliExtract handles our volume effortlessly with 99.9% accuracy. The multi-model AI approach gives us flexibility we need.',
      rating: 5
    },
    {
      name: 'Emily Johnson',
      role: 'Director of Automation',
      company: 'Global Logistics Corp',
      image: '👩‍💼',
      quote: 'The webhook integration and batch processing capabilities transformed our invoice processing workflow. ROI was positive within the first month.',
      rating: 5
    }
  ]

  return (
    <div className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            See how enterprises are transforming their document workflows with IntelliExtract
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <Quote className="w-8 h-8 text-blue-500 mb-4 opacity-50" />
              
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                  {testimonial.image}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Processing millions of documents monthly for:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">Healthcare Systems</div>
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">Financial Institutions</div>
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">Legal Firms</div>
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">Accounting Firms</div>
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">Real Estate Companies</div>
          </div>
        </div>
      </div>
    </div>
  )
}


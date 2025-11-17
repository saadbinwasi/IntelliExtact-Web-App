import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <div className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Documents?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Transform your document processing workflow with intelligent data extraction
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/dashboard">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition shadow-lg hover:shadow-xl flex items-center space-x-2 text-lg font-semibold">
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition text-lg font-semibold">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  )
}



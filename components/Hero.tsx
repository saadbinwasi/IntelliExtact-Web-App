'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-900 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              AI-Powered Document Processing
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Extract Data from
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Any Document
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Transform unstructured documents into structured data with AI. Extract information from invoices, receipts, bank statements, contracts, and more with high accuracy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/dashboard">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl flex items-center space-x-2 text-lg font-semibold">
                <span>Start Extracting</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/get-started">
              <button className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition text-lg font-semibold">
                Get Started
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white">99%+</div>
              <div className="text-gray-600 dark:text-gray-400 mt-1">Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white">1000+</div>
              <div className="text-gray-600 dark:text-gray-400 mt-1">Documents Processed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white">&lt;5s</div>
              <div className="text-gray-600 dark:text-gray-400 mt-1">Avg Processing</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white">20+</div>
              <div className="text-gray-600 dark:text-gray-400 mt-1">Document Types</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



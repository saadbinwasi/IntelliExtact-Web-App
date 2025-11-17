import { FileText, CreditCard, Receipt, FileCheck, Building, UserCheck } from 'lucide-react'

export default function UseCases() {
  const useCases = [
    {
      icon: <Receipt className="w-8 h-8 text-white" />,
      title: 'Invoice Processing',
      description: 'Automatically extract invoice details, line items, totals, and vendor information.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <CreditCard className="w-8 h-8 text-white" />,
      title: 'Bank Statements',
      description: 'Extract transactions, balances, and account details from bank statements.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: <UserCheck className="w-8 h-8 text-white" />,
      title: 'ID Verification',
      description: 'Extract and verify information from driver licenses, passports, and IDs.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <FileCheck className="w-8 h-8 text-white" />,
      title: 'Contracts',
      description: 'Extract key terms, dates, parties, and clauses from legal documents.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: <Building className="w-8 h-8 text-white" />,
      title: 'Real Estate',
      description: 'Process property listings, lease agreements, and mortgage documents.',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      icon: <FileText className="w-8 h-8 text-white" />,
      title: 'Forms & Applications',
      description: 'Digitize paper forms, applications, and surveys automatically.',
      gradient: 'from-yellow-500 to-amber-500'
    }
  ]

  return (
    <div className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Use Cases
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            IntelliExtract adapts to your industry and document processing needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow hover:scale-105 transition-transform"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${useCase.gradient} rounded-xl flex items-center justify-center mb-6`}>
                {useCase.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {useCase.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}



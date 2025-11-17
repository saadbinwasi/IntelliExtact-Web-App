'use client'

export default function Integrations() {
  const integrations = [
    { name: 'QuickBooks', category: 'Accounting' },
    { name: 'Xero', category: 'Accounting' },
    { name: 'Salesforce', category: 'CRM' },
    { name: 'Zapier', category: 'Automation' },
    { name: 'Make.com', category: 'Automation' },
    { name: 'Slack', category: 'Communication' },
    { name: 'Microsoft Teams', category: 'Communication' },
    { name: 'Google Sheets', category: 'Productivity' },
    { name: 'Airtable', category: 'Database' },
    { name: 'Webhooks', category: 'API' },
    { name: 'REST API', category: 'API' },
    { name: 'GraphQL', category: 'API' }
  ]

  return (
    <div className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Seamless Integrations
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Connect IntelliExtract with your existing tools and workflows. Pre-built integrations and custom API access.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition">
                {integration.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {integration.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {integration.category}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Need a custom integration? Our API is fully documented and ready to connect.
          </p>
          <a
            href="/api-docs"
            className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
          >
            <span>View API Documentation</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </div>
  )
}


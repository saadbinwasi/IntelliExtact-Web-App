'use client'

import { useState } from 'react'
import { Download, Copy, Check, FileJson, Table, Eye, FileSpreadsheet, FileText } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ExtractedDataViewerProps {
  data: any
  fileName: string
}

export default function ExtractedDataViewer({ data, fileName }: ExtractedDataViewerProps) {
  const [viewMode, setViewMode] = useState<'formatted' | 'json'>('formatted')
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}_extracted.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadCSV = () => {
    if (!data || !data.data) return

    const extractedData = data.data
    const baseFileName = fileName.replace(/\.[^/.]+$/, '')

    // Handle bank statements with transactions
    if (extractedData.transactions && Array.isArray(extractedData.transactions)) {
      // Create CSV for transactions
      const headers = ['Date', 'Description', 'Debit', 'Credit', 'Balance']
      const rows = extractedData.transactions.map((t: any) => [
        t.date || '',
        t.description || '',
        t.debit && t.debit > 0 ? t.debit.toFixed(2) : '',
        t.credit && t.credit > 0 ? t.credit.toFixed(2) : '',
        t.balance ? t.balance.toFixed(2) : ''
      ])

      // Add account info as metadata at the top
      let csvContent = ''
      if (extractedData.accountInfo) {
        csvContent += 'Account Information\n'
        if (extractedData.accountInfo.accountNumber) {
          csvContent += `Account Number,${extractedData.accountInfo.accountNumber}\n`
        }
        if (extractedData.accountInfo.accountHolder) {
          csvContent += `Account Holder,${extractedData.accountInfo.accountHolder}\n`
        }
        if (extractedData.accountInfo.accountType) {
          csvContent += `Account Type,${extractedData.accountInfo.accountType}\n`
        }
        if (extractedData.statementPeriod) {
          csvContent += `Statement Period,${extractedData.statementPeriod.startDate} to ${extractedData.statementPeriod.endDate}\n`
        }
        csvContent += '\n'
      }

      // Add transactions
      csvContent += headers.join(',') + '\n'
      rows.forEach((row: any[]) => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n'
      })

      // Add closing balance
      if (extractedData.closingBalance !== undefined) {
        csvContent += `\nClosing Balance,${extractedData.closingBalance.toFixed(2)}\n`
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${baseFileName}_transactions.csv`
      a.click()
      URL.revokeObjectURL(url)
      return
    }

    // Generic CSV export for other data types
    // Clean field names: remove "this.", convert camelCase to Title Case
    const cleanFieldName = (key: string): string => {
      // Remove "this." prefix if present
      let cleaned = key.replace(/^this\./, '')
      // Convert camelCase to Title Case
      cleaned = cleaned.replace(/([A-Z])/g, ' $1').trim()
      // Capitalize first letter
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
      return cleaned
    }

    // Convert object to flat key-value pairs with clean names
    const flattenToKeyValue = (obj: any, prefix = ''): Record<string, any> => {
      const result: Record<string, any> = {}
      for (const key in obj) {
        if (obj[key] === null || obj[key] === undefined) continue
        
        const cleanKey = prefix ? `${prefix}_${key}` : key
        const value = obj[key]
        
        if (Array.isArray(value) && value.length > 0) {
          // If array of objects, create separate rows
          if (typeof value[0] === 'object') {
            // This will be handled separately
            continue
            } else {
            // Array of primitives - join them
            result[cleanKey] = value.join('; ')
            }
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Nested object - flatten it
          const nested = flattenToKeyValue(value, cleanKey)
          Object.assign(result, nested)
        } else {
          result[cleanKey] = value
        }
      }
      return result
    }

    // Check if we have an array of objects (like multiple items)
    const arrayKeys = Object.keys(extractedData).filter(key => 
      Array.isArray(extractedData[key]) && 
      extractedData[key].length > 0 && 
      typeof extractedData[key][0] === 'object'
    )

    if (arrayKeys.length > 0) {
      // Handle array of objects - create a table
      const arrayKey = arrayKeys[0]
      const items = extractedData[arrayKey]
      
      // Get all unique keys from all items
      const allKeys = new Set<string>()
      items.forEach((item: any) => {
        Object.keys(item).forEach(key => allKeys.add(key))
      })
      
      // Create headers
      const headers = Array.from(allKeys).map(cleanFieldName)
      const headerRow = headers.join(',')
      
      // Create rows
      const rows = items.map((item: any) => {
        return Array.from(allKeys).map(key => {
          const value = item[key]
          if (value === null || value === undefined) return ''
          if (typeof value === 'object') return JSON.stringify(value)
          return String(value).replace(/"/g, '""') // Escape quotes
        }).map(v => `"${v}"`).join(',')
      })
      
      // Add other fields as metadata at the top
      let csvContent = ''
      const otherData = { ...extractedData }
      delete otherData[arrayKey]
      
      if (Object.keys(otherData).length > 0) {
        const flatOther = flattenToKeyValue(otherData)
        const otherHeaders = Object.keys(flatOther).map(cleanFieldName)
        const otherValues = Object.values(flatOther).map(v => 
          v === null || v === undefined ? '' : String(v).replace(/"/g, '""')
        )
        csvContent += otherHeaders.join(',') + '\n'
        csvContent += otherValues.map(v => `"${v}"`).join(',') + '\n\n'
      }
      
      csvContent += headerRow + '\n'
      csvContent += rows.join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${baseFileName}_extracted.csv`
      a.click()
      URL.revokeObjectURL(url)
      return
    }

    // Single object - create a two-column table (Field, Value)
    const flatData = flattenToKeyValue(extractedData)
    const fieldNames = Object.keys(flatData).map(cleanFieldName)
    const values = Object.values(flatData).map(v => 
      v === null || v === undefined ? '' : String(v).replace(/"/g, '""')
    )
    
    const csvContent = 'Field,Value\n' + 
      fieldNames.map((name, i) => `"${name}","${values[i]}"`).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${baseFileName}_extracted.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadExcel = () => {
    if (!data || !data.data) return

    const extractedData = data.data
    const baseFileName = fileName.replace(/\.[^/.]+$/, '')
    const workbook = XLSX.utils.book_new()

    // Handle bank statements with transactions
    if (extractedData.transactions && Array.isArray(extractedData.transactions)) {
      // Create Account Info sheet
      if (extractedData.accountInfo || extractedData.statementPeriod) {
        const accountInfoData: any[][] = []
        if (extractedData.accountInfo) {
          if (extractedData.accountInfo.accountNumber) {
            accountInfoData.push(['Account Number', extractedData.accountInfo.accountNumber])
          }
          if (extractedData.accountInfo.accountHolder) {
            accountInfoData.push(['Account Holder', extractedData.accountInfo.accountHolder])
          }
          if (extractedData.accountInfo.accountType) {
            accountInfoData.push(['Account Type', extractedData.accountInfo.accountType])
          }
        }
        if (extractedData.statementPeriod) {
          accountInfoData.push(['Statement Period', `${extractedData.statementPeriod.startDate} to ${extractedData.statementPeriod.endDate}`])
        }
        if (extractedData.closingBalance !== undefined) {
          accountInfoData.push(['Closing Balance', extractedData.closingBalance])
        }

        const accountSheet = XLSX.utils.aoa_to_sheet(accountInfoData)
        XLSX.utils.book_append_sheet(workbook, accountSheet, 'Account Info')
      }

      // Create Transactions sheet
      const transactionHeaders = ['Date', 'Description', 'Debit', 'Credit', 'Balance']
      const transactionRows = extractedData.transactions.map((t: any) => [
        t.date || '',
        t.description || '',
        t.debit && t.debit > 0 ? t.debit : null,
        t.credit && t.credit > 0 ? t.credit : null,
        t.balance || null
      ])

      const transactionData = [transactionHeaders, ...transactionRows]
      const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData)
      
      // Set column widths
      transactionSheet['!cols'] = [
        { wch: 12 }, // Date
        { wch: 30 }, // Description
        { wch: 12 }, // Debit
        { wch: 12 }, // Credit
        { wch: 12 }  // Balance
      ]

      // Format header row
      const headerRange = XLSX.utils.decode_range(transactionSheet['!ref'] || 'A1')
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
        if (!transactionSheet[cellAddress]) continue
        transactionSheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: '4472C4' } },
          alignment: { horizontal: 'center', vertical: 'center' }
        }
      }

      XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transactions')
    } else {
      // Generic Excel export for other data types
      // Clean field names: remove "this.", convert camelCase to Title Case
      const cleanFieldName = (key: string): string => {
        let cleaned = key.replace(/^this\./, '')
        cleaned = cleaned.replace(/([A-Z])/g, ' $1').trim()
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
        return cleaned
      }

      // Convert object to flat key-value pairs with clean names
      const flattenToKeyValue = (obj: any, prefix = ''): Record<string, any> => {
        const result: Record<string, any> = {}
        for (const key in obj) {
          if (obj[key] === null || obj[key] === undefined) continue
          
          const cleanKey = prefix ? `${prefix}_${key}` : key
          const value = obj[key]
          
          if (Array.isArray(value) && value.length > 0) {
            if (typeof value[0] === 'object') {
              continue
              } else {
              result[cleanKey] = value.join('; ')
              }
          } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            const nested = flattenToKeyValue(value, cleanKey)
            Object.assign(result, nested)
          } else {
            result[cleanKey] = value
          }
        }
        return result
      }

      // Check if we have an array of objects
      const arrayKeys = Object.keys(extractedData).filter(key => 
        Array.isArray(extractedData[key]) && 
        extractedData[key].length > 0 && 
        typeof extractedData[key][0] === 'object'
      )

      if (arrayKeys.length > 0) {
        // Handle array of objects - create a table
        const arrayKey = arrayKeys[0]
        const items = extractedData[arrayKey]
        
        // Get all unique keys from all items
        const allKeys = new Set<string>()
        items.forEach((item: any) => {
          Object.keys(item).forEach(key => allKeys.add(key))
        })
        
        // Create headers
        const headers = Array.from(allKeys).map(cleanFieldName)
        
        // Create rows
        const rows = items.map((item: any) => {
          return Array.from(allKeys).map(key => {
            const value = item[key]
            if (value === null || value === undefined) return ''
            if (typeof value === 'object') return JSON.stringify(value)
            return value
          })
        })
        
        const sheetData = [headers, ...rows]
        const sheet = XLSX.utils.aoa_to_sheet(sheetData)
        
        // Set column widths
        sheet['!cols'] = headers.map(() => ({ wch: 20 }))
        
        // Format header row
        const headerRange = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
        for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
          if (!sheet[cellAddress]) continue
          sheet[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: '4472C4' } },
            alignment: { horizontal: 'center', vertical: 'center' }
          }
        }
        
        XLSX.utils.book_append_sheet(workbook, sheet, 'Data')
        
        // Add other fields as a separate sheet if they exist
        const otherData = { ...extractedData }
        delete otherData[arrayKey]
        
        if (Object.keys(otherData).length > 0) {
          const flatOther = flattenToKeyValue(otherData)
          const otherHeaders = Object.keys(flatOther).map(cleanFieldName)
          const otherValues = Object.values(flatOther)
          const otherSheetData = [otherHeaders, otherValues]
          const otherSheet = XLSX.utils.aoa_to_sheet(otherSheetData)
          otherSheet['!cols'] = [{ wch: 25 }, { wch: 30 }]
          XLSX.utils.book_append_sheet(workbook, otherSheet, 'Metadata')
        }
      } else {
        // Single object - create a two-column table (Field, Value)
        const flatData = flattenToKeyValue(extractedData)
        const fieldNames = Object.keys(flatData).map(cleanFieldName)
        const values = Object.values(flatData)
        
        const sheetData = [['Field', 'Value'], ...fieldNames.map((name, i) => [name, values[i]])]
      const sheet = XLSX.utils.aoa_to_sheet(sheetData)
        sheet['!cols'] = [{ wch: 25 }, { wch: 30 }]
        
        // Format header row
        const headerRange = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
        for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
          if (!sheet[cellAddress]) continue
          sheet[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: '4472C4' } },
            alignment: { horizontal: 'center', vertical: 'center' }
          }
        }
        
      XLSX.utils.book_append_sheet(workbook, sheet, 'Extracted Data')
      }
    }

    // Download the file
    XLSX.writeFile(workbook, `${baseFileName}_extracted.xlsx`)
  }

  const renderFormattedView = () => {
    if (!data || !data.data) return null

    const extractedData = data.data

    // Bank Statement Format
    if (extractedData.accountInfo || extractedData.transactions) {
      return (
        <div className="space-y-6">
          {/* Account Information */}
          {extractedData.accountInfo && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-blue-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <FileJson className="w-4 h-4 text-white" />
                </div>
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {extractedData.accountInfo.accountNumber && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Account Number</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {extractedData.accountInfo.accountNumber}
                    </p>
                  </div>
                )}
                {extractedData.accountInfo.accountHolder && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Account Holder</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {extractedData.accountInfo.accountHolder}
                    </p>
                  </div>
                )}
                {extractedData.accountInfo.accountType && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Account Type</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {extractedData.accountInfo.accountType}
                    </p>
                  </div>
                )}
              </div>
              {extractedData.statementPeriod && (
                <div className="mt-4 pt-4 border-t border-blue-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Statement Period</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {extractedData.statementPeriod.startDate} to {extractedData.statementPeriod.endDate}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Transactions Table */}
          {extractedData.transactions && Array.isArray(extractedData.transactions) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Table className="w-5 h-5 mr-2" />
                  Transactions ({extractedData.transactions.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Debit
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Credit
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {extractedData.transactions.map((transaction: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {transaction.date || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {transaction.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600 dark:text-red-400">
                          {transaction.debit && transaction.debit > 0 ? `$${transaction.debit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600 dark:text-green-400">
                          {transaction.credit && transaction.credit > 0 ? `$${transaction.credit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                          {transaction.balance ? `$${transaction.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Closing Balance */}
          {extractedData.closingBalance !== undefined && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Closing Balance</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${extractedData.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          )}
        </div>
      )
    }

    // Generic formatted view for other document types
    return (
      <div className="space-y-4">
        {Object.entries(extractedData).map(([key, value]: [string, any]) => (
          <div key={key} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </p>
            <p className="text-base text-gray-900 dark:text-white">
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('formatted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'formatted'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Formatted
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'json'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FileJson className="w-4 h-4 inline mr-2" />
            JSON
          </button>
        </div>
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center space-x-2 text-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
          <div className="flex items-center space-x-1 border-l border-gray-300 dark:border-gray-600 pl-2">
            <button
              onClick={downloadJSON}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 text-sm"
              title="Download as JSON"
            >
              <FileJson className="w-4 h-4" />
              <span className="hidden sm:inline">JSON</span>
            </button>
            <button
              onClick={downloadCSV}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2 text-sm"
              title="Download as CSV"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={downloadExcel}
              className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center space-x-2 text-sm"
              title="Download as Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {viewMode === 'formatted' ? (
          renderFormattedView()
        ) : (
          <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}


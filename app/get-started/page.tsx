'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import { Upload, FileText, Brain, Loader2, CheckCircle, XCircle, Eye, ArrowRight, Coins, Lock } from 'lucide-react'
import ExtractedDataViewer from '@/components/ExtractedDataViewer'
import AuthModal from '@/components/AuthModal'
import { useAuth } from '@/contexts/AuthContext'

interface ProcessedFile {
  id: number | string
  name: string
  size: number
  type: string
  status: 'processing' | 'completed' | 'failed'
  uploadedAt: Date
  result?: any
  error?: string
}

export default function GetStarted() {
  // Use Llama 3.2 as the default and only model
  const selectedModel = 'ollama/llama3.2'
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [useAutoSchema, setUseAutoSchema] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<ProcessedFile[]>([])
  const [showResults, setShowResults] = useState<number | string | null>(null)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  // Token system: Users get 20 free tokens on signup, each extraction costs 10 tokens
  // This means users can extract 2 documents with their free tokens (20 ÷ 10 = 2)
  const TOKENS_PER_EXTRACTION = 10
  
  // Use auth context - whole app knows when user is signed in
  const { user, userProfile, refreshUser } = useAuth()

  // Load saved documents from Supabase on mount
  useEffect(() => {
    const loadDocuments = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) {
          console.error('Error loading documents:', error)
        } else if (data) {
          const files: ProcessedFile[] = data.map((doc: any) => ({
            id: doc.id,
            name: doc.file_name,
            size: doc.file_size || 0,
            type: doc.file_type || 'application/pdf',
            status: doc.status as 'processing' | 'completed' | 'failed',
            uploadedAt: new Date(doc.created_at),
            result: doc.extracted_data ? {
              success: true,
              data: doc.extracted_data,
              fileName: doc.file_name,
              pages: 1,
              markdown: '# Extracted Data'
            } : undefined,
            error: doc.status === 'failed' ? 'Processing failed' : undefined
          }))
          setUploadedFiles(files)
        }
      } catch (error) {
        console.error('Error loading documents:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDocuments()
  }, [user])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleExtract = async () => {
    if (!selectedFile) {
      alert('Please select a file first')
      return
    }

    // Prevent concurrent extractions
    if (isExtracting) {
      alert('Please wait for the current extraction to complete before starting a new one.')
      return
    }

    // Refresh auth state before checking (in case it's stale)
    await refreshUser()

    // Check authentication - use fresh data from context
    if (!user) {
      setAuthMode('signup')
      alert('Please sign up or log in to extract documents. You\'ll get 20 free tokens!')
      return
    }

    // Double-check with Supabase to ensure we have an active session
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      setAuthMode('login')
      alert('Your session has expired. Please sign in again.')
      return
    }

    // Check tokens - ENABLED
    const tokensRemaining = userProfile?.tokens_remaining || 0
    const isProUser = userProfile?.subscription_tier === 'pro'
    
    if (!isProUser && tokensRemaining < TOKENS_PER_EXTRACTION) {
      setShowUpgradeModal(true)
      alert(`Insufficient tokens! You have ${tokensRemaining} tokens, but need ${TOKENS_PER_EXTRACTION} tokens per extraction.\n\nPlease upgrade to Pro for unlimited extractions or purchase more tokens.`)
      return
    }

    // Set extracting lock
    setIsExtracting(true)
    const fileId = Date.now()
    
    // Add file to list IMMEDIATELY with processing status (before any async operations)
    const newFile: ProcessedFile = {
      id: fileId,
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      status: 'processing',
      uploadedAt: new Date()
    }
    // Use functional update to ensure we have the latest state
    // Add to the beginning of the list so it appears at the top
    setUploadedFiles(prev => [newFile, ...prev])
    
    // Scroll to the files list section after a brief delay to ensure DOM is updated
    setTimeout(() => {
      const filesSection = document.getElementById('files-list-section')
      if (filesSection) {
        filesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)

    try {
      // Verify user is still authenticated
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser || currentUser.id !== user.id) {
        setAuthMode('login')
        alert('Your session has expired. Please sign in again.')
        return
      }

      // Save document to Supabase
      // First, verify connection by checking if table exists
      const { error: checkError } = await supabase
        .from('documents')
        .select('id')
        .limit(1)
      
      if (checkError && checkError.message.includes('schema cache')) {
        const errorMsg = 'Schema cache issue. Please wait a few seconds and try again, or refresh your Supabase project settings.'
        alert(errorMsg)
        throw new Error(errorMsg)
      }

      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: currentUser.id,
          file_name: selectedFile.name,
          file_type: selectedFile.type || 'application/pdf',
          file_size: selectedFile.size,
          status: 'processing',
          schema_used: selectedTemplate ? { template: selectedTemplate } : useAutoSchema ? { autoSchema: true } : null,
          model_used: selectedModel,
        })
        .select()
        .single()

      if (docError) {
        console.error('Error saving document to Supabase:', docError)
        // Provide more detailed error message
        const errorMessage = docError.message || 'Failed to save document'
        const userMessage = `Database error: ${errorMessage}. Please check your Supabase connection and ensure the tables are created.`
        alert(userMessage)
        throw new Error(userMessage)
      }

      if (!document) {
        const errorMsg = 'Document was not created in database. Please try again.'
        alert(errorMsg)
        throw new Error(errorMsg)
      }

      // Update the file in the list with the actual document ID from database
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, id: document.id } // Replace temporary ID with real database ID
            : f
        )
      )

      // Call extraction API
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('model', selectedModel)
      formData.append('userId', currentUser.id)
      formData.append('documentId', document.id) // Pass document ID to exclude from concurrent check
      if (selectedTemplate) {
        formData.append('template', selectedTemplate)
      }
      if (useAutoSchema) {
        formData.append('autoSchema', 'true')
      }

      const extractionStartTime = Date.now()
      
      // Add timeout to prevent hanging (5 minutes max)
      const timeoutMs = 300000 // 5 minutes
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
      
      let response
      let extractionResult
      try {
        response = await fetch('/api/extract', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          throw new Error('Extraction timed out after 5 minutes. Please try again or use a smaller file.')
        }
        if (fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('NetworkError')) {
          throw new Error('Network error: Could not connect to server. Please check your internet connection and try again.')
        }
        throw new Error(`Network error: ${fetchError.message || 'Failed to connect to server'}`)
      }

      // Parse JSON response
      try {
        extractionResult = await response.json()
      } catch (jsonError: any) {
        const text = await response.text()
        throw new Error(`Server returned invalid response: ${text.substring(0, 200)}`)
      }

      if (!response.ok) {
        // Handle insufficient tokens error
        if (response.status === 402 && extractionResult?.insufficientTokens) {
          setShowUpgradeModal(true)
          throw new Error(extractionResult.error || 'Insufficient tokens')
        }
        // Handle concurrent extraction error
        if (response.status === 429) {
          throw new Error(extractionResult?.error || 'Please wait for your current extraction to complete')
        }
        const errorMsg = extractionResult?.error || extractionResult?.message || `Server error (${response.status})`
        throw new Error(errorMsg)
      }

      const processingTime = Date.now() - extractionStartTime

      // Note: Tokens are deducted in the API route BEFORE extraction starts
      // We just need to log the usage here
      const isProUser = userProfile?.subscription_tier === 'pro'
      if (!isProUser) {
        // Log token usage (tokens already deducted in API)
        const { error: usageError } = await supabase
          .from('token_usage_log')
          .insert({
            user_id: currentUser.id,
            tokens_used: TOKENS_PER_EXTRACTION,
            document_id: document.id,
          })
        
        if (usageError) {
          console.error('Error logging token usage:', usageError)
        }
      }

      // Refresh user profile from context
      await refreshUser()

      // Note: Document status is already updated to 'completed' in the API route
      // This is a backup update in case the API update failed
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          status: 'completed',
          extracted_data: extractionResult.data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', document.id)

      if (updateError) {
        console.error('Error updating document (backup update):', updateError)
        // Don't show alert - API route should have already updated it
      }

      // Save extraction history
      const { error: historyError } = await supabase
        .from('extraction_history')
        .insert({
          document_id: document.id,
          extraction_result: extractionResult.data,
          extraction_time_ms: processingTime,
          model_used: selectedModel,
        })
      
      if (historyError) {
        console.error('Error saving extraction history:', historyError)
        // Don't throw, just log - extraction was successful
      }

      // Update file status in UI (use document.id since we updated it earlier)
      setUploadedFiles(files => 
        files.map(f => 
          f.id === document.id || f.id === fileId
            ? { ...f, status: 'completed' as const, result: extractionResult, id: document.id }
            : f
        )
      )

      setSelectedFile(null)
      setIsExtracting(false)
    } catch (error: any) {
      console.error('Extraction error:', error)
      setIsExtracting(false)
      
      // Update document status to failed in Supabase
      if (user) {
        try {
          const supabaseClient = createClient()
          // Get the most recent document for this file
          const { data: recentDocs } = await supabaseClient
            .from('documents')
            .select('id')
            .eq('file_name', selectedFile?.name || '')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
          
          if (recentDocs && recentDocs.length > 0) {
            await supabaseClient
              .from('documents')
              .update({
                status: 'failed',
                updated_at: new Date().toISOString(),
              })
              .eq('id', recentDocs[0].id)
          }
        } catch (supabaseError) {
          console.error('Error updating failed status:', supabaseError)
        }
      }
      
      // Get user-friendly error message
      let errorMessage = 'Failed to process document'
      if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error?.error) {
        errorMessage = error.error
      }
      
      // Update UI with error status (check both IDs in case document wasn't created)
      setUploadedFiles(files => 
        files.map(f => {
          // Find the file by temporary ID (document might not have been created)
          if (f.id === fileId) {
            return { ...f, status: 'failed' as const, error: errorMessage }
          }
          return f
        })
      )
      
      // Show user-friendly error alert
      if (errorMessage.includes('Insufficient tokens')) {
        setShowUpgradeModal(true)
      } else {
        alert(`❌ Extraction Failed\n\n${errorMessage}\n\nPlease check:\n• Your internet connection\n• API key is valid\n• File is not corrupted\n• Try again with a smaller file`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Get Started with
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              IntelliExtract
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            Upload your first document and see how easy it is to extract structured data with AI
          </p>
          
          {/* Token Balance Display */}
          {user ? (
            <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-blue-200 dark:border-gray-600">
              <Coins className="w-5 h-5 text-yellow-500" />
              <div className="text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400">Tokens Remaining</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userProfile?.tokens_remaining || 0}
                </p>
              </div>
              {(userProfile?.tokens_remaining || 0) < TOKENS_PER_EXTRACTION && (
                <div className="ml-4 px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Upgrade to Pro
                </div>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Sign up to get 20 free tokens and start extracting!
              </p>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Upload Your Document
            </h2>
            {!user && (
              <button
                onClick={() => setAuthMode('signup')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition text-sm"
              >
                Sign Up Free
              </button>
            )}
          </div>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:border-blue-500 transition">
            <div className="mb-4 flex justify-center">
              <Upload className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {selectedFile ? selectedFile.name : 'Select Document'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              Supports PDF, DOCX, PNG, JPG, TXT, HTML
            </p>
            <label className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg cursor-pointer hover:from-blue-700 hover:to-purple-700 transition mb-4">
              {selectedFile ? 'Change File' : 'Select File'}
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.docx,.png,.jpg,.jpeg,.txt,.html"
              />
            </label>
            {selectedFile && (
              <div className="mt-4">
                <button
                  onClick={handleExtract}
                  disabled={isExtracting || (!userProfile?.subscription_tier && (userProfile?.tokens_remaining || 0) < TOKENS_PER_EXTRACTION)}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Extract Data</span>
                    </>
                  )}
                </button>
                {isExtracting && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Please wait for this extraction to complete before starting another one.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Processing Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition ${
            selectedTemplate ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
          }`}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Use Template</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Choose from pre-built templates for invoices, bank statements, etc.
            </p>
            <select
              value={selectedTemplate || ''}
              onChange={(e) => {
                setSelectedTemplate(e.target.value || null)
                setUseAutoSchema(false)
              }}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600"
            >
              <option value="">Select Template...</option>
              <option value="invoice">Invoice</option>
              <option value="bank_statement">Bank Statement</option>
              <option value="drivers_license_uk">Driver&apos;s License (UK)</option>
            </select>
          </div>

          <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition ${
            useAutoSchema ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
          }`}>
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mb-3">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Auto Schema</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Let AI automatically generate the schema from your document.
            </p>
            <button 
              onClick={() => {
                setUseAutoSchema(!useAutoSchema)
                setSelectedTemplate(null)
              }}
              className={`w-full px-4 py-2 rounded-lg transition ${
                useAutoSchema
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {useAutoSchema ? 'Enabled' : 'Enable Auto Schema'}
            </button>
          </div>
        </div>

        {/* Files List */}
        <div id="files-list-section" className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-12">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Recent Documents</h2>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400">Loading documents...</p>
            </div>
          ) : uploadedFiles.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No documents processed yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Upload a file above to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        file.status === 'completed' 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                          : file.status === 'failed'
                          ? 'bg-gradient-to-br from-red-500 to-pink-500'
                          : 'bg-gradient-to-br from-blue-500 to-purple-500'
                      }`}>
                        {file.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : file.status === 'failed' ? (
                          <XCircle className="w-6 h-6 text-white" />
                        ) : (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{file.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(file.size / 1024).toFixed(2)} KB • {file.uploadedAt.toLocaleDateString()}
                        </p>
                        {file.error && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{file.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        file.status === 'processing' 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : file.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {file.status}
                      </span>
                      {file.status === 'completed' && file.result && (
                        <button 
                          onClick={() => setShowResults(showResults === file.id ? null : file.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>{showResults === file.id ? 'Hide' : 'View'} Results</span>
                        </button>
                      )}
                    </div>
                  </div>
                  {showResults === file.id && file.result && (
                    <ExtractedDataViewer 
                      data={file.result} 
                      fileName={file.name}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready for More?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Explore the full dashboard for advanced features, batch processing, and API integration
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
          >
            <span>Go to Full Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>

      <Footer />

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Insufficient Tokens
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                You have <strong>{userProfile?.tokens_remaining || 0} tokens</strong> remaining, but need <strong>{TOKENS_PER_EXTRACTION} tokens</strong> per extraction.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Upgrade to Pro</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Get unlimited extractions with Pro subscription
                </p>
                <a
                  href="/pricing"
                  className="block w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition text-center font-semibold"
                >
                  View Pricing Plans
                </a>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Maybe Later
              </button>
              <a
                href="/pricing"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition text-center font-semibold"
              >
                Upgrade Now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authMode !== null}
        onClose={() => setAuthMode(null)}
        mode={authMode || 'signup'}
        onAuthSuccess={async () => {
          setAuthMode(null)
          // Refresh auth context - wait a bit for profile to be created
          await new Promise(resolve => setTimeout(resolve, 1000))
          await refreshUser()
        }}
      />
    </div>
  )
}

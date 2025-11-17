import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

// Fix tesseract.js worker path resolution
if (typeof process !== 'undefined') {
  const path = require('path')
  const tesseractPath = path.join(process.cwd(), 'node_modules', 'tesseract.js')
  process.env.TESSERACT_JS_WORKER_PATH = path.join(tesseractPath, 'src', 'worker-script', 'node', 'index.js')
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const model = formData.get('model') as string || 'ollama/llama3.2'
    const template = formData.get('template') as string | null
    const autoSchema = formData.get('autoSchema') === 'true'
    const userId = formData.get('userId') as string
    const documentId = formData.get('documentId') as string | null // Document ID to exclude from concurrent check

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to extract documents.' },
        { status: 401 }
      )
    }

    // Check tokens and prevent concurrent extractions
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user has an active extraction (prevent concurrent extractions)
    // Exclude the current document ID if provided (to avoid false positives)
    let activeExtractionsQuery = supabase
      .from('documents')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'processing')
    
    // Exclude the current document from the check
    if (documentId) {
      activeExtractionsQuery = activeExtractionsQuery.neq('id', documentId)
    }
    
    const { data: activeExtractions } = await activeExtractionsQuery.limit(1)

    if (activeExtractions && activeExtractions.length > 0) {
      return NextResponse.json(
        { error: 'You already have an extraction in progress. Please wait for it to complete before starting a new one.' },
        { status: 429 }
      )
    }

    // Check user profile and tokens
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('tokens_remaining, subscription_tier')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to verify user account. Please try again.' },
        { status: 500 }
      )
    }

    const isProUser = profile?.subscription_tier === 'pro'
    const tokensRemaining = profile?.tokens_remaining || 0
    const TOKENS_PER_EXTRACTION = 10

    if (!isProUser && tokensRemaining < TOKENS_PER_EXTRACTION) {
      return NextResponse.json(
        { 
          error: `Insufficient tokens. You have ${tokensRemaining} tokens but need ${TOKENS_PER_EXTRACTION} per extraction. Please upgrade to Pro for unlimited extractions.`,
          insufficientTokens: true,
          tokensRemaining,
          tokensRequired: TOKENS_PER_EXTRACTION
        },
        { status: 402 }
      )
    }

    // Deduct tokens BEFORE extraction starts (to prevent race conditions)
    if (!isProUser) {
      const newTokenBalance = tokensRemaining - TOKENS_PER_EXTRACTION
      const { error: tokenUpdateError } = await supabase
        .from('user_profiles')
        .update({
          tokens_remaining: Math.max(0, newTokenBalance),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (tokenUpdateError) {
        console.error('Error deducting tokens:', tokenUpdateError)
        return NextResponse.json(
          { error: 'Failed to process token payment. Please try again.' },
          { status: 500 }
        )
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    // Sanitize filename to avoid issues with spaces and special characters
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${Date.now()}-${sanitizedName}`
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, buffer)
    
    // Verify file was written
    if (!existsSync(filePath)) {
      throw new Error('Failed to save file to disk')
    }

    try {
      let result: any

      // Check if using Ollama models (LOCAL/FREE - Best for privacy)
      if (model.startsWith('ollama/')) {
        // Use Ollama API (local or remote)
        const ollamaBaseUrl = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434'
        const modelName = model.replace('ollama/', '')
        
        // Read file and extract text
        const { readFile } = await import('fs/promises')
        const fileBuffer = await readFile(filePath)
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'pdf'
        
        // Extract text from document (Ollama works with text)
        let documentText = ''
        
        if (fileExtension === 'txt' || fileExtension === 'html') {
          documentText = fileBuffer.toString('utf-8')
        } else if (fileExtension === 'pdf') {
          // Extract text from PDF using pdf2json (pure Node.js, no browser APIs)
          try {
            const PDFParser = require('pdf2json')
            const pdfParser = new PDFParser(null, 1)
            
            // Parse PDF and extract text
            await new Promise<void>((resolve, reject) => {
              pdfParser.on('pdfParser_dataError', (errData: any) => {
                reject(new Error(`PDF parsing error: ${errData.parserError}`))
              })
              
              pdfParser.on('pdfParser_dataReady', () => {
                try {
                  const pdfData = pdfParser.getRawTextContent()
                  documentText = pdfData || ''
                  
                  if (!documentText || documentText.trim().length === 0) {
                    // Try alternative method
                    const allPages = pdfParser.getAllFieldsTypes()
                    if (allPages && allPages.length > 0) {
                      documentText = JSON.stringify(allPages)
                    } else {
                      throw new Error('PDF appears to be empty or image-based. OCR may be needed.')
                    }
                  }
                  
                  resolve()
                } catch (err: any) {
                  reject(err)
                }
              })
              
              // Parse the PDF buffer
              pdfParser.parseBuffer(fileBuffer)
            })
            
            if (!documentText || documentText.trim().length === 0) {
              throw new Error('PDF appears to be empty or image-based. OCR may be needed.')
            }
            
            console.log(`Extracted ${documentText.length} characters from PDF`)
          } catch (pdfError: any) {
            console.error('PDF parsing error:', pdfError)
            throw new Error(`Failed to extract text from PDF: ${pdfError.message}. The PDF may be corrupted or image-based.`)
          }
        } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension)) {
          // For images, we'd need OCR, but for now provide a note
          documentText = `[Image file: ${file.name}]\n\nThis is an image file. Please describe what you see and extract any visible structured data like text, numbers, tables, or forms.`
        } else {
          // Try to read as text
          try {
            documentText = fileBuffer.toString('utf-8')
          } catch {
            throw new Error(`Unsupported file type: ${fileExtension}. Please use PDF, TXT, HTML, or image files.`)
          }
        }

        if (!documentText || documentText.trim().length === 0) {
          throw new Error('Document appears to be empty or could not be read.')
        }

        // Build extraction prompt with better instructions
        let extractionPrompt = `You are a document extraction expert. Extract ALL structured data from the following document and return it as valid JSON only.

IMPORTANT INSTRUCTIONS:
1. Analyze the document carefully
2. Extract all relevant fields, values, dates, numbers, names, addresses, transactions, etc.
3. Return ONLY valid JSON - no explanations, no markdown, no code blocks
4. Structure the data logically (use nested objects/arrays as needed)
5. If this is a bank statement, extract: account number, dates, transactions (with amounts, descriptions, balances)
6. If this is an invoice, extract: invoice number, date, items, totals, vendor info
7. If this is an ID, extract: name, ID number, date of birth, address, etc.

${autoSchema ? 'Automatically detect the document type and extract all relevant fields.' : ''}
${template ? `Use this structure as a guide: ${template}` : ''}

Document content:
${documentText.substring(0, 12000)}`

        console.log('Starting Ollama extraction:', { 
          model: modelName,
          fileName: file.name,
          ollamaUrl: ollamaBaseUrl
        })

        // Call Ollama API
        const ollamaUrl = `${ollamaBaseUrl}/api/generate`
        
        const ollamaResponse = await fetch(ollamaUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: modelName,
            prompt: extractionPrompt,
            stream: false,
            options: {
              temperature: 0.1,
              num_predict: 4000,
            }
          }),
        })

        if (!ollamaResponse.ok) {
          const errorData = await ollamaResponse.json().catch(() => ({}))
          const errorMsg = errorData.error || `Ollama API error: ${ollamaResponse.status} ${ollamaResponse.statusText}`
          
          if (ollamaResponse.status === 404) {
            throw new Error(`Ollama model "${modelName}" not found. Make sure Ollama is running and the model is installed. Run: ollama pull ${modelName}`)
          }
          
          if (ollamaResponse.status === 0 || ollamaResponse.status === 500) {
            throw new Error(`Cannot connect to Ollama. Make sure Ollama is running at ${ollamaBaseUrl}. Install from: https://ollama.ai`)
          }
          
          throw new Error(errorMsg)
        }

        const ollamaData = await ollamaResponse.json()
        const extractedText = ollamaData.response || ollamaData.text || ''

        // Try to parse JSON from the response
        let extractedData: any
        try {
          // Remove markdown code blocks if present
          let jsonString = extractedText
          
          // Try to extract JSON from markdown code blocks
          const jsonMatch = extractedText.match(/```json\s*([\s\S]*?)\s*```/) || 
                           extractedText.match(/```\s*([\s\S]*?)\s*```/)
          
          if (jsonMatch) {
            jsonString = jsonMatch[1]
          } else {
            // Try to find JSON object/array in the text
            const jsonObjectMatch = extractedText.match(/\{[\s\S]*\}/) || extractedText.match(/\[[\s\S]*\]/)
            if (jsonObjectMatch) {
              jsonString = jsonObjectMatch[0]
            }
          }
          
          // Clean up the JSON string
          jsonString = jsonString.trim()
          
          // Remove any leading/trailing non-JSON text
          const firstBrace = jsonString.indexOf('{')
          const firstBracket = jsonString.indexOf('[')
          if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
            jsonString = jsonString.substring(firstBrace)
          } else if (firstBracket !== -1) {
            jsonString = jsonString.substring(firstBracket)
          }
          
          // Find the matching closing brace/bracket
          if (jsonString.startsWith('{')) {
            let depth = 0
            let endIndex = -1
            for (let i = 0; i < jsonString.length; i++) {
              if (jsonString[i] === '{') depth++
              if (jsonString[i] === '}') depth--
              if (depth === 0 && jsonString[i] === '}') {
                endIndex = i + 1
                break
              }
            }
            if (endIndex > 0) {
              jsonString = jsonString.substring(0, endIndex)
            }
          } else if (jsonString.startsWith('[')) {
            let depth = 0
            let endIndex = -1
            for (let i = 0; i < jsonString.length; i++) {
              if (jsonString[i] === '[') depth++
              if (jsonString[i] === ']') depth--
              if (depth === 0 && jsonString[i] === ']') {
                endIndex = i + 1
                break
              }
            }
            if (endIndex > 0) {
              jsonString = jsonString.substring(0, endIndex)
            }
          }
          
          extractedData = JSON.parse(jsonString)
          
          // Validate that we got actual data, not just an error message
          if (typeof extractedData === 'string' || 
              (typeof extractedData === 'object' && extractedData !== null && 
               Object.keys(extractedData).length === 0 && !Array.isArray(extractedData))) {
            throw new Error('Empty or invalid JSON response')
          }
        } catch (parseError: any) {
          console.error('JSON parsing error:', parseError)
          console.error('Raw response:', extractedText.substring(0, 500))
          
          // If parsing fails, try to extract any useful information
          // Check if the response contains useful data even if not valid JSON
          if (extractedText.toLowerCase().includes('account') || 
              extractedText.toLowerCase().includes('transaction') ||
              extractedText.toLowerCase().includes('balance') ||
              extractedText.toLowerCase().includes('invoice') ||
              extractedText.toLowerCase().includes('date')) {
            // Response seems to have relevant content, return it as text
            extractedData = { 
              text: extractedText, 
              raw: true,
              note: 'Could not parse as JSON, but response contains relevant content'
            }
          } else {
            // Response doesn't seem useful
            throw new Error(`Failed to extract structured data. Model response: ${extractedText.substring(0, 200)}`)
          }
        }

        result = {
          success: true,
          pages: 1,
          data: extractedData,
          fileName: file.name,
        }
      }
      // Check if using Gemini models (BEST FREE OPTION - Direct API)
      else if (model.startsWith('gemini-')) {
        // Use Gemini API directly (bypassing documind for reliability)
        const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
        if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
          throw new Error('Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file')
        }

        // Read file and convert to base64
        const { readFile } = await import('fs/promises')
        const fileBuffer = await readFile(filePath)
        const fileBase64 = fileBuffer.toString('base64')
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'pdf'
        
        // Determine MIME type
        const mimeTypes: Record<string, string> = {
          pdf: 'application/pdf',
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          txt: 'text/plain',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          html: 'text/html',
        }
        const mimeType = mimeTypes[fileExtension] || 'application/pdf'

        // Build extraction prompt
        let extractionPrompt = 'Extract all structured data from this document and return it as valid JSON. '
        if (autoSchema) {
          extractionPrompt += 'Automatically detect the document structure and extract all relevant fields. '
        }
        if (template) {
          extractionPrompt += `Use the following template structure: ${template}. `
        }
        extractionPrompt += 'Return only valid JSON, no additional text or explanation.'

        // MAP MODEL NAMES → CURRENT GEMINI 2.X MODELS (Nov 2025)
        // Gemini 1.5 models are deprecated - use Gemini 2.x instead
        const modelMap: Record<string, string> = {
          'gemini-1.5-flash': 'gemini-2.0-flash-exp',     // Use 2.0 Flash (free, fast)
          'gemini-1.5-pro': 'gemini-2.0-flash-exp',       // Fallback to 2.0 Flash
          'gemini-pro': 'gemini-2.0-flash-exp',           // Fallback to 2.0 Flash
          'gemini-2.0-flash': 'gemini-2.0-flash-exp',     // Direct 2.0 Flash
          'gemini-2.5-flash': 'gemini-2.5-flash',         // 2.5 Flash if available
        }
        const apiModelName = modelMap[model] || model

        console.log('Starting Gemini extraction (direct API):', { 
          originalModel: model,
          apiModelName: apiModelName,
          fileType: mimeType,
          fileName: file.name
        })

        // Try v1 first (new stable endpoint), then v1beta as fallback
        // Use Gemini 2.x models which are currently available
        const endpoints = [
          `https://generativeai.googleapis.com/v1/models/${apiModelName}:generateContent`,
          `https://generativeai.googleapis.com/v1beta/models/${apiModelName}:generateContent`,
          `https://generativeai.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent`,
          `https://generativeai.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`,
        ]

        let geminiResponse: Response | undefined
        let usedUrl = ''

        for (const url of endpoints) {
          try {
            const fullUrl = `${url}?key=${geminiApiKey}`
            usedUrl = fullUrl

            const requestBody: any = {
              contents: [{ parts: [] }],
              generationConfig: { 
                temperature: 0.1, 
                maxOutputTokens: 4000 
              },
            }

            requestBody.contents[0].parts.push({ text: extractionPrompt })

            if (fileExtension === 'txt' || fileExtension === 'html') {
              const textContent = fileBuffer.toString('utf-8')
              requestBody.contents[0].parts.push({ 
                text: `\n\nDocument content:\n${textContent}` 
              })
            } else {
              requestBody.contents[0].parts.push({
                inline_data: { 
                  mime_type: mimeType, 
                  data: fileBase64 
                }
              })
            }

            geminiResponse = await fetch(fullUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody),
            })

            if (geminiResponse.ok) {
              console.log('✅ Gemini success with:', url)
              break
            }
          } catch (e) {
            console.log(`Failed to try ${url}, continuing...`)
            continue
          }
        }

        if (!geminiResponse || !geminiResponse.ok) {
          const errorData = await geminiResponse?.json().catch(() => ({}))
          console.error('Gemini API error details:', {
            status: geminiResponse?.status,
            url: usedUrl,
            errorData,
          })

          if (geminiResponse?.status === 401 || geminiResponse?.status === 403) {
            throw new Error('Gemini API key error: Please check your API key in .env.local file.')
          }

          throw new Error(
            `Gemini model "${model}" not accessible. Try using "gemini-2.0-flash-exp" directly or check your API key region/quota. Error: ${geminiResponse?.status || 'Network error'}`
          )
        }

        const geminiData = await geminiResponse.json()
        const extractedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

        let extractedData: any
        try {
          const jsonMatch = extractedText.match(/```json\s*([\s\S]*?)\s*```/) || extractedText.match(/```\s*([\s\S]*?)\s*```/)
          const jsonString = jsonMatch ? jsonMatch[1] : extractedText
          extractedData = JSON.parse(jsonString.trim())
        } catch {
          extractedData = { text: extractedText, raw: true }
        }

        result = {
          success: true,
          pages: 1,
          data: extractedData,
          fileName: file.name,
        }
      }
      // Check if using Hugging Face models
      else if (model.startsWith('huggingface/')) {
        // Use Hugging Face Inference API (FREE)
        const huggingFaceApiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || ''
        
        // Read file and convert to base64
        const { readFile } = await import('fs/promises')
        const fileBuffer = await readFile(filePath)
        const fileBase64 = fileBuffer.toString('base64')
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'pdf'
        
        // For PDFs, we need to extract text first or use a vision model
        // Using a text-based model, so we'll extract text from PDF
        let documentText = ''
        
        if (fileExtension === 'pdf') {
          // For PDF, we'll use a simple approach - convert to text
          // In production, you'd use pdf-parse or similar
          documentText = `[PDF Document: ${file.name}]`
        } else if (fileExtension === 'txt' || fileExtension === 'html') {
          documentText = fileBuffer.toString('utf-8')
        } else {
          // For images, use base64
          documentText = `[Image: ${file.name}]`
        }

        // Build extraction prompt
        let extractionPrompt = 'Extract all structured data from this document and return it as valid JSON. '
        if (autoSchema) {
          extractionPrompt += 'Automatically detect the document structure and extract all relevant fields. '
        }
        if (template) {
          extractionPrompt += `Use the following template structure: ${template}. `
        }
        extractionPrompt += 'Return only valid JSON, no additional text or explanation.\n\nDocument content:\n' + documentText.substring(0, 4000)

        // Extract model name from huggingface/model-path format
        const modelName = model.replace('huggingface/', '')
        
        console.log('Starting Hugging Face extraction:', { 
          model: modelName,
          fileName: file.name
        })

        // Call Hugging Face Inference API
        // Try multiple endpoint formats for compatibility
        // Format 1: Router endpoint (new)
        let hfUrl = `https://router.huggingface.co/hf-inference/models/${modelName}`
        
        // For some models, we might need to use the standard endpoint
        // The router endpoint format might be different - try both
        const alternativeUrl = `https://api-inference.huggingface.co/models/${modelName}`
        
        const headers: any = {
          'Content-Type': 'application/json',
        }
        
        // Add API key if provided (required for better rate limits and private models)
        if (huggingFaceApiKey && huggingFaceApiKey !== 'your_huggingface_api_key_here') {
          headers['Authorization'] = `Bearer ${huggingFaceApiKey}`
        }

        let hfResponse = await fetch(hfUrl, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            inputs: extractionPrompt,
            parameters: {
              max_new_tokens: 2000,
              temperature: 0.1,
              return_full_text: false
            }
          }),
        })

        // If router endpoint fails with 404/410, try alternative endpoint
        if (!hfResponse.ok && (hfResponse.status === 404 || hfResponse.status === 410)) {
          console.log(`Router endpoint failed, trying alternative endpoint for ${modelName}`)
          hfResponse = await fetch(alternativeUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              inputs: extractionPrompt,
              parameters: {
                max_new_tokens: 2000,
                temperature: 0.1,
                return_full_text: false
              }
            }),
          })
        }

        if (!hfResponse.ok) {
          const errorData = await hfResponse.json().catch(() => ({}))
          let errorMsg = errorData.error || errorData.message || `Hugging Face API error: ${hfResponse.status} ${hfResponse.statusText}`
          
          if (hfResponse.status === 503) {
            throw new Error('Model is loading. Please wait 10-20 seconds and try again.')
          }
          
          if (hfResponse.status === 404) {
            errorMsg = `Model "${modelName}" not found or not available via Hugging Face Inference API. Some models require special access. Try: Mistral 7B or Llama 2 7B.`
          }
          
          if (hfResponse.status === 410 || errorMsg.includes('no longer supported')) {
            errorMsg = `API endpoint issue. The model "${modelName}" may not be available. Try a different model.`
          }
          
          // Log full error for debugging
          console.error('Hugging Face API error details:', {
            status: hfResponse.status,
            statusText: hfResponse.statusText,
            errorData,
            model: modelName,
            routerUrl: hfUrl,
            alternativeUrl: alternativeUrl
          })
          
          throw new Error(errorMsg)
        }

        const hfData = await hfResponse.json()
        
        // Hugging Face returns different formats depending on the model
        let extractedText = ''
        if (Array.isArray(hfData) && hfData[0]?.generated_text) {
          extractedText = hfData[0].generated_text
        } else if (hfData.generated_text) {
          extractedText = hfData.generated_text
        } else if (typeof hfData === 'string') {
          extractedText = hfData
        } else {
          extractedText = JSON.stringify(hfData)
        }

        // Try to parse JSON from the response
        let extractedData: any
        try {
          const jsonMatch = extractedText.match(/```json\s*([\s\S]*?)\s*```/) || extractedText.match(/```\s*([\s\S]*?)\s*```/)
          const jsonString = jsonMatch ? jsonMatch[1] : extractedText
          extractedData = JSON.parse(jsonString.trim())
        } catch (parseError) {
          // If JSON parsing fails, return the raw text
          extractedData = { text: extractedText, raw: true, model: modelName }
        }

        result = {
          success: true,
          pages: 1,
          data: extractedData,
          fileName: file.name,
        }
      }
      // Check if using OpenAI GPT models
      else if (model.startsWith('gpt-')) {
        // Use OpenAI API directly
        const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
        if (!openaiApiKey || openaiApiKey === 'your_openai_api_key_here') {
          throw new Error('OpenAI API key not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file')
        }

        // Read file and convert to base64 for OpenAI API
        const { readFile } = await import('fs/promises')
        const fileBuffer = await readFile(filePath)
        const fileBase64 = fileBuffer.toString('base64')
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'pdf'
        
        // Determine MIME type
        const mimeTypes: Record<string, string> = {
          pdf: 'application/pdf',
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          txt: 'text/plain',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          html: 'text/html',
        }
        const mimeType = mimeTypes[fileExtension] || 'application/pdf'

        // Build extraction prompt
        let extractionPrompt = 'Extract all structured data from this document and return it as valid JSON. '
        if (autoSchema) {
          extractionPrompt += 'Automatically detect the document structure and extract all relevant fields. '
        }
        if (template) {
          extractionPrompt += `Use the following template structure: ${template}. `
        }
        extractionPrompt += 'Return only valid JSON, no additional text or explanation.'

        console.log('Starting OpenAI extraction:', { 
          model: model,
          fileType: mimeType,
          fileName: file.name
        })

        // Call OpenAI API
        const openaiUrl = 'https://api.openai.com/v1/chat/completions'
        
        const messages: any[] = [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: extractionPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${fileBase64}`
                }
              }
            ]
          }
        ]

        // For text files, use text content instead of image
        if (fileExtension === 'txt' || fileExtension === 'html') {
          const textContent = fileBuffer.toString('utf-8')
          messages[0].content = [
            {
              type: 'text',
              text: `${extractionPrompt}\n\nDocument content:\n${textContent}`
            }
          ]
        }

        const openaiResponse = await fetch(openaiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.1,
            max_tokens: 4000,
          }),
        })

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.json().catch(() => ({}))
          const errorMsg = errorData.error?.message || `OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}`
          
          if (openaiResponse.status === 401 || openaiResponse.status === 403) {
            throw new Error('OpenAI API key error: Please check your API key in .env.local file.')
          }
          
          throw new Error(errorMsg)
        }

        const openaiData = await openaiResponse.json()
        const extractedText = openaiData.choices?.[0]?.message?.content || ''

        // Try to parse JSON from the response
        let extractedData: any
        try {
          // Try to extract JSON from the response (might be wrapped in markdown code blocks)
          const jsonMatch = extractedText.match(/```json\s*([\s\S]*?)\s*```/) || extractedText.match(/```\s*([\s\S]*?)\s*```/)
          const jsonString = jsonMatch ? jsonMatch[1] : extractedText
          extractedData = JSON.parse(jsonString.trim())
        } catch (parseError) {
          // If JSON parsing fails, return the raw text
          extractedData = { text: extractedText, raw: true }
        }

        result = {
          success: true,
          pages: 1,
          data: extractedData,
          fileName: file.name,
        }
      } else {
        // Use Gemini via documind
        const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
        if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
          throw new Error('Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file')
        }

        // Set the API key in environment for documind
        process.env.GEMINI_API_KEY = geminiApiKey

      // Prepare extraction options
        // Documind expects file as an HTTP URL (not a file path)
        // Create a temporary HTTP URL to serve the file
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
          (request.headers.get('host') ? `http://${request.headers.get('host')}` : 'http://localhost:3000')
        const fileUrl = `${baseUrl}/api/temp-file/${fileName}`
        
      const extractOptions: any = {
          file: fileUrl, // HTTP URL that documind can access
        model: model,
      }

        // Add template or autoSchema (required by documind)
      if (template) {
        extractOptions.template = template
      } else if (autoSchema) {
        extractOptions.autoSchema = true
        } else {
          // Default to autoSchema if nothing is specified
        extractOptions.autoSchema = true
      }

        console.log('Starting extraction with options:', { 
          model: extractOptions.model,
          template: extractOptions.template,
          autoSchema: extractOptions.autoSchema,
          fileUrl: fileUrl 
        })

        // Import extract function from documind (matching the sample pattern)
        const { extract } = await import('documind')

      // Call the extraction function from documind
        try {
          result = await extract(extractOptions)
        } catch (extractErr: any) {
          console.error('Documind extraction error:', extractErr)
          
          // Handle destructure errors (documind internal error)
          if (extractErr.message?.includes('Cannot destructure') || extractErr.message?.includes('markdown')) {
            throw new Error('Document processing failed: The document could not be processed. Try using OpenAI GPT models instead, or check if the file is readable.')
          }
          
          // Handle network errors
          if (extractErr.message?.includes('ENOTFOUND') || extractErr.message?.includes('getaddrinfo')) {
            throw new Error('Network error: Cannot connect to Gemini API. Please check your internet connection and try again. Consider using OpenAI GPT models instead.')
          }
          
          // Handle API key errors
          if (extractErr.message?.includes('API key') || extractErr.message?.includes('401') || extractErr.message?.includes('403')) {
            throw new Error('API key error: Please check your Gemini API key in .env.local file.')
          }
          
          // Handle generic documind errors
          if (extractErr.message?.includes('Failed to process')) {
            throw new Error('Document processing failed. The file may be corrupted or in an unsupported format. Try using OpenAI GPT models instead.')
          }
          
          throw new Error(`Extraction failed: ${extractErr.message || 'Unknown error'}. Try using OpenAI GPT models (GPT-4o) instead.`)
        }

        // Handle undefined or invalid results
        if (!result) {
          console.error('Extraction returned undefined result')
          throw new Error('Extraction failed: No result returned. Please check your internet connection and API key. Try using OpenAI GPT models instead.')
        }

        // Check if result has any useful data
        if (!result.data && !result.markdown && !result.text) {
          console.error('Invalid extraction result (no data, markdown, or text):', result)
          throw new Error('Extraction returned empty result. The document may be unreadable or the API request failed. Try using OpenAI GPT models instead.')
        }
        
        // If result exists but doesn't have expected structure, try to extract what we can
        if (!result.data && (result.markdown || result.text)) {
          result.data = { text: result.markdown || result.text, extracted: true }
        }
      }

      const processingTime = Date.now() - startTime

      // Clean up: delete temporary file
      try {
        await unlink(filePath)
      } catch (error) {
        console.error('Error deleting temp file:', error)
      }

      // Format response to match expected structure
      // Both OpenAI and Documind return: { success, pages, data, fileName, markdown? }
      const response = {
        success: result.success !== false,
        pages: result.pages || 1,
        // Use data if available, otherwise try to extract from markdown or use the whole result
        data: result.data || (result.markdown ? { text: result.markdown } : result),
        fileName: result.fileName || file.name,
        markdown: result.markdown || undefined,
      }

      return NextResponse.json(response)
    } catch (extractError: any) {
      // Clean up on error
      try {
        await unlink(filePath)
      } catch (error) {
        console.error('Error deleting temp file:', error)
      }

      // Refund tokens if extraction failed (only if tokens were deducted)
      if (!isProUser && userId) {
        try {
          // Get current token balance and refund
          const { data: currentProfile } = await supabase
            .from('user_profiles')
            .select('tokens_remaining')
            .eq('id', userId)
            .single()
          
          if (currentProfile) {
            const { error: refundError } = await supabase
              .from('user_profiles')
              .update({
                tokens_remaining: (currentProfile.tokens_remaining || 0) + TOKENS_PER_EXTRACTION,
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId)
            
            if (refundError) {
              console.error('Error refunding tokens:', refundError)
            } else {
              console.log('Tokens refunded due to extraction failure')
            }
          }
        } catch (refundErr) {
          console.error('Exception refunding tokens:', refundErr)
        }
      }

      throw extractError
    }
  } catch (error: any) {
    console.error('Extraction error:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process document',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

'use client'

import { Brain, Crown, Sparkles } from 'lucide-react'

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
}

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const models = [
    { 
      id: 'ollama/llama3.2', 
      name: 'Llama 3.2 (Ollama)', 
      provider: 'Ollama',
      pricing: 'free',
      badge: 'Best (Local)'
    },
    { 
      id: 'ollama/mistral', 
      name: 'Mistral (Ollama)', 
      provider: 'Ollama',
      pricing: 'free',
      badge: 'Free (Local)'
    },
    { 
      id: 'ollama/qwen2.5', 
      name: 'Qwen 2.5 (Ollama)', 
      provider: 'Ollama',
      pricing: 'free',
      badge: 'Free (Local)'
    },
    { 
      id: 'gemini-2.0-flash', 
      name: 'Gemini 2.0 Flash', 
      provider: 'Google',
      pricing: 'free',
      badge: 'Free (Cloud)'
    },
  ]

  return (
    <div>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select AI Model</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Choose the model for extraction</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={`p-4 rounded-xl border-2 transition text-left relative ${
              selectedModel === model.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {/* Pricing Badge */}
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
              model.pricing === 'free'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }`}>
              {model.pricing === 'free' ? (
                <Sparkles className="w-3 h-3" />
              ) : (
                <Crown className="w-3 h-3" />
              )}
              <span>{model.badge}</span>
            </div>
            
            <div className="font-semibold text-gray-900 dark:text-white mb-1 pr-16">{model.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{model.provider}</div>
          </button>
        ))}
      </div>
    </div>
  )
}



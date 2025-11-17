declare module 'documind' {
  export interface ExtractOptions {
    file: string
    model?: string
    template?: string
    autoSchema?: boolean
  }

  export interface ExtractResult {
    success?: boolean
    data?: any
    fileName?: string
    pages?: number
    markdown?: string
  }

  export function extract(options: ExtractOptions): Promise<ExtractResult>
}


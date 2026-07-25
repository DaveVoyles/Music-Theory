import type {
  SongAnalysis,
  SongAnalysisSummary,
  SongAnalyzerProvider,
} from './types'

export interface HttpProviderOptions {
  /**
   * Public gateway base URL only — never an API key.
   * Example: `http://127.0.0.1:8080` or a user-entered proxy.
   */
  baseUrl: string
  /** Optional fetch impl for tests. */
  fetchImpl?: typeof fetch
}

/**
 * Stub HTTP provider. Builds requests against a configurable base URL
 * without embedding secrets in the client bundle.
 */
export class HttpProvider implements SongAnalyzerProvider {
  private readonly baseUrl: string
  private readonly fetchImpl: typeof fetch

  constructor(options: HttpProviderOptions) {
    if (!options.baseUrl.trim()) {
      throw new Error('HttpProvider requires a non-empty baseUrl')
    }
    this.baseUrl = options.baseUrl.replace(/\/$/, '')
    this.fetchImpl = options.fetchImpl ?? fetch.bind(globalThis)
  }

  /** Exposed for tests — proves no secret is required to build URLs. */
  buildSearchUrl(query: string): string {
    const u = new URL(`${this.baseUrl}/analyze/search`)
    if (query) u.searchParams.set('q', query)
    return u.toString()
  }

  buildAnalysisUrl(id: string): string {
    return `${this.baseUrl}/analyze/${encodeURIComponent(id)}`
  }

  async search(query: string): Promise<SongAnalysisSummary[]> {
    const res = await this.fetchImpl(this.buildSearchUrl(query))
    if (!res.ok) throw new Error(`HttpProvider search failed: ${res.status}`)
    return (await res.json()) as SongAnalysisSummary[]
  }

  async getAnalysis(id: string): Promise<SongAnalysis> {
    const res = await this.fetchImpl(this.buildAnalysisUrl(id))
    if (!res.ok) throw new Error(`HttpProvider getAnalysis failed: ${res.status}`)
    return (await res.json()) as SongAnalysis
  }
}

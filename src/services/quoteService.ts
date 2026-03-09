import api from './api'

type QuoteResponse = { result: string; data: string[] }

export type Quote = { id: number; text: string }

export type QuotesNormalized = {
  ids: number[]
  entities: Record<number, Quote>
}

function normalizeQuotes(data: string[]): QuotesNormalized {
  const entities: Record<number, Quote> = {}
  const ids = data.map((text, index) => {
    const id = index + 1
    entities[id] = { id, text }
    return id
  })
  return { ids, entities }
}

export async function getQuotes(): Promise<QuotesNormalized> {
  const response = await api.get<QuoteResponse>('/v1/quotes')
  console.log('[quotes] status', response.status)
  console.log('[quotes] response.data', response.data)
  console.log('[quotes] response.data.data', response.data.data)

  return normalizeQuotes(response.data.data ?? [])
}

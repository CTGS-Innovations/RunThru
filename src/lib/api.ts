// Use relative URLs - Next.js API routes will proxy to backend
const API_BASE_URL = ''

export const apiConfig = {
  baseURL: API_BASE_URL,
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new APIError(
      errorData.message || 'Request failed',
      response.status,
      errorData
    )
  }

  return response.json()
}

export const api = {
  // Scripts
  scripts: {
    list: () => fetchAPI('/api/scripts'),
    getById: (id: string) => fetchAPI(`/api/scripts/${id}`),
    create: (markdown: string) =>
      fetchAPI('/api/scripts', {
        method: 'POST',
        body: JSON.stringify({ markdown }),
      }),
    delete: (id: string) =>
      fetchAPI(`/api/scripts/${id}`, { method: 'DELETE' }),
  },

  // Sessions
  sessions: {
    create: (data: {
      scriptId: string
      userRole: string[]
      voiceAssignments: Record<string, string>
      ttsEngine: string
    }) =>
      fetchAPI('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getById: (id: string) => fetchAPI(`/api/sessions/${id}`),
  },

  // Audio
  audio: {
    getUrl: (scriptId: string, lineId: string) =>
      `/api/audio/${scriptId}/${lineId}`,
  },
}

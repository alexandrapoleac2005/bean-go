import { DEMO_AVAILABLE, isDemoOn } from '../demo/config'
import type { ApiErrorResponse, Page } from './types'

// In dev, Vite proxies /api to the Spring backend (see vite.config.ts), so the
// default base is same-origin. The backend has no CORS config, so set
// VITE_API_BASE_URL only if the API is served from the same origin or CORS is added.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

// ---------- Token storage ----------

const TOKEN_KEY = 'beango.token'

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

// The auth context subscribes to this so a 401 anywhere signs the user out.
type UnauthorizedListener = (message: string) => void
const unauthorizedListeners = new Set<UnauthorizedListener>()
export function onUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListeners.add(listener)
  return () => {
    unauthorizedListeners.delete(listener)
  }
}

// ---------- Errors ----------

export class ApiError extends Error {
  readonly status: number // 0 means the request never reached the server
  readonly error: string
  readonly path: string
  readonly fieldErrors: Record<string, string>

  constructor(body: ApiErrorResponse) {
    super(body.message || body.error || 'Request failed')
    this.name = 'ApiError'
    this.status = body.status
    this.error = body.error
    this.path = body.path
    this.fieldErrors = parseFieldErrors(body.message)
  }

  get isUnauthorized() {
    return this.status === 401
  }
  get isForbidden() {
    return this.status === 403
  }
  get isNotFound() {
    return this.status === 404
  }
  get isConflict() {
    return this.status === 409
  }
  get isValidation() {
    return this.status === 400
  }
}

// GlobalExceptionHandler joins bean-validation errors as "field: msg, field: msg".
// Split them back out so forms can show each message next to its input.
function parseFieldErrors(message: string | undefined): Record<string, string> {
  const result: Record<string, string> = {}
  if (!message) return result
  for (const part of message.split(/,\s(?=[A-Za-z_][\w.[\]]*:\s)/)) {
    const match = /^([A-Za-z_][\w.[\]]*):\s(.+)$/.exec(part.trim())
    if (match) result[match[1]] = match[2]
  }
  return result
}

// ---------- Request core ----------

type Query = Record<string, string | number | boolean | null | undefined>

interface RequestOptions {
  query?: Query
  body?: unknown
  signal?: AbortSignal
  auth?: boolean // attach the bearer token; default true
}

function buildUrl(path: string, query?: Query) {
  const url = `${BASE_URL}${path}`
  if (!query) return url
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `${url}?${qs}` : url
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { query, body, signal, auth = true } = options
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = auth ? tokenStore.get() : null
  if (token) headers.Authorization = `Bearer ${token}`

  // Demo mode: answer from the in-browser mock backend instead of the network.
  // DEMO_AVAILABLE is a build-time constant, so production builds drop this branch.
  if (DEMO_AVAILABLE && isDemoOn()) return demoRequest<T>(method, path, { query, body, token })

  let response: Response
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause
    throw new ApiError({
      timestamp: new Date().toISOString(),
      status: 0,
      error: 'Network Error',
      message: 'Could not reach the Bean&Go server.',
      path,
    })
  }

  if (!response.ok) {
    const error = new ApiError(await readErrorBody(response, path))
    if (error.isUnauthorized && token) {
      unauthorizedListeners.forEach((listener) => listener(error.message))
    }
    throw error
  }

  // 201/204 endpoints return no body
  if (response.status === 204) return undefined as T
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

async function readErrorBody(response: Response, path: string): Promise<ApiErrorResponse> {
  try {
    const body = (await response.json()) as Partial<ApiErrorResponse>
    return {
      timestamp: body.timestamp ?? new Date().toISOString(),
      status: body.status ?? response.status,
      error: body.error ?? response.statusText,
      message: body.message ?? response.statusText,
      path: body.path ?? path,
    }
  } catch {
    return {
      timestamp: new Date().toISOString(),
      status: response.status,
      error: response.statusText,
      message: response.statusText || `Request failed with status ${response.status}`,
      path,
    }
  }
}

async function demoRequest<T>(
  method: string,
  path: string,
  req: { query?: Query; body?: unknown; token: string | null },
): Promise<T> {
  const { mockFetch, MockHttpError } = await import('../demo/mockServer')
  try {
    return (await mockFetch(method, path, req)) as T
  } catch (e) {
    if (!(e instanceof MockHttpError)) throw e
    const error = new ApiError({ timestamp: new Date().toISOString(), status: e.status, error: e.error, message: e.message, path })
    if (error.isUnauthorized && req.token) unauthorizedListeners.forEach((listener) => listener(error.message))
    throw error
  }
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T = void>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('DELETE', path, options),
}

// ---------- Page normalization ----------

// Spring can serialize Page<T> two ways:
//   direct (PageImpl): { content, number, size, totalElements, totalPages, first, last, ... }
//   via DTO (PagedModel): { content, page: { number, size, totalElements, totalPages } }
interface RawPage<T> {
  content: T[]
  number?: number
  size?: number
  totalElements?: number
  totalPages?: number
  first?: boolean
  last?: boolean
  page?: { number: number; size: number; totalElements: number; totalPages: number }
}

export function normalizePage<T>(raw: RawPage<T>): Page<T> {
  const meta = raw.page ?? raw
  const page = meta.number ?? 0
  const totalPages = meta.totalPages ?? 1
  return {
    content: raw.content ?? [],
    page,
    size: meta.size ?? raw.content?.length ?? 0,
    totalElements: meta.totalElements ?? raw.content?.length ?? 0,
    totalPages,
    first: raw.first ?? page === 0,
    last: raw.last ?? page >= totalPages - 1,
  }
}

export async function getPage<T>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<Page<T>> {
  return normalizePage(await http.get<RawPage<T>>(path, options))
}

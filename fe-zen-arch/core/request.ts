import { InternalError } from './utils'

const defaultTimeout = 60 * 1000 // 60 sec (in ms)

export type RequestInterceptor = (request: RequestConfig) => RequestConfig | Promise<RequestConfig>
export type ResponseInterceptor = <T>(response: HttpResponse<T>) => HttpResponse<T> | Promise<HttpResponse<T>>
export type ErrorInterceptor = (error: any) => Promise<any>

interface AddInterceptorsParams {
  onRequest?: RequestInterceptor
  onResponse?: ResponseInterceptor
  onError?: ErrorInterceptor
}

// Global interceptors
let onRequest: RequestInterceptor | undefined
let onResponse: ResponseInterceptor | undefined
let onError: ErrorInterceptor | undefined

export function addInterceptors(params: AddInterceptorsParams): void {
  if (import.meta.env.PROD && (onRequest != null || onResponse != null || onError != null)) {
    console.warn('interceptors already added')
    return
  }
  onRequest = params.onRequest
  onResponse = params.onResponse
  onError = params.onError
}

export async function request<T>(requestConfig: RequestConfig): Promise<HttpResponse<T>> {
  let req = requestConfig

  // Apply request interceptors
  if (onRequest != null) req = await onRequest(req)

  // Extract config values
  const { query, method: finalMethod, url: finalUrl } = req
  const headers: HttpHeader = req.headers ?? ({} as HttpHeader)

  // Build URL with query parameters
  const queryParams = query != null ? `?${new URLSearchParams(query).toString()}` : null
  const fullURL = queryParams == null ? finalUrl : `${finalUrl}${queryParams}`

  // Create AbortController for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), req.timeout ?? defaultTimeout)

  headers['Content-Type'] ??= 'application/json'

  let resp: HttpResponse<T> | undefined

  try {
    const response = await fetch(fullURL, {
      method: finalMethod,
      headers,
      signal: controller.signal,
      body: typeof req.body == 'object' ? JSON.stringify(req.body) : req.body,
      credentials: req.credentials ?? 'include'
    })

    clearTimeout(timeoutId)
    const data = response.status == 204 ? null : await response.json()
    if (!response.ok) {
      if (typeof data == 'object') throw new InternalError(data.message, response.status, data.description)
      throw new InternalError(data as string, response.status)
    }

    resp = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as unknown as HttpHeader
    }

    // Apply response interceptors
    if (onResponse != null) resp = await onResponse(resp)

    return resp
  } catch (originalError: any) {
    let error = originalError

    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      error = new InternalError(`Request timeout after ${(req.timeout ?? defaultTimeout) / 1000}sec`, 408)
    }

    // Process request interceptor errors
    if (onError != null) await onError(error)
    return Promise.reject(error)
  }
}

// HTTP method functions
export async function get<T>(url: string, config?: BaseRequestConfig): Promise<T> {
  const { data } = await request<T>({ method: 'GET', url, ...config })
  return data
}

export function getRaw<T>(url: string, config?: BaseRequestConfig): Promise<HttpResponse<T>> {
  return request<T>({ method: 'GET', url, ...config })
}

export async function post<T>(url: string, data?: any, config?: BaseRequestConfig): Promise<T> {
  const { data: resData } = await request<T>({ method: 'POST', url, body: data, ...config })
  return resData
}

export function postRaw<T>(url: string, data?: any, config?: BaseRequestConfig): Promise<HttpResponse<T>> {
  return request<T>({ method: 'POST', url, body: data, ...config })
}

export async function put<T>(url: string, data?: any, config?: BaseRequestConfig): Promise<T> {
  const { data: resData } = await request<T>({ method: 'PUT', url, body: data, ...config })
  return resData
}

export function putRaw<T>(url: string, data?: any, config?: BaseRequestConfig): Promise<HttpResponse<T>> {
  return request<T>({ method: 'PUT', url, body: data, ...config })
}

export async function deletes<T>(url: string, config?: BaseRequestConfig): Promise<T> {
  const { data } = await request<T>({ method: 'DELETE', url, ...config })
  return data
}

export function deletesRaw<T>(url: string, config?: BaseRequestConfig): Promise<HttpResponse<T>> {
  return request<T>({ method: 'DELETE', url, ...config })
}

export function basicAuth(username: string, password: string): string {
  return `Basic ${btoa(`${username}:${password}`)}`
}

export interface BaseRequestConfig {
  headers?: HttpHeader
  timeout?: number
  query?: Record<string, string>
  method?: string
  credentials?: RequestCredentials
}

export interface RequestConfig<T = any> extends BaseRequestConfig {
  method: string
  url: string
  body?: T
}

export interface HttpResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: HttpHeader
}

type HttpHeaderKey =
  | 'Accept'
  | 'User-Agent'
  | 'Authorization'
  | 'Content-Type'
  | 'Cookie'
  | 'Cache-Control'
  | 'Accept-Language'
  | 'Accept-Encoding'
  | 'Connection'
  | 'Content-Encoding'
  | 'Keep-Alive'

type HttpHeader = Partial<Record<HttpHeaderKey, string>>

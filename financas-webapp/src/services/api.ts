import type { RootState } from '../app/store'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

let getState: (() => RootState) | undefined

export function injectStoreState(fn: () => RootState) {
  getState = fn
}

type RequestOptions = RequestInit & { auth?: boolean }

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getState?.().auth.token
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth !== false && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!response.ok) {
    let message = 'Não foi possível concluir a operação.'
    try {
      const error = await response.json()
      message = error.message ?? error.error ?? message
    } catch {
      if (response.status === 401) message = 'Usuário ou senha inválidos.'
      if (response.status === 403) message = 'Você não tem permissão para acessar este recurso.'
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

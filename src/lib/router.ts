import { writable } from 'svelte/store'

export const currentRoute = writable('/')
export const navigate = (path: string) => {
  window.location.href = path
}
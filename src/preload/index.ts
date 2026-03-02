import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { LoginInput } from '../shared/schemas/authSchema'
import { CreateUserInput, UpdateUserInput } from '@shared/schemas/userSchema'
import { CreateClientInput, UpdateClientInput } from '../shared/schemas/clientSchema'

// Api typée
const api = {
  auth: {
    login: (data: LoginInput) => ipcRenderer.invoke('auth:login', data),
    logout: () => ipcRenderer.invoke('auth:logout')
  },
  users: {
    getAll: () => ipcRenderer.invoke('users:get-all'),
    create: (data: CreateUserInput) => ipcRenderer.invoke('users:create', data),
    update: (data: UpdateUserInput) => ipcRenderer.invoke('users:update', data),
    delete: (id: string, currentUserId: string) =>
      ipcRenderer.invoke('users:delete', { id, currentUserId })
  },
  inventory: {
    getProducts: () => ipcRenderer.invoke('inventory:get-products'),
    createProduct: (data) => ipcRenderer.invoke('inventory:create-product', data),
    getSuppliers: () => ipcRenderer.invoke('inventory:get-suppliers'),
    createSupplier: (data: { name: string; phone?: string }, role: string) =>
      ipcRenderer.invoke('inventory:create-supplier', { data, role }),
    createDraft: (data) => ipcRenderer.invoke('inventory:create-draft', data),
    validateRequisition: (id) => ipcRenderer.invoke('inventory:validate', id),
    getRequisitions: () => ipcRenderer.invoke('inventory:get-requisitions')
  },
  clients: {
    list: (query?: string) => ipcRenderer.invoke('clients:list', query),
    create: (data: CreateClientInput, role: string) =>
      ipcRenderer.invoke('clients:create', { data, role }),
    update: (data: UpdateClientInput, role: string) =>
      ipcRenderer.invoke('clients:update', { data, role }),
    delete: (id: string, role: string) => ipcRenderer.invoke('clients:delete', { id, role })
  },
  sales: {
    create: (data) => ipcRenderer.invoke('sales:create', data),
    getHistory: (filter) => ipcRenderer.invoke('sales:history', filter)
  },
  finance: {
    getRate: () => ipcRenderer.invoke('finance:get-rate'),
    setRate: (data) => ipcRenderer.invoke('finance:set-rate', data),
    getHistory: (filter) => ipcRenderer.invoke('finance:get-history', filter),
    createMovement: (data) => ipcRenderer.invoke('finance:create-movement', data)
  },
  stats: {
    getDashboard: () => ipcRenderer.invoke('stats:get-dashboard')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI
  // @ts-expect-error (define in dts)
  window.api = api
}

import { ipcMain } from 'electron'
import { inventoryService } from '../services/inventoryService'
import { procedure } from '../lib/procedure'
import { productSchema, createRequisitionSchema } from '../../shared/schemas/inventorySchema'
import { UserRole } from '@shared/types'
import { z } from 'zod'

// Middleware de sécurité RBAC
function requireAdmin(role: string) {
  if (role !== UserRole.SUPERADMIN && role !== UserRole.ADMIN) {
    throw new Error('Accès refusé : Seuls les administrateurs peuvent gérer les fournisseurs.')
  }
}

export function setupInventoryHandlers() {
  // Nettoyage
  ipcMain.removeHandler('inventory:get-products')
  ipcMain.removeHandler('inventory:create-product')
  ipcMain.removeHandler('inventory:get-suppliers')
  ipcMain.removeHandler('inventory:create-supplier')
  ipcMain.removeHandler('inventory:create-draft')
  ipcMain.removeHandler('inventory:validate')
  ipcMain.removeHandler('inventory:get-requisitions')

  // Produits
  ipcMain.handle('inventory:get-products', async () => {
    const data = await inventoryService.getAllProducts()
    return { success: true, data }
  })

  ipcMain.handle(
    'inventory:create-product',
    procedure.input(productSchema).mutation(async (input) => {
      return await inventoryService.createProduct(input)
    })
  )

  // GET SUPPLIERS: Ouvert à tous pour la consultation
  ipcMain.handle('inventory:get-suppliers', async () => {
    const data = await inventoryService.getAllSuppliers()
    return { success: true, data }
  })

  // CREATE SUPPLIER: Protégé
  const createSupplierPayload = z.object({
    date: z.object({ name: z.string().min(2), phone: z.string().optional() }),
    role: z.nativeEnum(UserRole)
  })

  ipcMain.handle(
    'inventory:create-supplier',
    procedure.input(createSupplierPayload).mutation(async (input) => {
      requireAdmin(input.role) // Vérification
      return await inventoryService.createSupplier(input.date)
    })
  )

  // Réquisitions
  ipcMain.handle(
    'inventory:create-draft',
    procedure.input(createRequisitionSchema).mutation(async (input) => {
      return await inventoryService.createDraftRequisition(input)
    })
  )

  ipcMain.handle('inventory:validate', async (_event, requisitionId: string) => {
    try {
      const result = await inventoryService.validateRequisition(requisitionId)
      return { success: true, data: result }
    } catch (err: unknown) {
      const error = err as Error
      return { success: false, error: { message: error.message } }
    }
  })

  ipcMain.handle('inventory:get-requisitions', async () => {
    const data = await inventoryService.getRequisitions()
    return { success: true, data }
  })
}

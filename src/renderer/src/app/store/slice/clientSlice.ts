import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { CreateClientInput } from '@shared/schemas/clientSchema'
import { ClientDTO } from '@shared/types'
import { RootState } from '../store'

export interface ClientState {
  list: ClientDTO[]
  isLoading: boolean
  error: string | null
}

const initialState: ClientState = {
  list: [],
  isLoading: false,
  error: null
}

export const fetchClients = createAsyncThunk(
  'clients/fetchAll',
  async (query: string | undefined, { rejectWithValue }) => {
    try {
      const res = await window.api.clients.list(query)
      if (!res.success) return rejectWithValue(res.error?.message || 'Erreur inconnue')
      return res.data as ClientDTO[]
    } catch (err: unknown) {
      const error = err as Error
      return rejectWithValue(error.message)
    }
  }
)

export const createNewClient = createAsyncThunk<ClientDTO, CreateClientInput>(
  'clients/create',
  async (data, { getState, rejectWithValue }) => {
    try {
      // Récupération sécurisée du rôle depuis le state Redux
      const state = getState() as RootState
      const role = state.auth.user?.role

      if (!role) return rejectWithValue('Non authentifié.')

      // Appel IPC avec le rôle injecté
      const res = await window.api.clients.create(data, role)

      if (!res.success) {
        return rejectWithValue(res.error?.message || 'Erreur lors de la création')
      }

      return res.data as ClientDTO
    } catch (err: unknown) {
      const error = err as Error
      return rejectWithValue(error.message || 'Erreur critique')
    }
  }
)

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchClients.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.isLoading = false
        state.list = action.payload
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // CREATE
      .addCase(createNewClient.pending, (state) => {
        state.error = null
      })
      .addCase(createNewClient.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })
      .addCase(createNewClient.rejected, (state, action) => {
        state.error = action.payload as string
      })
  }
})

export default clientSlice.reducer

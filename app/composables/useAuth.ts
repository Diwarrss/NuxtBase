import type { AuthUser } from '~/types/auth'

type LoginPayload = {
  email: string
  password: string
  remember?: boolean
}

type ResetPasswordPayload = {
  email: string
  token: string
  password: string
  password_confirmation: string
}

export function useAuth() {
  const { $api, $csrf } = useNuxtApp()

  const user = useState<AuthUser | null>('auth.user', () => null)
  const loading = useState<boolean>('auth.loading', () => false)

  async function fetchUser() {
    try {
      const res = await $api<{ user: AuthUser | null }>('/auth/user')
      user.value = res.user
      return user.value
    } catch (err: any) {
      // 401 = not logged in
      if (err?.status === 401) {
        user.value = null
        return null
      }
      // Any other error: don't keep stale user in UI
      user.value = null
      throw err
    }
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    try {
      await $csrf()
      const res = await $api<{ user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: payload
      })
      user.value = res.user
      // Reset checked state so middleware re-evaluates on next navigation
      const checked = useState<boolean>('auth.checked', () => false)
      checked.value = false
      return user.value
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await $csrf()
      await $api('/auth/logout', { method: 'POST' })
      user.value = null
      // Reset checked state
      const checked = useState<boolean>('auth.checked', () => false)
      checked.value = false
    } finally {
      loading.value = false
    }
  }

  async function forgotPassword(email: string) {
    loading.value = true
    try {
      await $csrf()
      await $api('/auth/forgot-password', {
        method: 'POST',
        body: { email }
      })
      return true
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(payload: ResetPasswordPayload) {
    loading.value = true
    try {
      await $csrf()
      const res = await $api<{ ok: boolean; user: AuthUser | null }>('/auth/reset-password', {
        method: 'POST',
        body: payload
      })
      user.value = res.user
      // Reset checked state
      const checked = useState<boolean>('auth.checked', () => false)
      checked.value = false
      return res
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    fetchUser,
    login,
    logout,
    forgotPassword,
    resetPassword
  }
}

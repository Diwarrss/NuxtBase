export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on server to avoid hydration issues
  if (import.meta.server) {
    return
  }

  const { user, fetchUser } = useAuth()
  const guestOnly = new Set(['/login', '/forgot-password', '/reset-password', '/register'])

  // Avoid refetching on every navigation
  const checked = useState<boolean>('auth.checked', () => false)
  
  // Fetch user if not checked yet
  if (!checked.value) {
    try {
      await fetchUser()
    } catch {
      // ignore - user will remain null
    } finally {
      checked.value = true
    }
  }

  const isLoggedIn = Boolean(user.value)

  // If logged in, redirect away from guest pages
  if (isLoggedIn && guestOnly.has(to.path)) {
    return navigateTo('/')
  }

  // If not logged in, redirect to login (except for guest pages)
  if (!isLoggedIn && !guestOnly.has(to.path)) {
    return navigateTo('/login')
  }
})

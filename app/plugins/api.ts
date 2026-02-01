export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:8000'

  // Custom $fetch instance for Laravel API
  const $api = $fetch.create({
    baseURL: `${apiBase}/api`,
    credentials: 'include', // Important for Sanctum cookies
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json'
    },
    async onRequest({ request, options }) {
      // Get CSRF token before making requests
      const csrfToken = await getCsrfToken(apiBase)
      if (csrfToken) {
        options.headers = {
          ...options.headers,
          'X-XSRF-TOKEN': csrfToken
        }
      }
    }
  })

  // CSRF token helper
  async function getCsrfToken(baseURL: string) {
    // Get CSRF cookie from Laravel
    const csrfCookie = useCookie('XSRF-TOKEN')
    
    if (!csrfCookie.value) {
      // Fetch CSRF cookie from Laravel's /sanctum/csrf-cookie endpoint
      try {
        await $fetch('/sanctum/csrf-cookie', {
          baseURL,
          credentials: 'include'
        })
      } catch (error) {
        console.warn('Failed to fetch CSRF cookie:', error)
      }
    }
    
    // Read the cookie value (Laravel sets it as XSRF-TOKEN)
    const token = useCookie('XSRF-TOKEN').value
    
    if (token) {
      // Laravel expects the token in X-XSRF-TOKEN header
      // The cookie value is URL encoded, decode it
      return decodeURIComponent(token)
    }
    
    return null
  }

  async function $csrf() {
    return await getCsrfToken(apiBase)
  }

  return {
    provide: {
      api: $api,
      csrf: $csrf
    }
  }
})

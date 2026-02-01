/**
 * Middleware para proteger rutas basadas en permisos
 * 
 * Uso en definePageMeta:
 * definePageMeta({
 *   middleware: 'permission',
 *   permissions: 'users.view'
 * })
 * 
 * O múltiples permisos (cualquiera):
 * definePageMeta({
 *   middleware: 'permission',
 *   permissions: ['users.view', 'users.edit']
 * })
 * 
 * O usando string con separador |:
 * definePageMeta({
 *   middleware: 'permission',
 *   permissions: 'users.view|users.edit'
 * })
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip on server
  if (import.meta.server) {
    return
  }

  const { user, fetchUser } = useAuth()
  const { hasPermission, hasAnyPermission, isAdmin } = usePermissions()

  // Asegurarse de que el usuario esté cargado antes de verificar permisos
  // El middleware auth.global debería haberlo cargado, pero por si acaso
  if (!user.value) {
    try {
      await fetchUser()
    } catch {
      // Si falla, el usuario no está autenticado
    }
  }

  // Si no hay usuario autenticado después de intentar cargarlo, redirigir a login
  if (!user.value) {
    // Evitar ciclo infinito: no redirigir si ya estamos en login
    if (to.path !== '/login') {
      return navigateTo('/login')
    }
    return
  }

  // Los administradores siempre tienen acceso
  if (isAdmin.value) {
    if (import.meta.dev) {
      console.log('✅ [Permission Middleware] Admin access granted for:', to.path)
    }
    return
  }

  // Obtener permisos requeridos del meta
  // En Nuxt, los middlewares no pueden tener parámetros en el nombre
  // Por lo tanto, usamos meta.permissions para pasar los permisos requeridos
  const requiredPermissions = to.meta.permissions as string | string[] | undefined

  if (!requiredPermissions) {
    // Si no hay permisos requeridos, permitir acceso
    if (import.meta.dev) {
      console.log('✅ [Permission Middleware] No permissions required for:', to.path)
    }
    return
  }

  // Convertir a array si es string (puede venir como 'perm1|perm2' o como array)
  let permissions: string[]
  if (typeof requiredPermissions === 'string') {
    // Si contiene |, dividir por ese separador
    permissions = requiredPermissions.includes('|')
      ? requiredPermissions.split('|').map(p => p.trim())
      : [requiredPermissions]
  } else {
    permissions = requiredPermissions
  }

  // Debug en desarrollo
  if (import.meta.dev) {
    console.log('🔍 [Permission Middleware] Checking permissions:', {
      path: to.path,
      required: permissions,
      userPermissions: user.value?.permissions,
      hasPermission: hasAnyPermission(permissions)
    })
  }

  // Verificar si tiene alguno de los permisos requeridos
  if (!hasAnyPermission(permissions)) {
    if (import.meta.dev) {
      console.warn('❌ [Permission Middleware] Access denied:', {
        path: to.path,
        required: permissions,
        userPermissions: user.value?.permissions
      })
    }
    // Evitar ciclo infinito: no redirigir si ya estamos en /unauthorized
    if (to.path === '/unauthorized') {
      return
    }
    // Redirigir a página de acceso denegado
    return navigateTo('/unauthorized')
  }

  if (import.meta.dev) {
    console.log('✅ [Permission Middleware] Access granted for:', to.path)
  }
})

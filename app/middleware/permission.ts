/**
 * Middleware para proteger rutas basadas en permisos
 * 
 * Uso en definePageMeta:
 * definePageMeta({
 *   middleware: 'permission:users.view'
 * })
 * 
 * O múltiples permisos (cualquiera):
 * definePageMeta({
 *   middleware: 'permission:users.view|users.edit'
 * })
 * 
 * O usando función:
 * definePageMeta({
 *   middleware: (to) => {
 *     // Lógica personalizada
 *   }
 * })
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Skip on server
  if (import.meta.server) {
    return
  }

  const { user } = useAuth()
  const { hasPermission, hasAnyPermission, isAdmin } = usePermissions()

  // Si no hay usuario autenticado, redirigir a login
  if (!user.value) {
    // Evitar ciclo infinito: no redirigir si ya estamos en login
    if (to.path !== '/login') {
      return navigateTo('/login')
    }
    return
  }

  // Los administradores siempre tienen acceso
  if (isAdmin.value) {
    return
  }

  // Obtener permisos requeridos del meta o de la ruta
  // En Nuxt, los middlewares con parámetros se pasan como string en el nombre
  // Ejemplo: 'permission:users.view' -> extraer 'users.view'
  const middlewareName = to.meta.middleware
  let requiredPermissions: string | string[] | undefined

  // Si el middleware tiene parámetros en el nombre (formato: 'permission:permiso1|permiso2')
  if (typeof middlewareName === 'string' && middlewareName.startsWith('permission:')) {
    const permissionsStr = middlewareName.replace('permission:', '')
    requiredPermissions = permissionsStr.split('|').map(p => p.trim())
  } else if (to.meta.permissions) {
    // También verificar en meta.permissions por si se define directamente
    requiredPermissions = to.meta.permissions as string | string[]
  }

  if (!requiredPermissions) {
    // Si no hay permisos requeridos, permitir acceso
    return
  }

  // Convertir a array si es string
  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions]

  // Verificar si tiene alguno de los permisos requeridos
  if (!hasAnyPermission(permissions)) {
    // Evitar ciclo infinito: no redirigir si ya estamos en /unauthorized
    if (to.path === '/unauthorized') {
      return
    }
    // Redirigir a página de acceso denegado
    return navigateTo('/unauthorized')
  }
})

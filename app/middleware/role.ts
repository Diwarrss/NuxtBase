/**
 * Middleware para proteger rutas basadas en roles
 * 
 * Uso en definePageMeta:
 * definePageMeta({
 *   middleware: 'role:admin'
 * })
 * 
 * O múltiples roles (cualquiera):
 * definePageMeta({
 *   middleware: 'role:admin|moderator'
 * })
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Skip on server
  if (import.meta.server) {
    return
  }

  const { user } = useAuth()
  const { hasRole, hasAnyRole, isAdmin } = usePermissions()

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

  // Obtener roles requeridos del meta o de la ruta
  const middlewareName = to.meta.middleware
  let requiredRoles: string | string[] | undefined

  // Si el middleware tiene parámetros en el nombre (formato: 'role:admin|moderator')
  if (typeof middlewareName === 'string' && middlewareName.startsWith('role:')) {
    const rolesStr = middlewareName.replace('role:', '')
    requiredRoles = rolesStr.split('|').map(r => r.trim())
  } else if (to.meta.roles) {
    // También verificar en meta.roles por si se define directamente
    requiredRoles = to.meta.roles as string | string[]
  }

  if (!requiredRoles) {
    // Si no hay roles requeridos, permitir acceso
    return
  }

  // Convertir a array si es string
  const roles = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles]

  // Verificar si tiene alguno de los roles requeridos
  if (!hasAnyRole(roles)) {
    // Evitar ciclo infinito: no redirigir si ya estamos en /unauthorized
    if (to.path === '/unauthorized') {
      return
    }
    // Redirigir a página de acceso denegado
    return navigateTo('/unauthorized')
  }
})

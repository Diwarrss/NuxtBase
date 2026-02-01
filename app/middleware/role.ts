/**
 * Middleware para proteger rutas basadas en roles
 * 
 * Uso en definePageMeta:
 * definePageMeta({
 *   middleware: 'role',
 *   roles: 'admin'
 * })
 * 
 * O múltiples roles (cualquiera):
 * definePageMeta({
 *   middleware: 'role',
 *   roles: ['admin', 'moderator']
 * })
 * 
 * O usando string con separador |:
 * definePageMeta({
 *   middleware: 'role',
 *   roles: 'admin|moderator'
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

  // Obtener roles requeridos del meta
  // En Nuxt, los middlewares no pueden tener parámetros en el nombre
  // Por lo tanto, usamos meta.roles para pasar los roles requeridos
  const requiredRoles = to.meta.roles as string | string[] | undefined

  if (!requiredRoles) {
    // Si no hay roles requeridos, permitir acceso
    return
  }

  // Convertir a array si es string (puede venir como 'role1|role2' o como array)
  let roles: string[]
  if (typeof requiredRoles === 'string') {
    // Si contiene |, dividir por ese separador
    roles = requiredRoles.includes('|')
      ? requiredRoles.split('|').map(r => r.trim())
      : [requiredRoles]
  } else {
    roles = requiredRoles
  }

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

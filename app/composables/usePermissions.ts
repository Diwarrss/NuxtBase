import type { AuthUser } from '~/types/auth'

/**
 * Composable para verificar roles y permisos del usuario autenticado
 */
export function usePermissions() {
  const { user } = useAuth()

  /**
   * Verifica si el usuario tiene un rol específico
   */
  function hasRole(role: string): boolean {
    if (!user.value?.roles) {
      return false
    }
    return user.value.roles.includes(role)
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  function hasAnyRole(roles: string[]): boolean {
    if (!user.value?.roles || roles.length === 0) {
      return false
    }
    return roles.some(role => user.value?.roles?.includes(role))
  }

  /**
   * Verifica si el usuario tiene todos los roles especificados
   */
  function hasAllRoles(roles: string[]): boolean {
    if (!user.value?.roles || roles.length === 0) {
      return false
    }
    return roles.every(role => user.value?.roles?.includes(role))
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  function hasPermission(permission: string): boolean {
    if (!user.value?.permissions) {
      if (import.meta.dev) {
        console.warn('[usePermissions] No user permissions available:', { user: user.value })
      }
      return false
    }
    const has = user.value.permissions.includes(permission)
    if (import.meta.dev) {
      console.log(`[usePermissions] hasPermission('${permission}'):`, has, {
        userPermissions: user.value.permissions
      })
    }
    return has
  }

  /**
   * Verifica si el usuario tiene alguno de los permisos especificados
   */
  function hasAnyPermission(permissions: string[]): boolean {
    if (!user.value?.permissions || permissions.length === 0) {
      if (import.meta.dev) {
        console.warn('[usePermissions] No user permissions or empty array:', {
          userPermissions: user.value?.permissions,
          required: permissions
        })
      }
      return false
    }
    const has = permissions.some(permission => user.value?.permissions?.includes(permission))
    if (import.meta.dev) {
      console.log(`[usePermissions] hasAnyPermission([${permissions.join(', ')}]):`, has, {
        userPermissions: user.value.permissions,
        required: permissions
      })
    }
    return has
  }

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   */
  function hasAllPermissions(permissions: string[]): boolean {
    if (!user.value?.permissions || permissions.length === 0) {
      return false
    }
    return permissions.every(permission => user.value?.permissions?.includes(permission))
  }

  /**
   * Verifica si el usuario es administrador
   */
  const isAdmin = computed(() => hasRole('admin'))

  /**
   * Obtiene todos los roles del usuario
   */
  const roles = computed(() => user.value?.roles || [])

  /**
   * Obtiene todos los permisos del usuario
   */
  const permissions = computed(() => user.value?.permissions || [])

  return {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    roles,
    permissions,
  }
}

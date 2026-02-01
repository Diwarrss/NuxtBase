<script setup lang="ts">
interface Props {
  /**
   * Permiso requerido para mostrar el contenido
   */
  permission?: string
  /**
   * Permisos requeridos (cualquiera de ellos)
   */
  anyPermission?: string[]
  /**
   * Permisos requeridos (todos ellos)
   */
  allPermissions?: string[]
  /**
   * Rol requerido para mostrar el contenido
   */
  role?: string
  /**
   * Roles requeridos (cualquiera de ellos)
   */
  anyRole?: string[]
  /**
   * Roles requeridos (todos ellos)
   */
  allRoles?: string[]
  /**
   * Si es true, solo los administradores pueden ver el contenido
   */
  adminOnly?: boolean
  /**
   * Contenido a mostrar si no se cumple la condición
   */
  fallback?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fallback: false,
})

const { hasRole, hasAnyRole, hasAllRoles, hasPermission, hasAnyPermission, hasAllPermissions, isAdmin } = usePermissions()

const canAccess = computed(() => {
  // Admin siempre tiene acceso
  if (isAdmin.value) {
    return true
  }

  // Verificar adminOnly
  if (props.adminOnly) {
    return false
  }

  // Verificar permisos individuales
  if (props.permission && !hasPermission(props.permission)) {
    return false
  }

  // Verificar anyPermission
  if (props.anyPermission && props.anyPermission.length > 0 && !hasAnyPermission(props.anyPermission)) {
    return false
  }

  // Verificar allPermissions
  if (props.allPermissions && props.allPermissions.length > 0 && !hasAllPermissions(props.allPermissions)) {
    return false
  }

  // Verificar rol individual
  if (props.role && !hasRole(props.role)) {
    return false
  }

  // Verificar anyRole
  if (props.anyRole && props.anyRole.length > 0 && !hasAnyRole(props.anyRole)) {
    return false
  }

  // Verificar allRoles
  if (props.allRoles && props.allRoles.length > 0 && !hasAllRoles(props.allRoles)) {
    return false
  }

  // Si no hay ninguna condición, permitir acceso
  if (!props.permission && !props.anyPermission && !props.allPermissions && 
      !props.role && !props.anyRole && !props.allRoles && !props.adminOnly) {
    return true
  }

  return true
})
</script>

<template>
  <template v-if="canAccess">
    <slot />
  </template>
  <template v-else-if="fallback">
    <slot name="fallback" />
  </template>
</template>

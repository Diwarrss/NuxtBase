<script setup lang="ts">
import type { NavGroup, NavLink, NavSectionTitle } from '~/types/nav'
import { navMenu, navMenuBottom } from '~/constants/menus'

function resolveNavItemComponent(item: NavLink | NavGroup | NavSectionTitle): any {
  if ('children' in item)
    return resolveComponent('LayoutSidebarNavGroup')

  return resolveComponent('LayoutSidebarNavLink')
}

const teams: {
  name: string
  logo: string
  plan: string
}[] = [
  {
    name: 'Acme Inc',
    logo: 'i-lucide-gallery-vertical-end',
    plan: 'Enterprise',
  },
  {
    name: 'Acme Corp.',
    logo: 'i-lucide-audio-waveform',
    plan: 'Startup',
  },
  {
    name: 'Evil Corp.',
    logo: 'i-lucide-command',
    plan: 'Free',
  },
]

const { sidebar } = useAppSettings()
const { user: authUser } = useAuth()
const { hasRole, hasAnyRole, hasPermission, hasAnyPermission, isAdmin } = usePermissions()

// Use authenticated user or fallback
const user = computed(() => ({
  name: authUser.value?.name || 'Usuario',
  email: authUser.value?.email || '',
  avatar: ''
}))

// Filtrar elementos del menú basados en permisos
function canAccessItem(item: NavLink | NavGroup): boolean {
  // Si no hay usuario autenticado, no mostrar elementos con permisos
  if (!authUser.value) {
    return !item.permission && !item.role && !item.adminOnly
  }

  // Los administradores siempre tienen acceso
  if (isAdmin.value) {
    return true
  }

  // Verificar adminOnly
  if (item.adminOnly) {
    return false
  }

  // Si no tiene permisos definidos, permitir acceso
  if (!item.permission && !item.anyPermission && !item.role && !item.anyRole) {
    return true
  }

  // Verificar permisos individuales
  if (item.permission) {
    const hasAccess = hasPermission(item.permission)
    if (!hasAccess) {
      return false
    }
  }

  // Verificar anyPermission
  if (item.anyPermission && item.anyPermission.length > 0) {
    if (!hasAnyPermission(item.anyPermission)) {
      return false
    }
  }

  // Verificar rol individual
  if (item.role) {
    if (!hasRole(item.role)) {
      return false
    }
  }

  // Verificar anyRole
  if (item.anyRole && item.anyRole.length > 0) {
    if (!hasAnyRole(item.anyRole)) {
      return false
    }
  }

  return true
}

// Filtrar menú basado en permisos
const filteredNavMenu = computed(() => {
  // Debug: mostrar información del usuario y permisos
  if (import.meta.dev) {
    console.log('🔍 Menu Debug:', {
      user: authUser.value,
      isAdmin: isAdmin.value,
      roles: authUser.value?.roles,
      permissions: authUser.value?.permissions
    })
  }

  return navMenu.map(section => {
    const filteredItems = section.items.filter(item => {
      const canAccess = canAccessItem(item)
      
      // Debug para items de administración
      if (import.meta.dev && section.heading === 'Administración') {
        console.log(`  ✓ ${item.title}:`, {
          canAccess,
          permission: item.permission,
          hasPermission: item.permission ? hasPermission(item.permission) : 'N/A'
        })
      }

      // Si es un grupo, filtrar también los hijos
      if ('children' in item) {
        const filteredChildren = item.children.filter(child => canAccessItem(child))
        // Si no hay hijos visibles, ocultar el grupo
        if (filteredChildren.length === 0) {
          return false
        }
        // Crear una copia del item con hijos filtrados
        const itemCopy = { ...item, children: filteredChildren }
        // Verificar si el grupo mismo tiene restricciones
        return canAccessItem(itemCopy)
      }
      // Si es un link simple, verificar permisos
      return canAccess
    })
    
    return {
      ...section,
      items: filteredItems
    }
  }).filter(section => section.items.length > 0) // Solo mostrar secciones con items visibles
})
</script>

<template>
  <Sidebar :collapsible="sidebar?.collapsible" :side="sidebar?.side" :variant="sidebar?.variant">
    <SidebarHeader>
      <LayoutSidebarNavHeader :teams="teams" />
      <Search />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup v-for="(nav, indexGroup) in filteredNavMenu" :key="indexGroup">
        <SidebarGroupLabel v-if="nav.heading">
          {{ nav.heading }}
        </SidebarGroupLabel>
        <component :is="resolveNavItemComponent(item)" v-for="(item, index) in nav.items" :key="index" :item="item" />
      </SidebarGroup>
      <SidebarGroup class="mt-auto">
        <component :is="resolveNavItemComponent(item)" v-for="(item, index) in navMenuBottom" :key="index" :item="item" size="sm" />
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <LayoutSidebarNavFooter />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>

<style scoped>

</style>

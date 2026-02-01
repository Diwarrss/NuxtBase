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
  // Los administradores siempre tienen acceso
  if (isAdmin.value) {
    return true
  }

  // Verificar adminOnly
  if (item.adminOnly) {
    return false
  }

  // Verificar permisos individuales
  if (item.permission && !hasPermission(item.permission)) {
    return false
  }

  // Verificar anyPermission
  if (item.anyPermission && item.anyPermission.length > 0 && !hasAnyPermission(item.anyPermission)) {
    return false
  }

  // Verificar rol individual
  if (item.role && !hasRole(item.role)) {
    return false
  }

  // Verificar anyRole
  if (item.anyRole && item.anyRole.length > 0 && !hasAnyRole(item.anyRole)) {
    return false
  }

  return true
}

// Filtrar menú basado en permisos
const filteredNavMenu = computed(() => {
  return navMenu.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // Si es un grupo, filtrar también los hijos
      if ('children' in item) {
        const filteredChildren = item.children.filter(child => canAccessItem(child))
        // Si no hay hijos visibles, ocultar el grupo
        if (filteredChildren.length === 0) {
          return false
        }
        // Actualizar los hijos filtrados
        item.children = filteredChildren
        // Verificar si el grupo mismo tiene restricciones
        return canAccessItem(item)
      }
      // Si es un link simple, verificar permisos
      return canAccessItem(item)
    })
  })).filter(section => section.items.length > 0) // Solo mostrar secciones con items visibles
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

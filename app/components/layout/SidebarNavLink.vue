<script setup lang="ts">
import type { SidebarMenuButtonVariants } from '~/components/ui/sidebar'
import type { NavLink } from '~/types/nav'
import { useSidebar } from '~/components/ui/sidebar'

const props = withDefaults(defineProps<{
  item: NavLink
  size?: SidebarMenuButtonVariants['size']
}>(), {
  size: 'default',
})

const { setOpenMobile } = useSidebar()

function handleClick() {
  setOpenMobile(false)
  // Usar navigateTo de Nuxt para mejor compatibilidad
  navigateTo(props.item.link)
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton 
        :tooltip="item.title" 
        :size="size" 
        :data-active="item.link === $route.path"
        @click="handleClick"
      >
        <Icon :name="item.icon || ''" />
        <span>{{ item.title }}</span>
        <span v-if="item.new" class="rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs text-black leading-none no-underline group-hover:no-underline">
          New
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</template>

<style scoped>

</style>

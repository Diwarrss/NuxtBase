<script setup lang="ts">
// Ejemplo de página protegida con permisos
definePageMeta({
  middleware: 'permission:roles.view'
})

const { hasPermission } = usePermissions()
const canCreate = computed(() => hasPermission('roles.create'))
const canEdit = computed(() => hasPermission('roles.edit'))
const canDelete = computed(() => hasPermission('roles.delete'))
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-2xl font-bold tracking-tight">
        Gestión de Roles y Permisos
      </h2>
      <PermissionGate permission="roles.create">
        <Button>
          <Icon name="i-lucide-plus" class="mr-2 h-4 w-4" />
          Nuevo Rol
        </Button>
      </PermissionGate>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Roles del Sistema</CardTitle>
        <CardDescription>
          Gestiona los roles y sus permisos asociados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="text-sm text-muted-foreground">
            Esta página requiere el permiso <code>roles.view</code>
          </div>
          
          <!-- Ejemplo de acciones condicionales -->
          <div class="flex gap-2">
            <PermissionGate permission="roles.edit">
              <Button variant="outline" size="sm">
                <Icon name="i-lucide-edit" class="mr-2 h-4 w-4" />
                Editar Rol
              </Button>
            </PermissionGate>
            
            <PermissionGate permission="roles.delete">
              <Button variant="destructive" size="sm">
                <Icon name="i-lucide-trash" class="mr-2 h-4 w-4" />
                Eliminar Rol
              </Button>
            </PermissionGate>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
// Ejemplo de página protegida con permisos
definePageMeta({
  middleware: 'permission:users.view'
})

const { hasPermission } = usePermissions()
const canCreate = computed(() => hasPermission('users.create'))
const canEdit = computed(() => hasPermission('users.edit'))
const canDelete = computed(() => hasPermission('users.delete'))
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-2xl font-bold tracking-tight">
        Gestión de Usuarios
      </h2>
      <PermissionGate permission="users.create">
        <Button>
          <Icon name="i-lucide-plus" class="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </PermissionGate>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Lista de Usuarios</CardTitle>
        <CardDescription>
          Gestiona los usuarios del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="text-sm text-muted-foreground">
            Esta página requiere el permiso <code>users.view</code>
          </div>
          
          <!-- Ejemplo de acciones condicionales -->
          <div class="flex gap-2">
            <PermissionGate permission="users.edit">
              <Button variant="outline" size="sm">
                <Icon name="i-lucide-edit" class="mr-2 h-4 w-4" />
                Editar
              </Button>
            </PermissionGate>
            
            <PermissionGate permission="users.delete">
              <Button variant="destructive" size="sm">
                <Icon name="i-lucide-trash" class="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </PermissionGate>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

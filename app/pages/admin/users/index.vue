<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'permission',
  permissions: 'users.view'
})

const { $api } = useNuxtApp()
const { hasPermission } = usePermissions()
const { user: authUser } = useAuth()

const users = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0
})

const canCreate = computed(() => hasPermission('users.create'))
const canEdit = computed(() => hasPermission('users.edit'))
const canDelete = computed(() => hasPermission('users.delete'))

async function fetchUsers() {
  loading.value = true
  try {
    const params: any = {
      per_page: pagination.value.per_page,
      page: pagination.value.current_page
    }
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    
    const res = await $api('/users', { query: params })
    users.value = res.data
    pagination.value = res.meta
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.value.current_page = 1
  fetchUsers()
}

function handlePageChange(page: number) {
  pagination.value.current_page = page
  fetchUsers()
}

async function handleDelete(id: number) {
  if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
    return
  }
  
  try {
    await $api(`/users/${id}`, { method: 'DELETE' })
    await fetchUsers()
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    alert('Error al eliminar el usuario')
  }
}

onMounted(() => {
  fetchUsers()
})

watch(searchQuery, () => {
  // Debounce search
  const timeout = setTimeout(() => {
    handleSearch()
  }, 500)
  return () => clearTimeout(timeout)
})
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
          <!-- Buscador -->
          <div class="flex gap-2">
            <div class="relative flex-1">
              <Icon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="Buscar por nombre o email..."
                class="pl-9"
              />
            </div>
          </div>

          <!-- Tabla -->
          <div v-if="loading" class="flex items-center justify-center py-8">
            <Icon name="i-lucide-loader-2" class="h-6 w-6 animate-spin" />
          </div>
          
          <div v-else-if="users.length === 0" class="text-center py-8 text-muted-foreground">
            No hay usuarios registrados
          </div>

          <div v-else class="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead class="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="user in users" :key="user.id">
                  <TableCell class="font-medium">{{ user.id }}</TableCell>
                  <TableCell>{{ user.name }}</TableCell>
                  <TableCell>{{ user.email }}</TableCell>
                  <TableCell>
                    <div class="flex gap-1 flex-wrap">
                      <Badge v-for="role in user.roles" :key="role" variant="secondary">
                        {{ role }}
                      </Badge>
                      <span v-if="user.roles.length === 0" class="text-muted-foreground text-sm">Sin roles</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {{ new Date(user.created_at).toLocaleDateString() }}
                  </TableCell>
                  <TableCell class="text-right">
                    <div class="flex justify-end gap-2">
                      <PermissionGate permission="users.edit">
                        <Button variant="outline" size="sm" @click="() => {}">
                          <Icon name="i-lucide-edit" class="h-4 w-4" />
                        </Button>
                      </PermissionGate>
                      <PermissionGate permission="users.delete">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          @click="() => handleDelete(user.id)"
                          :disabled="user.id === authUser?.id"
                        >
                          <Icon name="i-lucide-trash" class="h-4 w-4" />
                        </Button>
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <!-- Paginación -->
          <div v-if="pagination.last_page > 1" class="flex items-center justify-between">
            <div class="text-sm text-muted-foreground">
              Mostrando {{ ((pagination.current_page - 1) * pagination.per_page) + 1 }} a 
              {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} de 
              {{ pagination.total }} usuarios
            </div>
            <div class="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                :disabled="pagination.current_page === 1"
                @click="handlePageChange(pagination.current_page - 1)"
              >
                Anterior
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                :disabled="pagination.current_page === pagination.last_page"
                @click="handlePageChange(pagination.current_page + 1)"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

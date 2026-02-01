<script setup lang="ts">
// Página de auditoría protegida
definePageMeta({
  layout: 'default',
  middleware: 'permission',
  permissions: 'admin.access'
})

// const { t } = useI18n() // Temporalmente deshabilitado
const { $api } = useNuxtApp()
const { user } = useAuth()

const activities = ref<any[]>([])
const loading = ref(false)
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0
})

async function fetchActivities() {
  loading.value = true
  try {
    const res = await $api('/audit', {
      query: {
        per_page: pagination.value.per_page,
        page: pagination.value.current_page
      }
    })
    activities.value = res.data
    pagination.value = res.meta
  } catch (error) {
    console.error('Error al cargar actividades:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchActivities()
})
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-2xl font-bold tracking-tight">
        Auditoría del Sistema
      </h2>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="fetchActivities" :disabled="loading">
          <Icon name="i-lucide-refresh-cw" :class="['mr-2 h-4 w-4', loading && 'animate-spin']" />
          Actualizar
        </Button>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Registro de Actividades</CardTitle>
        <CardDescription>
          Historial completo de acciones realizadas en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <Icon name="i-lucide-loader-2" class="h-6 w-6 animate-spin" />
        </div>
        <div v-else-if="activities.length === 0" class="text-center py-8 text-muted-foreground">
          No hay actividades registradas
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="activity in activities"
            :key="activity.id"
            class="flex items-start gap-4 p-4 border rounded-lg"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-medium">{{ activity.description }}</span>
                <Badge variant="outline" class="text-xs">
                  {{ activity.event }}
                </Badge>
              </div>
              <div class="text-sm text-muted-foreground">
                <span v-if="activity.causer">
                  Por: {{ activity.causer.name }} ({{ activity.causer.email }})
                </span>
                <span v-else>Por: Sistema</span>
              </div>
              <div class="text-xs text-muted-foreground mt-1">
                {{ new Date(activity.created_at).toLocaleString() }}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

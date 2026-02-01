<script setup lang="ts">
definePageMeta({
  layout: 'blank'
})

const { user } = useAuth()
const router = useRouter()

function goBack() {
  router.back()
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4">
    <div class="w-full max-w-md text-center">
      <div class="mb-6">
        <Icon name="i-lucide-shield-alert" class="mx-auto h-16 w-16 text-destructive" />
      </div>
      <h1 class="mb-2 text-3xl font-bold">Acceso Denegado</h1>
      <p class="mb-6 text-muted-foreground">
        No tienes los permisos necesarios para acceder a esta página.
      </p>
      <div class="flex gap-2 justify-center">
        <Button variant="outline" @click="goBack">
          Volver
        </Button>
        <Button @click="goHome">
          Ir al Inicio
        </Button>
      </div>
    </div>
  </div>
</template>

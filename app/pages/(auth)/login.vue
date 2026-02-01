<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})

const { user, fetchUser } = useAuth()

// Check if user is already logged in
onMounted(async () => {
  try {
    await fetchUser()
    if (user.value) {
      // User is already logged in, redirect to home
      await navigateTo('/')
    }
  } catch {
    // User is not logged in, stay on login page
  }
})
</script>

<template>
  <LayoutAuth reverse>
    <div class="grid mx-auto max-w-sm gap-6">
      <div class="grid gap-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p class="text-balance text-sm text-muted-foreground">
          Ingresa tus credenciales para continuar
        </p>
      </div>
      <AuthSignIn />
    </div>
  </LayoutAuth>
</template>

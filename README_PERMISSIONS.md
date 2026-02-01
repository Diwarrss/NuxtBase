# Sistema de Roles y Permisos en el Frontend

Este documento explica cómo usar el sistema de roles y permisos en el frontend de Nuxt.js.

## Composable `usePermissions`

El composable `usePermissions` proporciona funciones para verificar roles y permisos del usuario autenticado.

### Uso Básico

```vue
<script setup>
const { hasRole, hasPermission, isAdmin, roles, permissions } = usePermissions()

// Verificar si el usuario tiene un rol específico
if (hasRole('admin')) {
  // Usuario es administrador
}

// Verificar si el usuario tiene un permiso específico
if (hasPermission('users.edit')) {
  // Usuario puede editar usuarios
}

// Verificar si es administrador
if (isAdmin.value) {
  // Usuario es administrador
}

// Obtener todos los roles
console.log(roles.value) // ['admin', 'moderator']

// Obtener todos los permisos
console.log(permissions.value) // ['users.view', 'users.edit', ...]
</script>
```

### Funciones Disponibles

#### Roles

- `hasRole(role: string): boolean` - Verifica si el usuario tiene un rol específico
- `hasAnyRole(roles: string[]): boolean` - Verifica si el usuario tiene alguno de los roles
- `hasAllRoles(roles: string[]): boolean` - Verifica si el usuario tiene todos los roles

#### Permisos

- `hasPermission(permission: string): boolean` - Verifica si el usuario tiene un permiso específico
- `hasAnyPermission(permissions: string[]): boolean` - Verifica si el usuario tiene alguno de los permisos
- `hasAllPermissions(permissions: string[]): boolean` - Verifica si el usuario tiene todos los permisos

#### Computed Properties

- `isAdmin: ComputedRef<boolean>` - `true` si el usuario tiene el rol `admin`
- `roles: ComputedRef<string[]>` - Array de roles del usuario
- `permissions: ComputedRef<string[]>` - Array de permisos del usuario

## Componente `PermissionGate`

El componente `PermissionGate` permite mostrar/ocultar contenido basado en roles o permisos.

### Uso Básico

```vue
<template>
  <!-- Mostrar solo si tiene permiso -->
  <PermissionGate permission="users.edit">
    <Button>Editar Usuario</Button>
  </PermissionGate>

  <!-- Mostrar solo si tiene rol -->
  <PermissionGate role="admin">
    <AdminPanel />
  </PermissionGate>

  <!-- Mostrar solo si es administrador -->
  <PermissionGate admin-only>
    <SuperAdminPanel />
  </PermissionGate>

  <!-- Con fallback -->
  <PermissionGate permission="users.delete" :fallback="true">
    <Button>Eliminar</Button>
    <template #fallback>
      <span class="text-muted">No tienes permiso para eliminar</span>
    </template>
  </PermissionGate>
</template>
```

### Props

- `permission?: string` - Permiso requerido
- `anyPermission?: string[]` - Cualquiera de estos permisos
- `allPermissions?: string[]` - Todos estos permisos
- `role?: string` - Rol requerido
- `anyRole?: string[]` - Cualquiera de estos roles
- `allRoles?: string[]` - Todos estos roles
- `adminOnly?: boolean` - Solo administradores
- `fallback?: boolean` - Mostrar slot fallback si no tiene acceso

### Ejemplos Avanzados

```vue
<template>
  <!-- Múltiples permisos (cualquiera) -->
  <PermissionGate :any-permission="['users.edit', 'users.create']">
    <Button>Gestionar Usuarios</Button>
  </PermissionGate>

  <!-- Múltiples permisos (todos) -->
  <PermissionGate :all-permissions="['users.view', 'users.edit']">
    <Button>Ver y Editar Usuarios</Button>
  </PermissionGate>

  <!-- Múltiples roles (cualquiera) -->
  <PermissionGate :any-role="['admin', 'moderator']">
    <ModerationPanel />
  </PermissionGate>
</template>
```

## Middleware de Rutas

### Middleware `permission`

Protege rutas basadas en permisos.

```vue
<script setup>
definePageMeta({
  middleware: ['permission:users.view']
})
</script>
```

Múltiples permisos (cualquiera):

```vue
<script setup>
definePageMeta({
  middleware: ['permission:users.view|users.edit']
})
</script>
```

### Middleware `role`

Protege rutas basadas en roles.

```vue
<script setup>
definePageMeta({
  middleware: ['role:admin']
})
</script>
```

Múltiples roles (cualquiera):

```vue
<script setup>
definePageMeta({
  middleware: ['role:admin|moderator']
})
</script>
```

### Combinar Middleware

```vue
<script setup>
definePageMeta({
  middleware: ['auth', 'permission:dashboard.view']
})
</script>
```

## Ejemplos de Uso en Componentes

### Mostrar/Ocultar Botones

```vue
<script setup>
const { hasPermission } = usePermissions()
const canEdit = computed(() => hasPermission('users.edit'))
const canDelete = computed(() => hasPermission('users.delete'))
</script>

<template>
  <div>
    <Button v-if="canEdit">Editar</Button>
    <Button v-if="canDelete" variant="destructive">Eliminar</Button>
  </div>
</template>
```

### Con PermissionGate

```vue
<template>
  <div>
    <PermissionGate permission="users.edit">
      <Button>Editar</Button>
    </PermissionGate>
    
    <PermissionGate permission="users.delete">
      <Button variant="destructive">Eliminar</Button>
    </PermissionGate>
  </div>
</template>
```

### Mostrar Información de Roles

```vue
<script setup>
const { user } = useAuth()
const { roles, permissions, isAdmin } = usePermissions()
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Información del Usuario</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="isAdmin" class="mb-2">
        <Badge variant="default">Administrador</Badge>
      </div>
      
      <div class="mb-2">
        <strong>Roles:</strong>
        <div class="flex gap-1 mt-1">
          <Badge v-for="role in roles" :key="role">{{ role }}</Badge>
        </div>
      </div>
      
      <div>
        <strong>Permisos:</strong>
        <div class="flex flex-wrap gap-1 mt-1">
          <Badge v-for="permission in permissions" :key="permission" variant="outline">
            {{ permission }}
          </Badge>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
```

### Proteger Rutas Completas

```vue
<!-- pages/admin/users/index.vue -->
<script setup>
definePageMeta({
  middleware: ['permission:users.view']
})
</script>

<template>
  <div>
    <h1>Gestión de Usuarios</h1>
    <!-- Contenido protegido -->
  </div>
</template>
```

### Navegación Condicional

```vue
<script setup>
const { hasPermission, hasRole } = usePermissions()

const menuItems = computed(() => {
  const items = [
    { label: 'Dashboard', to: '/', icon: 'home' }
  ]
  
  if (hasPermission('users.view')) {
    items.push({ label: 'Usuarios', to: '/admin/users', icon: 'users' })
  }
  
  if (hasRole('admin')) {
    items.push({ label: 'Configuración', to: '/admin/settings', icon: 'settings' })
  }
  
  return items
})
</script>

<template>
  <nav>
    <NuxtLink v-for="item in menuItems" :key="item.to" :to="item.to">
      {{ item.label }}
    </NuxtLink>
  </nav>
</template>
```

## Integración con el Backend

El frontend obtiene los roles y permisos del usuario desde el endpoint `/api/auth/user` que retorna:

```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["admin"],
    "permissions": ["users.view", "users.create", "users.edit", "users.delete", ...]
  }
}
```

Estos datos se almacenan en el estado del usuario y están disponibles a través de `useAuth()` y `usePermissions()`.

## Notas Importantes

1. **Los administradores siempre tienen acceso**: Si un usuario tiene el rol `admin`, todas las verificaciones de permisos retornarán `true`.

2. **Verificación en el cliente**: Las verificaciones de permisos en el frontend son solo para UX. **Siempre debes proteger las rutas API en el backend**.

3. **Actualización de permisos**: Si los permisos del usuario cambian en el backend, el usuario debe cerrar sesión y volver a iniciar sesión, o puedes llamar a `fetchUser()` para actualizar los datos.

4. **Performance**: Los roles y permisos se cargan una vez cuando el usuario inicia sesión y se almacenan en el estado de Vue. No hay llamadas adicionales a la API para verificar permisos.

## Mejores Prácticas

1. **Usa PermissionGate para UI**: Para mostrar/ocultar elementos de la interfaz, usa el componente `PermissionGate`.

2. **Usa middleware para rutas**: Para proteger páginas completas, usa middleware en `definePageMeta`.

3. **Verifica en el backend**: Nunca confíes solo en las verificaciones del frontend. Siempre valida permisos en el backend.

4. **Mensajes de error claros**: Si un usuario intenta acceder a una ruta sin permiso, redirige con un mensaje claro.

5. **Fallbacks útiles**: Usa el slot `fallback` de `PermissionGate` para mostrar mensajes informativos en lugar de simplemente ocultar contenido.

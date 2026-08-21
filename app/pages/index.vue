<template>
  <UApp>
    <UContainer class="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 class="text-2xl font-bold text-center">
        Hello Nuxt UI
      </h1>
      <NuxtLink to="/users">
        <UButton class="px-20 py-10 font-bold" size="xl" variant="subtle">
          Users
        </UButton>
      </NuxtLink>
      <NuxtLink to="/tasks">
        <UButton class="px-20 py-10  font-bold" size="xl" variant="subtle">
          Tasks
        </UButton>
      </NuxtLink>
    </UContainer>
  </UApp>
</template>

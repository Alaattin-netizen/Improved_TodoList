<template>
    <UApp>
     <UContextMenu :items="items">
  <UTable
    :data="getTasksForUser(row.original.id)"
    :columns="taskColumns"
    class="w-full"
  />
    </UContextMenu>
    </UApp>
</template>

<script setup lang="ts">
import { getTasksForUser } from '~/components/helper';
const taskStore = useTaskStore();


</script>
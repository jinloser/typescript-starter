<script setup lang="ts">
defineOptions({ name: 'MenuItem' });
import type { MenuNode } from '../api/auth';

defineProps<{ items: MenuNode[] }>();
</script>

<template>
  <template v-for="item in items" :key="item.id">
    <el-sub-menu
      v-if="item.type === 'dir' && item.children && item.children.length"
      :index="item.path || String(item.id)"
    >
      <template #title>
        <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
        <span>{{ item.name }}</span>
      </template>
      <MenuItem :items="item.children" />
    </el-sub-menu>
    <el-menu-item v-else-if="item.type !== 'button'" :index="item.path || String(item.id)">
      <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
      <template #title>{{ item.name }}</template>
    </el-menu-item>
  </template>
</template>

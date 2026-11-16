<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import MenuItem from './menu-item.vue';
import type { MenuNode } from '../api/auth';

const route = useRoute();
const router = useRouter();
const store = useUserStore();

const menus = computed<MenuNode[]>(() => (store.menus ?? []).filter((m) => m.type !== 'button'));
const activeMenu = computed(() => route.path);

function handleCommand(command: string) {
  if (command === 'logout') {
    store.logout();
    router.push('/login');
  }
}
</script>

<template>
  <div class="layout">
    <el-container class="layout-container">
      <el-aside width="220px" class="layout-aside">
        <div class="logo">后台管理系统</div>
        <el-scrollbar class="layout-scroll">
          <el-menu :default-active="activeMenu" router unique-opened class="layout-menu">
            <MenuItem :items="menus" />
          </el-menu>
        </el-scrollbar>
      </el-aside>
      <el-container class="layout-body">
        <el-header class="layout-header">
          <div class="header-title">{{ route.meta.title || '后台管理系统' }}</div>
          <el-dropdown @command="handleCommand">
            <span class="header-user">
              <el-icon><UserFilled /></el-icon>
              <span>{{ store.nickname }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-header>
        <el-main class="layout-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.layout {
  height: 100vh;
}
.layout-container {
  height: 100%;
}
.layout-aside {
  background-color: #001529;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
}
.layout-scroll {
  height: calc(100vh - 60px);
}
.layout-menu {
  --el-menu-bg-color: #001529;
  --el-menu-text-color: rgba(255, 255, 255, 0.7);
  --el-menu-active-color: #fff;
  --el-menu-hover-bg-color: #1f2d3d;
  border-right: none;
}
.layout-body {
  min-width: 0;
}
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.header-user {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #333;
}
.layout-main {
  background: #f0f2f5;
}
</style>

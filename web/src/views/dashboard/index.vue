<script setup lang="ts">
import { useUserStore } from '../../stores/user';

const store = useUserStore();
</script>

<template>
  <el-card>
    <h2>欢迎回来，{{ store.nickname }}</h2>
    <p class="info">当前角色：{{ store.roles.join('、') || '无' }}</p>
    <p class="info">拥有权限数量：{{ store.permissions.length }}</p>
    <el-divider />
    <p class="info">这是一个基于 NestJS + Vue3 + Element Plus 的简单后台管理系统，包含登录鉴权、用户/角色/菜单管理与 RBAC 权限控制。</p>
  </el-card>
</template>

<style scoped>
.info {
  color: #606266;
}
</style>

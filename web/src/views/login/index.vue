<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import { useUserStore } from '../../stores/user';

const route = useRoute();
const router = useRouter();
const store = useUserStore();

const formRef = ref<FormInstance>();
const loading = ref(false);
const form = reactive({
  username: 'admin',
  password: 'admin123',
});

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

async function handleLogin() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  loading.value = true;
  try {
    await store.login({ ...form });
    ElMessage.success('登录成功');
    const redirect = (route.query.redirect as string) || '/';
    router.push(redirect);
  } catch {
    // 错误提示由请求拦截器统一处理
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2 class="login-title">后台管理系统</h2>
      <el-form ref="formRef" :model="form" :rules="rules" size="large" @keyup.enter="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
          登 录
        </el-button>
        <div class="login-tip">默认账号：admin / admin123</div>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1f2d3d 0%, #001529 100%);
}
.login-card {
  width: 400px;
  padding: 12px 8px;
}
.login-title {
  text-align: center;
  margin-bottom: 24px;
  color: #303133;
}
.login-btn {
  width: 100%;
}
.login-tip {
  margin-top: 12px;
  text-align: center;
  font-size: 12px;
  color: #909399;
}
</style>

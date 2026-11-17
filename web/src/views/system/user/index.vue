<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
  type UploadRequestOptions,
} from 'element-plus';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  assignUserRoles,
  type UserItem,
  type UserForm,
} from '../../../api/user';
import { uploadFile } from '../../../api/upload';
import { getRoleOptions, type RoleItem } from '../../../api/role';

const loading = ref(false);
const list = ref<UserItem[]>([]);
const total = ref(0);
const query = reactive({ keyword: '', page: 1, pageSize: 10 });
const roleOptions = ref<RoleItem[]>([]);

async function loadList() {
  loading.value = true;
  try {
    const res = await getUsers({ ...query });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  query.page = 1;
  loadList();
}

function handleReset() {
  query.keyword = '';
  query.page = 1;
  loadList();
}

const dialogVisible = ref(false);
const editing = ref<number | null>(null);
const formRef = ref<FormInstance>();
const form = reactive({
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  status: 1,
  avatar: '',
});

const rules = computed<FormRules>(() => ({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: editing.value
    ? [{ min: 4, message: '密码至少 4 个字符', trigger: 'blur' }]
    : [{ required: true, message: '请输入密码', trigger: 'blur' }],
}));

function openCreate() {
  editing.value = null;
  Object.assign(form, { username: '', password: '', nickname: '', email: '', phone: '', status: 1, avatar: '' });
  dialogVisible.value = true;
}

function openEdit(row: UserItem) {
  editing.value = row.id;
  Object.assign(form, {
    username: row.username,
    password: '',
    nickname: row.nickname,
    email: row.email || '',
    phone: row.phone || '',
    status: row.status,
    avatar: row.avatar || '',
  });
  dialogVisible.value = true;
}

const uploading = ref(false);

async function handleUpload(options: UploadRequestOptions) {
  const file = options.file as File;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    ElMessage.error('只支持 jpg/png/webp 图片');
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片不能超过 2MB');
    return;
  }
  uploading.value = true;
  try {
    const res = await uploadFile(file);
    form.avatar = res.url;
    ElMessage.success('头像上传成功');
  } finally {
    uploading.value = false;
  }
}

async function handleSave() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  const payload: UserForm = { ...form };
  if (editing.value) {
    if (!payload.password) delete payload.password;
    await updateUser(editing.value, payload);
    ElMessage.success('更新成功');
  } else {
    await createUser(payload);
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
  loadList();
}

async function handleDelete(row: UserItem) {
  await ElMessageBox.confirm(`确定删除用户「${row.username}」吗？`, '提示', { type: 'warning' });
  await deleteUser(row.id);
  ElMessage.success('删除成功');
  loadList();
}

const assignVisible = ref(false);
const assignUser = ref<UserItem | null>(null);
const assignForm = reactive<{ roleIds: number[] }>({ roleIds: [] });

async function openAssign(row: UserItem) {
  assignUser.value = row;
  assignForm.roleIds = row.roles.map((r) => r.id);
  if (!roleOptions.value.length) {
    roleOptions.value = await getRoleOptions();
  }
  assignVisible.value = true;
}

async function handleAssign() {
  if (!assignUser.value) return;
  await assignUserRoles(assignUser.value.id, assignForm.roleIds);
  ElMessage.success('分配成功');
  assignVisible.value = false;
  loadList();
}

onMounted(loadList);
</script>

<template>
  <div class="page">
    <el-card class="search-card">
      <el-form inline @submit.prevent>
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="用户名 / 昵称"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="toolbar">
        <el-button v-permission="'sys:user:add'" type="primary" @click="openCreate">新增用户</el-button>
      </div>
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="36" :src="row.avatar || undefined">
              {{ (row.nickname || row.username || '').slice(0, 1) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="160" />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column label="角色" min-width="140">
          <template #default="{ row }">
            <el-tag v-for="r in row.roles" :key="r.id" class="role-tag" size="small">{{ r.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'sys:user:edit'" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-permission="'sys:user:assign'" link type="primary" @click="openAssign(row)">分配角色</el-button>
            <el-button v-permission="'sys:user:delete'" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        :current-page="query.page"
        :page-size="query.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="(p: number) => { query.page = p; loadList(); }"
        @size-change="(s: number) => { query.pageSize = s; query.page = 1; loadList(); }"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑用户' : '新增用户'" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="头像" prop="avatar">
          <el-upload
            :show-file-list="false"
            :http-request="handleUpload"
            accept="image/jpeg,image/png,image/webp"
          >
            <el-avatar v-if="form.avatar" v-loading="uploading" :size="64" :src="form.avatar" />
            <div v-else v-loading="uploading" class="avatar-placeholder">
              <el-icon><Plus /></el-icon>
            </div>
          </el-upload>
          <div class="avatar-tip">支持 jpg/png/webp，不超过 2MB</div>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password :placeholder="editing ? '留空则不修改' : ''" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="assignVisible" :title="`分配角色 - ${assignUser?.username ?? ''}`" width="420px">
      <el-select v-model="assignForm.roleIds" multiple clearable placeholder="请选择角色" style="width: 100%">
        <el-option v-for="r in roleOptions" :key="r.id" :label="r.name" :value="r.id" />
      </el-select>
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssign">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.search-card {
  margin-bottom: 16px;
}
.toolbar {
  margin-bottom: 12px;
}
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
.role-tag {
  margin-right: 4px;
}
.avatar-placeholder {
  width: 64px;
  height: 64px;
  border: 1px dashed #dcdfe6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c939d;
  font-size: 20px;
  cursor: pointer;
}
.avatar-placeholder:hover {
  border-color: #409eff;
  color: #409eff;
}
.avatar-tip {
  margin-left: 12px;
  color: #909399;
  font-size: 12px;
}
</style>

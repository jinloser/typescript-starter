<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  assignRoleMenus,
  type RoleItem,
} from '../../../api/role';
import { getMenuTree } from '../../../api/menu';
import type { MenuNode } from '../../../api/auth';

const loading = ref(false);
const list = ref<RoleItem[]>([]);
const total = ref(0);
const query = reactive({ keyword: '', page: 1, pageSize: 10 });

async function loadList() {
  loading.value = true;
  try {
    const res = await getRoles({ ...query });
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
const form = reactive({ name: '', code: '', description: '', status: 1 });

const rules = computed<FormRules>(() => ({
  name: [{ required: true, message: '请输入角色名', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
}));

function openCreate() {
  editing.value = null;
  Object.assign(form, { name: '', code: '', description: '', status: 1 });
  dialogVisible.value = true;
}

function openEdit(row: RoleItem) {
  editing.value = row.id;
  Object.assign(form, {
    name: row.name,
    code: row.code,
    description: row.description,
    status: row.status,
  });
  dialogVisible.value = true;
}

async function handleSave() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  if (editing.value) {
    await updateRole(editing.value, { ...form });
    ElMessage.success('更新成功');
  } else {
    await createRole({ ...form });
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
  loadList();
}

async function handleDelete(row: RoleItem) {
  await ElMessageBox.confirm(`确定删除角色「${row.name}」吗？`, '提示', { type: 'warning' });
  await deleteRole(row.id);
  ElMessage.success('删除成功');
  loadList();
}

// 分配权限（菜单）
const assignVisible = ref(false);
const assignRole = ref<RoleItem | null>(null);
const menuTree = ref<MenuNode[]>([]);
const treeRef = ref<{ getCheckedKeys: () => number[]; getHalfCheckedKeys: () => number[] } | null>(null);
const checkedKeys = ref<number[]>([]);

async function openAssign(row: RoleItem) {
  assignRole.value = row;
  assignVisible.value = true;
  checkedKeys.value = [];
  const role = await getRole(row.id);
  checkedKeys.value = (role.menus ?? []).map((m) => m.id);
  if (!menuTree.value.length) {
    menuTree.value = await getMenuTree();
  }
}

async function handleAssign() {
  if (!assignRole.value || !treeRef.value) return;
  const ids = [...treeRef.value.getCheckedKeys(), ...treeRef.value.getHalfCheckedKeys()];
  await assignRoleMenus(assignRole.value.id, ids);
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
            placeholder="角色名 / 编码"
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
        <el-button v-permission="'sys:role:add'" type="primary" @click="openCreate">新增角色</el-button>
      </div>
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="角色名" min-width="140" />
        <el-table-column prop="code" label="编码" min-width="140">
          <template #default="{ row }">
            <el-tag size="small">{{ row.code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'sys:role:edit'" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-permission="'sys:role:assign'" link type="primary" @click="openAssign(row)">分配权限</el-button>
            <el-button v-permission="'sys:role:delete'" link type="danger" @click="handleDelete(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑角色' : '新增角色'" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" placeholder="如 sys:editor" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" />
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

    <el-dialog v-model="assignVisible" :title="`分配权限 - ${assignRole?.name ?? ''}`" width="480px">
      <el-tree
        ref="treeRef"
        :data="menuTree"
        show-checkbox
        node-key="id"
        :props="{ label: 'name', children: 'children' }"
        :default-checked-keys="checkedKeys"
        default-expand-all
      />
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
</style>

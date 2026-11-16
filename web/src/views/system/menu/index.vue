<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { getMenuTree, createMenu, updateMenu, deleteMenu, type MenuForm } from '../../../api/menu';
import type { MenuNode } from '../../../api/auth';

const loading = ref(false);
const treeData = ref<MenuNode[]>([]);

async function loadTree() {
  loading.value = true;
  try {
    treeData.value = await getMenuTree();
  } finally {
    loading.value = false;
  }
}

const typeLabels: Record<string, string> = { dir: '目录', menu: '菜单', button: '按钮' };
const typeColors: Record<string, 'success' | 'primary' | 'warning'> = {
  dir: 'warning',
  menu: 'primary',
  button: 'success',
};

// 构建父级下拉选项，编辑时排除自身及其子孙（防止成环）
function buildParentOptions(nodes: MenuNode[], excludeId?: number) {
  const excluded = new Set<number>();
  if (excludeId != null) {
    const collectSubtree = (node: MenuNode) => {
      excluded.add(node.id);
      node.children?.forEach(collectSubtree);
    };
    const walk = (list: MenuNode[]) => {
      for (const node of list) {
        if (node.id === excludeId) {
          collectSubtree(node);
        } else if (node.children?.length) {
          walk(node.children);
        }
      }
    };
    walk(nodes);
  }
  const map = (list: MenuNode[]) =>
    list
      .filter((n) => !excluded.has(n.id))
      .map((n) => ({
        id: n.id,
        name: n.name,
        children: n.children?.length ? map(n.children) : undefined,
      }));
  return [{ id: 0, name: '顶级菜单', children: map(nodes) }];
}

const dialogVisible = ref(false);
const editing = ref<number | null>(null);
const formRef = ref<FormInstance>();
const form = reactive<MenuForm & { parentId: number }>({
  parentId: 0,
  name: '',
  type: 'menu',
  path: '',
  component: '',
  permission: '',
  icon: '',
  sort: 0,
  status: 1,
});
const parentOptions = ref<{ id: number; name: string; children?: any[] }[]>([]);

const rules: FormRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
};

function openCreate(parent?: MenuNode) {
  editing.value = null;
  parentOptions.value = buildParentOptions(treeData.value);
  Object.assign(form, {
    parentId: parent?.id ?? 0,
    name: '',
    type: 'menu',
    path: '',
    component: '',
    permission: '',
    icon: '',
    sort: 0,
    status: 1,
  });
  dialogVisible.value = true;
}

function openEdit(row: MenuNode) {
  editing.value = row.id;
  parentOptions.value = buildParentOptions(treeData.value, row.id);
  Object.assign(form, {
    parentId: row.parentId,
    name: row.name,
    type: row.type,
    path: row.path,
    component: row.component,
    permission: row.permission,
    icon: row.icon,
    sort: row.sort,
    status: row.status,
  });
  dialogVisible.value = true;
}

async function handleSave() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  const payload: MenuForm = {
    parentId: form.parentId,
    name: form.name,
    type: form.type,
    path: form.path || undefined,
    component: form.component || undefined,
    permission: form.permission || undefined,
    icon: form.icon || undefined,
    sort: form.sort,
    status: form.status,
  };
  if (editing.value) {
    await updateMenu(editing.value, payload);
    ElMessage.success('更新成功');
  } else {
    await createMenu(payload);
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
  loadTree();
}

async function handleDelete(row: MenuNode) {
  await ElMessageBox.confirm(
    `确定删除菜单「${row.name}」吗？其子菜单将一并删除。`,
    '提示',
    { type: 'warning' },
  );
  await deleteMenu(row.id);
  ElMessage.success('删除成功');
  loadTree();
}

onMounted(loadTree);
</script>

<template>
  <div class="page">
    <el-card>
      <div class="toolbar">
        <el-button v-permission="'sys:menu:add'" type="primary" @click="openCreate()">新增菜单</el-button>
      </div>
      <el-table
        v-loading="loading"
        :data="treeData"
        row-key="id"
        :tree-props="{ children: 'children' }"
        default-expand-all
        border
      >
        <el-table-column prop="name" label="菜单名称" min-width="180" />
        <el-table-column prop="icon" label="图标" width="90">
          <template #default="{ row }">
            <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="typeColors[row.type] ?? 'info'" size="small">{{ typeLabels[row.type] ?? row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="140" />
        <el-table-column prop="component" label="组件" min-width="140" />
        <el-table-column prop="permission" label="权限标识" min-width="150" />
        <el-table-column prop="sort" label="排序" width="70" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'sys:menu:add'" link type="primary" @click="openCreate(row)">新增子级</el-button>
            <el-button v-permission="'sys:menu:edit'" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-permission="'sys:menu:delete'" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑菜单' : '新增菜单'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="父级菜单" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="dir">目录</el-radio>
            <el-radio value="menu">菜单</el-radio>
            <el-radio value="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="form.type !== 'button'">
          <el-form-item label="路由路径" prop="path">
            <el-input v-model="form.path" placeholder="如 /system/xxx" />
          </el-form-item>
          <el-form-item label="组件" prop="component">
            <el-input v-model="form.component" placeholder="如 system/xxx/index" />
          </el-form-item>
          <el-form-item label="图标" prop="icon">
            <el-input v-model="form.icon" placeholder="Element Plus 图标名，如 Setting" />
          </el-form-item>
        </template>
        <el-form-item v-else label="权限标识" prop="permission">
          <el-input v-model="form.permission" placeholder="如 sys:xxx:query" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
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
  </div>
</template>

<style scoped>
.toolbar {
  margin-bottom: 12px;
}
</style>

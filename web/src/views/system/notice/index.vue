<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  type NoticeItem,
} from '../../../api/notice';

const loading = ref(false);
const list = ref<NoticeItem[]>([]);
const total = ref(0);
const query = reactive({ keyword: '', page: 1, pageSize: 10 });

async function loadList() {
  loading.value = true;
  try {
    const res = await getNotices({ ...query });
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
const form = reactive({ title: '', content: '', status: 1 });

const rules = computed<FormRules>(() => ({
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
}));

function openCreate() {
  editing.value = null;
  Object.assign(form, { title: '', content: '', status: 1 });
  dialogVisible.value = true;
}

function openEdit(row: NoticeItem) {
  editing.value = row.id;
  Object.assign(form, {
    title: row.title,
    content: row.content,
    status: row.status,
  });
  dialogVisible.value = true;
}

async function handleSave() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  if (editing.value) {
    await updateNotice(editing.value, { ...form });
    ElMessage.success('更新成功');
  } else {
    await createNotice({ ...form });
    ElMessage.success('新增成功');
  }
  dialogVisible.value = false;
  loadList();
}

async function handleDelete(row: NoticeItem) {
  await ElMessageBox.confirm(`确定删除公告「${row.title}」吗？`, '提示', { type: 'warning' });
  await deleteNotice(row.id);
  ElMessage.success('删除成功');
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
            placeholder="标题 / 内容"
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
        <el-button v-permission="'sys:notice:add'" type="primary" @click="openCreate">新增公告</el-button>
      </div>
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="content" label="内容" min-width="260" show-overflow-tooltip />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'sys:notice:edit'" link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button v-permission="'sys:notice:delete'" link type="danger" @click="handleDelete(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑公告' : '新增公告'" width="640px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="8" />
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

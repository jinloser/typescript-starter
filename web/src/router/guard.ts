import type { RouteRecordRaw } from 'vue-router';
import router from './index';
import { useUserStore } from '../stores/user';
import type { MenuNode } from '../api/auth';

const viewModules = import.meta.glob('../views/**/*.vue');

let dynamicAdded = false;

function addDynamicRoutes(menus: MenuNode[]) {
  if (dynamicAdded) return;
  const added: RouteRecordRaw[] = [];
  const walk = (list: MenuNode[]) => {
    for (const item of list) {
      if (item.type === 'menu' && item.path && item.component) {
        const loader = viewModules[`../views/${item.component}.vue`];
        if (loader) {
          added.push({
            path: item.path,
            name: `menu-${item.id}`,
            component: loader,
            meta: { title: item.name },
          });
        }
      }
      if (item.children && item.children.length) {
        walk(item.children);
      }
    }
  };
  walk(menus);
  for (const record of added) {
    router.addRoute('Layout', record);
  }
  dynamicAdded = true;
}

router.beforeEach(async (to) => {
  const store = useUserStore();

  if (to.path === '/login') {
    return store.isLoggedIn ? '/' : true;
  }

  if (!store.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  if (!store.userInfo) {
    try {
      await store.fetchProfile();
    } catch {
      store.logout();
      return { path: '/login', query: { redirect: to.fullPath } };
    }
  }

  if (!dynamicAdded) {
    addDynamicRoutes(store.userInfo!.menus);
    // 动态路由刚注册，重新导航以正确匹配
    return { ...to, replace: true };
  }

  return true;
});

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';
import { useUserStore } from './stores/user';
import './router/guard';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ElementPlus);

for (const [name, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(name, component);
}

app.directive('permission', {
  mounted(el: HTMLElement, binding) {
    const store = useUserStore();
    const permission = binding.value as string;
    if (permission && !store.hasPermission(permission)) {
      el.parentNode?.removeChild(el);
    }
  },
});

app.mount('#app');

import { createApp } from 'vue';
import VueGtag from 'vue-gtag';
import { createPinia } from 'pinia';
import { router } from './router';
import App from './App.vue';

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(VueGtag, {
  config: { id: 'G-WZNJHM0MM1' },
}, router);
app.mount('#app');

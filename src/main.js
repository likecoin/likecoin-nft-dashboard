import { createApp } from 'vue';
import VueGtag from 'vue-gtag';
import { router } from './router';
import App from './App.vue';

const app = createApp(App);
app.use(router);
app.use(VueGtag, {
  config: { id: 'G-WZNJHM0MM1' },
}, router);
app.mount('#app');

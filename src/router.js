import { createRouter, createWebHashHistory } from 'vue-router';
import {
  Ranking
} from './pages';

export const routes = [
  {
    name: 'Ranking',
    path: '/ranking',
    component: Ranking,
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

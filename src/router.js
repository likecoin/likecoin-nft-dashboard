import { createRouter, createWebHashHistory } from 'vue-router';
import {
  Ranking, SocialGraph
} from './pages';

export const routes = [
  {
    name: 'Ranking',
    path: '/ranking',
    component: Ranking,
  },
  {
    name: 'SocialGraph',
    path: '/socialgraph',
    component: SocialGraph,
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

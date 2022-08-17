import { createRouter, createWebHashHistory } from 'vue-router';
import {
  NftAnalysis,
  Ranking,
  SocialGraph,
} from './pages';

export const routes = [
  {
    name: 'Analysis',
    path: '/',
    component: NftAnalysis,
  },
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

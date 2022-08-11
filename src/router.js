import { createRouter, createWebHashHistory } from 'vue-router';
import {
  NftAnalysis,
  Ranking, 
  SocialGraph,
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
  {
    name: 'Analysis',
    path: '/analysis',
    component: NftAnalysis,
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

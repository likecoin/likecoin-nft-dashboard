import { createRouter, createWebHashHistory } from 'vue-router';
import {
  NftAnalysis,
  List,
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
    name: 'List',
    path: '/list',
    component: List,
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

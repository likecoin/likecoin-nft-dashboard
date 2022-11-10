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
    displayName: 'Overview',
    path: '/',
    component: NftAnalysis,
  },
  {
    name: 'List',
    displayName: 'Latest NFT',
    path: '/list',
    component: List,
  },
  {
    name: 'Ranking',
    displayName: 'Top NFT',
    path: '/ranking',
    component: Ranking,
  },
  {
    name: 'SocialGraph',
    displayName: 'Search',
    path: '/socialgraph',
    component: SocialGraph,
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

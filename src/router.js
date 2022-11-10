import { createRouter, createWebHashHistory } from 'vue-router';
import {
  NftAnalysis,
  List,
  Ranking,
  SocialGraph,
  TopCollector,
} from './pages';

export const routes = [
  {
    name: 'Analysis',
    displayName: 'Overview',
    path: '/overview',
    component: NftAnalysis,
  },
  {
    name: 'Ranking',
    displayName: 'Top NFT',
    path: '/',
    component: Ranking,
  },
  {
    name: 'List',
    displayName: 'Latest NFT',
    path: '/list',
    component: List,
  },
  {
    name: 'TopCollector',
    displayName: 'Top Collector',
    path: '/collector',
    component: TopCollector,
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

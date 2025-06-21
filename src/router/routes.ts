import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/create',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: '/seleccion',
        component: () => import('pages/SelectionPage.vue'),
      },
    ],
  },
  {
    path: '/guest',
    component: () => import('layouts/GuestLayout.vue'),
    children: [{ path: '', component: () => import('pages/PinataPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;

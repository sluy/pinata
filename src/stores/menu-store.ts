import { defineStore } from 'pinia';
import { useUserSelectionStore } from './user-selection-store';
export interface MenuHtmlItem {
  key: string;
  node?: string;
  html: string;
  image?: string;
}

export interface MenuComponentItem {
  key: string;
  node?: string;
  component: string;
}
export type MenuItem = MenuHtmlItem | MenuComponentItem;

export function isMenuHtmlItem(item: MenuItem): item is MenuHtmlItem {
  return 'html' in item;
}

export function isMenuComponentItem(item: MenuItem): item is MenuComponentItem {
  return 'component' in item;
}

export const useMenuStore = defineStore('store', {
  state: () => ({
    active: null as string | null,
    items: [
      {
        key: 'index',
        html: `
          Regala y comparte
          <b>diversión sin fin</b>
          para todas las edades!
        `,
        image: '/images/dork-new.png',
      },
      {
        key: 'info',
        html: `
          Arma tu piñata virtual<br />
          Llénala con todo tipo
          <b>de sorpresas</b>
          Invita a tus amigos y disfruta <br> del mejor entretenimiento
          <br>
          en fiestas y eventos
        `,
        image: '/images/box.png',
      },
      {
        key: 'start',
        html: `
          Disfruta de una nueva forma de
          <span><b>obsequiar</b></span>
          <span>creada con tu</span>
          <span><b>toque personal</b>
          </span>para cada ocasión
        `,
        image: '/images/gift.png',
      },
      {
        key: 'select-plan',
        node: 'select',
        component: 'SelectPlan.vue',
        canNext: async () => {
          const userSelectionStore = useUserSelectionStore();
          return userSelectionStore.selectedPlan > 0;
        },
      },
      {
        key: 'select-title',
        node: 'select',
        component: 'SelectTitle.vue',
        canNext: async () => {
          const userSelectionStore = useUserSelectionStore();
          return userSelectionStore.selectedTitle > 0;
        },
      },
      {
        key: 'select-surprises',
        node: 'fill',
        component: 'SelectSurprise.vue',
        canNext: async () => {
          const userSelectionStore = useUserSelectionStore();
          return (
            userSelectionStore.selectedSurprises.traditional.length > 0 ||
            userSelectionStore.selectedSurprises.special.length > 0 ||
            userSelectionStore.selectedSurprises.super.length > 0
          );
        },
      },
      {
        key: 'set-info',
        node: 'share',
        component: 'SetInfo.vue',
        canNext: async () => {
          const userSelectionStore = useUserSelectionStore();
          console.log(
            'userSelectionStore.selectedDate',
            userSelectionStore.selectedDate
          );
          return userSelectionStore.selectedDate instanceof Date;
        },
      },
      {
        key: 'buy-now',
        node: 'share',
        component: 'BuyNow.vue',
        canNext: async () => {
          const userSelectionStore = useUserSelectionStore();
          return userSelectionStore.bought === true;
        },
      },
      {
        key: 'qr-code',
        node: 'share',
        component: 'QrCode.vue',
        canNext: () => {
          return false;
        },
      },
    ] as MenuItem[],
  }),
  actions: {
    setActiveByNode(node: string | null | undefined) {
      console.log('setActiveByNode', node);
      this.active = !node ? null : node;
    },
  },
});

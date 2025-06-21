import { defineStore } from 'pinia';

export interface Surprise {
  id: number;
  title: string;
  info: string;
  type: string;
  image: string;
}
export interface Plan {
  id: number;
  title: string;
  options: {
    traditional: number;
    special: number;
    super: number;
    members: number;
  };
}

export interface Title {
  id: number;
  title: string;
  image: string;
}

export const useUserSelectionStore = defineStore('user-selection', {
  state: () => ({
    selectedPlan: 0,
    selectedTitle: 0,

    selectedSurprises: {
      traditional: [] as number[],
      special: [] as number[],
      super: [] as number[],
    },

    surprises: {
      surpises: [
        {
          id: 1,
          title: 'Tiembla!',
          info: 'La aplicación se mueve y tiembla, que miedo',
          image: '/images/temble.png',
        },
        {
          id: 2,
          title: 'Lluvia de confetis',
          info: 'Es una fiesta, no? El confeti no puede faltar en la pantalla',
          image: '/images/confetti.png',
        },
        {
          id: 3,
          title: 'Grito inesperado',
          info: 'Un grito inesperado para asustar a cualquiera',
          image: '/images/shout.png',
        },
        {
          id: 4,
          title: 'Mundo al revés',
          info: 'La página se rompe y muestra al revés',
          image: '/images/reverse-world.png',
        },
        {
          id: 5,
          title: 'Chiste malo',
          info: 'Un chiste deliberadamente malo y muy ridículo',
          image: '/images/bad-joke.png',
        },
        {
          id: 6,
          title: 'No encontrado!',
          info: 'Página de "Error 404" con un mensaje sin sentido',
          image: '/images/404.png',
        },
        {
          id: 7,
          title: 'Tu animal espiritual',
          info: 'Imagen del animal espiritual de la persona',
          image: '/images/spiritual-animals.png',
        },
        {
          id: 8,
          title: 'Psicodelia',
          info: 'La pantalla se volverá psicodélica',
          image: '/images/psicodelia.png',
        },
        {
          id: 9,
          title: 'Botón esquivo',
          info: 'Un botón que no hace nada y no le gusta que lo toquen',
          image: '/images/running-button.png',
        },
        {
          id: 10,
          title: 'Womp Womp',
          info: 'Reproduce el clásico sonido de trombón de la decepción',
          image: '/images/womp-womp.png',
        },
      ] as Surprise[],
      special: [
        {
          id: 1,
          title: 'Chocolate Savoy',
          info: 'Un chocolate Savoy para la persona',
          image: '/images/savoy.png',
        },
        {
          id: 2,
          title: 'Carré de caramelo',
          info: 'Un chocolate savoy carré',
          image: '/images/carre.png',
        },
      ] as Surprise[],
      super: [
        {
          id: 1,
          title: 'Café las delicias',
          info: 'Una reservación para 2 en el Café las Delicias',
          image: '/images/las-delicias.png',
        },
        {
          id: 2,
          title: 'Viaje Cancún',
          info: 'Un viaje para 2 personas a Cancún',
          image: '/images/cancun.png',
        },
      ] as Surprise[],
    },

    selectedDate: null as null | Date,
    selectedMessage: '',
    bought: false,
    plans: [
      {
        id: 1,
        title: 'Tradicional',
        options: {
          traditional: 5,
          special: 0,
          super: 0,
          members: 5,
        },
      },
      {
        id: 2,
        title: 'Especial',
        options: {
          traditional: 10,
          special: 1,
          super: 0,
          members: 10,
        },
      },
      {
        id: 3,
        title: 'Super Piñata',
        options: {
          traditional: 10,
          special: 2,
          super: 1,
          members: 15,
        },
      },
    ] as Plan[],
    titles: [
      {
        id: 1,
        title: 'Con ojos',
        image: '/images/pinata1.png',
      },
      {
        id: 2,
        title: 'Misterio',
        image: '/images/pinata2.png',
      },
      {
        id: 3,
        title: 'Burrito',
        image: '/images/pinata3.png',
      },
      {
        id: 4,
        title: 'Corazón',
        image: '/images/pinata4.png',
      },
      {
        id: 5,
        title: 'Verde',
        image: '/images/pinata5.png',
      },
      {
        id: 6,
        title: 'Corazón (azul)',
        image: '/images/pinata6.png',
      },
    ] as Title[],
  }),
  actions: {
    setSelectedPlan(plan: any) {
      const planId: number =
        typeof plan === 'object' && plan !== null && 'id' in plan
          ? parseInt(plan.id)
          : parseInt(plan);
      if (!isNaN(planId) && planId > 0) {
        this.selectedPlan = planId;
      } else {
        this.selectedPlan = 0;
      }
      this.selectedSurprises.special = [];
      this.selectedSurprises.super = [];
      this.selectedSurprises.traditional = [];
    },
    setSelectedTitle(title: any) {
      const titleId: number =
        typeof title === 'object' && title !== null && 'id' in title
          ? parseInt(title.id)
          : parseInt(title);
      if (!isNaN(titleId) && titleId > 0) {
        this.selectedTitle = titleId;
      } else {
        this.selectedTitle = 0;
      }
    },
  },
});

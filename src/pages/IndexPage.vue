<template>
  <q-page class="col index-page flex flex-center">
    <Swiper
      ref="swiperContainerRef"
      :slides-per-view="1"
      :space-between="30"
      class="texts-list"
      :pagination="{ clickable: true }"
      :navigation="true"
      @slideChange="onSlideChange"
      @swiper="onSwiper"
      :allowTouchMove="!userSelectionStore.bought"
    >
      <SwiperSlide
        v-for="t in menuStore.items"
        :key="t.key"
        :data-node="t.node"
      >
        <div class="slide-content" v-if="isMenuHtmlItem(t)">
          <div class="text" v-html="t.html" v-bind:class="`tab-${t.key}`"></div>
          <div class="image" v-if="t.image">
            <img v-if="t.image !== ''" :src="t.image" alt="Dork" />
          </div>
        </div>
        <div class="slide-content" v-if="isMenuComponentItem(t)">
          <component
            :is="getComponent(t.component)"
            @plan-selected="onPlanSelected"
            @title-selected="onTitleSelected"
            @next-step="goToNextSlide"
          />
        </div>
      </SwiperSlide>
    </Swiper>

    <div class="global-navigation" v-if="!userSelectionStore.bought">
      <button class="global-nav-button prev" @click="goToPrevSlide">
        <span class="nav-arrow">&#10094;</span>
      </button>
      <button
        class="global-nav-button next"
        @click="goToNextSlide"
        v-if="canNavigateNext"
      >
        <span class="nav-arrow">&#10095;</span>
      </button>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import {
  onMounted,
  ref,
  defineAsyncComponent,
  nextTick,
  onBeforeUnmount,
  watch,
  defineEmits,
  provide,
  onBeforeMount,
  inject,
  watchEffect,
} from 'vue';
import { useRouter } from 'vue-router';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import type { Swiper as SwiperType } from 'swiper';

import {
  useMenuStore,
  isMenuHtmlItem,
  isMenuComponentItem,
} from '../stores/menu-store';
import { useUserSelectionStore } from '../stores/user-selection-store';

const menuStore = useMenuStore();
const userSelectionStore = useUserSelectionStore();

// Definimos los eventos que puede emitir este componente
const emit = defineEmits(['mounted']);

const router = useRouter();
const swiperInstance = ref<SwiperType | null>(null);
const swiperContainerRef = ref<HTMLElement | null>(null);

// Variable reactiva para controlar si se puede avanzar
const canNavigateNext = ref(false);

// Recibir la navegación pendiente del componente padre como ref reactiva
const pendingNavigationRef = inject(
  'pendingNavigationRef',
  ref<number | null>(null)
);

const onSwiper = (swiper: SwiperType) => {
  swiperInstance.value = swiper;
  // Ajustar tamaños después de inicializar el swiper
  nextTick(() => {
    adjustSlideHeights();
  });
};

const onSlideChange = (swiper: any) => {
  const activeSlide = swiper.slides[swiper.activeIndex];
  const node = activeSlide.dataset.node;
  console.log('activeSlide', activeSlide);
  console.log('node from dataset:', node);
  menuStore.setActiveByNode(node || null);

  // Verificar si se puede avanzar cuando cambia el slide
  checkCanNavigateNext();
};

const onPlanSelected = (planId: number) => {
  console.log('Plan seleccionado:', planId);
  checkCanNavigateNext();
};

const onTitleSelected = (titleId: number) => {
  console.log('Título seleccionado:', titleId);
  checkCanNavigateNext();
};

const goToNextSlide = () => {
  console.log('Avanzando a la siguiente diapositiva');
  // Verificar primero si podemos avanzar
  checkCanNavigateNext().then(() => {
    if (canNavigateNext.value && swiperInstance.value) {
      setTimeout(() => {
        swiperInstance.value?.slideNext();
      }, 300);
    }
  });
};

const goToPrevSlide = () => {
  console.log('Retrocediendo a la diapositiva anterior');
  // No permitir navegar hacia atrás si ya se completó la compra
  if (userSelectionStore.bought) return;

  if (swiperInstance.value) {
    swiperInstance.value?.slidePrev();
  }
};

// Función para cargar componentes dinámicamente
const getComponent = (componentName: string) => {
  return defineAsyncComponent(
    () => import(/* @vite-ignore */ `../components/${componentName}`)
  );
};

// Función para ajustar la altura de los slides
const adjustSlideHeights = async () => {
  if (!swiperContainerRef.value) return;

  document.querySelectorAll('.slide-content').forEach((slideContent) => {
    (slideContent as HTMLElement).style.height = '0px';
    (slideContent as HTMLElement).style.overflow = 'hidden';
  });
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 100);
  });

  // Obtener la altura del contenedor padre
  const parentHeight = document.querySelector('.q-page')?.clientHeight || 0;

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 100);
  });

  document.querySelectorAll('.slide-content').forEach((slideContent) => {
    (slideContent as HTMLElement).style.height = `${parentHeight - 60}px`;
    (slideContent as HTMLElement).style.overflow = 'visible';
  });

  document
    .querySelectorAll('.global-navigation')
    .forEach((globalNavigation) => {
      (globalNavigation as HTMLElement).style.marginTop = `${
        parentHeight / 2 - 60 - 30
      }px`;
    });

  if (
    parentHeight > 0 &&
    swiperContainerRef.value &&
    swiperContainerRef.value.style
  ) {
    // Aplicar altura al contenedor del swiper
    swiperContainerRef.value.style.height = `${parentHeight}px`;

    // Ajustar todos los slides
    const slides = swiperContainerRef.value.querySelectorAll('.swiper-slide');
    slides.forEach((slide) => {
      (slide as HTMLElement).style.height = `${parentHeight}px`;

      // También ajustar el slide-content dentro de cada slide
      const slideContents = slide.querySelectorAll('.slide-content');
      slideContents.forEach((content) => {
        (content as HTMLElement).style.height = `${parentHeight}px`;
        (content as HTMLElement).style.display = 'flex';
        (content as HTMLElement).style.flexDirection = 'column';
        (content as HTMLElement).style.alignItems = 'center';
        (content as HTMLElement).style.justifyContent = 'center';
      });
    });

    // Ajustar el wrapper también
    const wrapper = swiperContainerRef.value.querySelector('.swiper-wrapper');
    if (wrapper) {
      (wrapper as HTMLElement).style.height = `${parentHeight}px`;
    }

    // Actualizar Swiper
    if (swiperInstance.value) {
      swiperInstance.value.update();
    }
  }
};

// Manejador de evento de redimensionamiento
let resizeTimer: number | null = null;
const handleResize = () => {
  // Debounce para evitar demasiadas llamadas
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
  resizeTimer = window.setTimeout(() => {
    adjustSlideHeights();
  }, 200);
};

// Función que verifica si se puede avanzar al siguiente slide
const checkCanNavigateNext = async () => {
  if (!swiperInstance.value) return;

  const activeIndex = swiperInstance.value.activeIndex;
  const currentItem = menuStore.items[activeIndex];

  if (
    currentItem &&
    'canNext' in currentItem &&
    typeof currentItem.canNext === 'function'
  ) {
    // Si el ítem tiene una función canNext, la ejecutamos
    canNavigateNext.value = await currentItem.canNext();
  } else {
    // Si no tiene función canNext, permitimos avanzar por defecto
    canNavigateNext.value = true;
  }
};

// Observar cambios en las selecciones del usuario para actualizar la navegación
watch(
  () => [
    userSelectionStore.selectedSurprises.traditional,
    userSelectionStore.selectedSurprises.special,
    userSelectionStore.selectedSurprises.super,
    userSelectionStore.selectedPlan,
    userSelectionStore.selectedTitle,
  ],
  () => {
    console.log('Selección de usuario actualizada, verificando navegación');
    checkCanNavigateNext();
  },
  { deep: true }
);

// Método que permite la navegación directa a un slide específico por índice
// Este método se expondrá para ser usado por componentes padres
const navigateToSlide = (slideIndex: number) => {
  console.log('IndexPage: navigateToSlide llamado con índice:', slideIndex);
  console.log('IndexPage: swiperInstance existe:', !!swiperInstance.value);

  if (!swiperInstance.value) {
    console.error('IndexPage: No hay instancia de swiper disponible');
    return;
  }

  if (userSelectionStore.bought) {
    console.log('IndexPage: No se permite navegación, compra completada');
    return;
  }

  if (slideIndex >= 0 && slideIndex < swiperInstance.value.slides.length) {
    console.log('IndexPage: Navegando al slide', slideIndex);
    // Navegamos al slide con animación
    swiperInstance.value.slideTo(slideIndex, 500);

    // Usando un timeout para simular un callback después de la transición
    setTimeout(() => {
      console.log('IndexPage: Navegación completada al slide', slideIndex);
    }, 600);
  } else {
    console.error(
      'IndexPage: Índice de slide fuera de rango:',
      slideIndex,
      'total slides:',
      swiperInstance.value.slides.length
    );
  }
};

// Crear un sistema simple de eventos para la navegación
const navigateToSlideHandler = (slideIndex: number) => {
  console.log(
    'IndexPage: Handler de navegación llamado con índice:',
    slideIndex
  );
  navigateToSlide(slideIndex);
};

// Exponer el handler de navegación para que otros componentes puedan usarlo
provide('navigateToSlideHandler', navigateToSlideHandler);

// Verificar al montar el componente
onMounted(() => {
  console.log('IndexPage: Componente montado');

  // Intentar navegar si hay una navegación pendiente
  if (pendingNavigationRef.value !== null && swiperInstance.value) {
    const targetIndex = pendingNavigationRef.value;
    pendingNavigationRef.value = null;
    console.log(
      'IndexPage: Procesando navegación pendiente en montaje:',
      targetIndex
    );
    navigateToSlide(targetIndex);
  }

  // Emitir evento para notificar al layout que el componente está montado
  emit('mounted');

  // Esperar a que el DOM esté listo
  nextTick(() => {
    // Inicializar primero
    adjustSlideHeights();

    // Verificar si se puede avanzar inicialmente
    checkCanNavigateNext();

    // Agregar listener para redimensionamientos
    window.addEventListener('resize', handleResize);
  });
});

// Limpiar eventos al desmontar
onBeforeUnmount(() => {
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
  window.removeEventListener('resize', handleResize);
});

// Observar cambios en la navegación pendiente
watch(
  pendingNavigationRef,
  (newIndex) => {
    if (newIndex !== null) {
      console.log(
        'IndexPage: Detectada nueva navegación pendiente a:',
        newIndex
      );

      // Reiniciar inmediatamente el valor para no interferir con futuras navegaciones
      if (pendingNavigationRef.value !== null) {
        const targetIndex = pendingNavigationRef.value;
        pendingNavigationRef.value = null;

        // Esperar a que el swiper esté inicializado
        if (!swiperInstance.value) {
          console.log('IndexPage: Esperando a que swiper esté inicializado...');
          // Guardar la navegación para cuando swiper esté listo
          const checkInterval = setInterval(() => {
            if (swiperInstance.value) {
              clearInterval(checkInterval);
              navigateToSlide(targetIndex);
            }
          }, 100);
          return;
        }

        // Navegar al slide
        navigateToSlide(targetIndex);
      }
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
@use 'sass:color';

.index-page {
  background-color: #fae4aa;
  overflow: hidden;
  height: 100%;
  width: 100%;
  position: relative;
}

.texts-list,
.swiper,
.swiper-slide,
.slide-content {
  height: 100%;
}

:deep(.swiper),
:deep(.swiper-wrapper),
:deep(.swiper-slide) {
  height: 100% !important;
}

.slide-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  height: 0px;
  width: 100%;
  padding: 30px;
  overflow: hidden;
}

.text {
  cursor: grab;
  text-align: center;
  user-select: none;
  color: rgb(243, 202, 18);
  font-family: 'Luckiest Guy', cursive;
  font-size: 30px;
  line-height: 35px;
  text-align: center;
  text-shadow: 0 1px 0px #762f55, 1px 0 0px #9b3d6f, 1px 2px 1px #762f55,
    2px 1px 1px #9b3d6f, 2px 3px 2px #762f55, 3px 2px 2px #9b3d6f,
    3px 4px 2px #762f55, 4px 3px 3px #9b3d6f, 4px 5px 3px #762f55,
    5px 4px 2px #9b3d6f, 5px 6px 2px #762f55, 6px 5px 2px #9b3d6f,
    6px 7px 1px #762f55, 7px 6px 1px #9b3d6f, 7px 8px 0px #762f55,
    8px 7px 0px #9b3d6f;
  text-transform: uppercase;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

:deep(.text b) {
  color: #e61684;
  font-size: 150%;
  line-height: 1.5;
  padding-left: 10px;
  padding-right: 10px;
}

.image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  width: 400px;
}

.image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Ocultar las flechas de navegación nativas de Swiper */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  display: none;
}

/* Nuevos botones de navegación global */
.global-navigation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 50;
}

.global-nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #e61684;
  font-size: 45px;
  width: 60px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  z-index: 51;
  transition: all 0.3s;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.25));

  .nav-arrow {
    display: block;
    font-weight: bold;
    transform: scale(1.2, 1); /* Hacer la flecha más ancha horizontalmente */
    text-shadow: 2px 2px 3px rgba(52, 13, 39, 0.3);
  }

  &:hover {
    color: color.adjust(#e61684, $lightness: -10%);
    transform: translateY(-50%) scale(1.1);
  }

  &.prev {
    left: 20px;
  }

  &.next {
    right: 20px;
  }
}
</style>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="header">
      <div class="stars-container">
        <div class="stars stars-small"></div>
        <div class="stars stars-medium"></div>
        <div class="stars stars-large"></div>
      </div>
      <MainHeader />
      <MainSteps @navigate-to-slide="handleNavigateToSlide" />
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, provide } from 'vue';
import MainHeader from '../components/MainHeader.vue';
import MainSteps from '../components/MainSteps.vue';

// Ref reactiva para la navegación pendiente
const pendingNavigationRef = ref<number | null>(null);

// Proveer la referencia para que los componentes hijos puedan acceder a ella
provide('pendingNavigationRef', pendingNavigationRef);

// Manejador del evento navigateToSlide
const handleNavigateToSlide = (slideIndex: number) => {
  console.log(
    'MainLayout: Evento navigate-to-slide recibido, índice:',
    slideIndex
  );
  // Actualizar la referencia reactiva
  pendingNavigationRef.value = slideIndex;
};

// Cuando se monta el componente
onMounted(() => {
  console.log('MainLayout: Componente montado');
});
</script>

<style lang="scss" scoped>
.header {
  background-color: #340d27;
}
.stars-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.stars-small,
.stars-medium,
.stars-large {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-repeat: repeat;
  background-size: 550px 70px;
}

.stars-small {
  background-image: radial-gradient(
      1px 1px at 25px 5px,
      white,
      rgba(255, 255, 255, 0)
    ),
    radial-gradient(1px 1px at 50px 25px, white, rgba(255, 255, 255, 0)),
    radial-gradient(1px 1px at 125px 20px, white, rgba(255, 255, 255, 0)),
    radial-gradient(1px 1px at 250px 35px, white, rgba(255, 255, 255, 0)),
    radial-gradient(1px 1px at 300px 5px, white, rgba(255, 255, 255, 0)),
    radial-gradient(1px 1px at 400px 15px, white, rgba(255, 255, 255, 0));
  opacity: 0.4;
  animation: twinkle-small 4s ease-in-out infinite;
}

.stars-medium {
  background-image: radial-gradient(
      1.5px 1.5px at 75px 30px,
      white,
      rgba(255, 255, 255, 0)
    ),
    radial-gradient(1.5px 1.5px at 150px 18px, white, rgba(255, 255, 255, 0)),
    radial-gradient(1.5px 1.5px at 225px 38px, white, rgba(255, 255, 255, 0)),
    radial-gradient(1.5px 1.5px at 350px 40px, white, rgba(255, 255, 255, 0));
  opacity: 0.5;
  animation: twinkle-medium 5s ease-in-out infinite;
  animation-delay: 1s;
}

.stars-large {
  background-image: radial-gradient(
      2px 2px at 175px 10px,
      white,
      rgba(255, 255, 255, 0)
    ),
    radial-gradient(
      2px 2px at 250px 25px,
      rgba(255, 223, 186, 1),
      rgba(255, 223, 186, 0)
    ),
    radial-gradient(
      2px 2px at 325px 40px,
      rgba(255, 223, 186, 1),
      rgba(255, 223, 186, 0)
    ),
    radial-gradient(
      2px 2px at 475px 15px,
      rgba(255, 223, 186, 1),
      rgba(255, 223, 186, 0)
    );
  opacity: 0.6;
  animation: twinkle-large 6s ease-in-out infinite;
  animation-delay: 2s;
}

@keyframes twinkle-small {
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 0.3;
  }
}

@keyframes twinkle-medium {
  0% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 0.4;
  }
}

@keyframes twinkle-large {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.5;
  }
}
</style>

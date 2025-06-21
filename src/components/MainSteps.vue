<template>
  <div class="main-steps">
    <div class="clouds"></div>
    <div class="content">
      <div
        v-bind:class="{
          active: menuStore.active === 'select',
          clickable: isClickable('select'),
        }"
        @click="navigateToStep('select')"
      >
        <span>ELIGE TU PIÑATA</span>
      </div>
      <div
        v-bind:class="{
          active: menuStore.active === 'fill',
          clickable: isClickable('fill'),
        }"
        @click="navigateToStep('fill')"
      >
        LLÉNALA DE SORPRESAS
      </div>
      <div
        v-bind:class="{
          active: menuStore.active === 'share',
          clickable: isClickable('share'),
        }"
        @click="navigateToStep('share')"
      >
        REGALA Y COMPARTE
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMenuStore } from '../stores/menu-store';
import { useUserSelectionStore } from '../stores/user-selection-store';
import { onMounted } from 'vue';

const menuStore = useMenuStore();
const userSelectionStore = useUserSelectionStore();
const emits = defineEmits(['navigate-to-slide']);

const isClickable = (step: string) => {
  if (userSelectionStore.bought) {
    return false;
  }
  if (step === 'select') {
    return true;
  }
  if (step === 'fill') {
    return (
      userSelectionStore.selectedPlan > 0 &&
      userSelectionStore.selectedTitle > 0
    );
  }
  if (step === 'share') {
    return (
      userSelectionStore.selectedSurprises.super.length > 0 ||
      userSelectionStore.selectedSurprises.traditional.length > 0 ||
      userSelectionStore.selectedSurprises.special.length > 0
    );
  }
  return false;
};

const navigateToStep = (step: string) => {
  console.log(
    'MainSteps: Click en paso',
    step,
    'clickable:',
    isClickable(step)
  );

  if (!isClickable(step)) {
    console.log('MainSteps: El paso no es clickeable');
    return;
  }

  // Imprimir los elementos del menú para depuración
  console.log(
    'MainSteps: Todos los ítems del menú:',
    menuStore.items.map((item, idx) => ({
      idx,
      key: item.key,
      node: item.node || 'sin-nodo',
      component: 'component' in item ? item.component : 'N/A',
    }))
  );

  // Buscar el índice del primer slide que tenga el nodo correspondiente
  const targetIndex = menuStore.items.findIndex((item) => {
    // Verificar que el ítem tenga un nodo y que coincida con el paso
    return item.node === step;
  });

  console.log('MainSteps: Índice encontrado:', targetIndex, 'para nodo:', step);

  if (targetIndex !== -1) {
    console.log(
      'MainSteps: Emitiendo evento navigate-to-slide con índice:',
      targetIndex
    );
    emits('navigate-to-slide', targetIndex);
  } else {
    console.warn(
      'MainSteps: No se encontró ningún slide con el nodo:',
      step,
      'Verificando todos los nodos:',
      menuStore.items.map((item) => item.node || 'sin-nodo')
    );
  }
};

// Depuración: Mostrar los nodos una vez montado el componente
onMounted(() => {
  console.log('MainSteps: Componente montado');
  console.log('MainSteps: Total de items en menú:', menuStore.items.length);
  console.log(
    'MainSteps: Nodos disponibles:',
    menuStore.items.map((item, index) => ({
      index,
      key: item.key,
      node: item.node,
    }))
  );
});
</script>

<style lang="scss" scoped>
.main-steps {
  width: 100%;
}

.main-steps > .clouds {
  background-image: url('src/assets/images/clouds.png');
  background-repeat: repeat-x;
  background-position-y: 2px;
  height: 68px;
  width: 100%;
  position: relative;
  z-index: 10; /* Valor alto para asegurarnos que esté por encima de las estrellas */
}

.main-steps > .content {
  width: 100%;
  height: auto;
  padding: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #c24747;
  border-bottom: 2px solid #a13b3b;
  padding: 15px;
  overflow: hidden;
}

.main-steps > .content > * {
  text-decoration: none;
  color: #f9c367;
  font-family: 'Luckiest Guy', cursive;
  font-size: 30px;
  line-height: 32px;
  padding: 15px 30px;
  text-shadow: 1px 0px 0px #461010;
  text-align: center;
}

.main-steps > .content > * {
  position: relative;
  transition: color 0.2s, transform 0.2s;
}

.main-steps > .content > *.active {
  color: #ffb01e; /* Un rosa vibrante, puedes cambiarlo */
  transform: scale(1.12);
}

.main-steps > .content > *.clickable {
  cursor: pointer;
}

.main-steps > .content > *::after {
  content: '';
  display: block;
  position: absolute;
  left: 0;
  bottom: 8px;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #be0270 0%, #ffb01e 100%);
  border-radius: 2px;
  transform: scaleX(0);
  transition: transform 0.25s;
}

.main-steps > .content > *.active::after {
  transform: scaleX(1);
}

@media (max-width: 768px) {
  .main-steps > .content > * {
    font-size: 20px;
  }
}
</style>

<template>
  <div class="select-surprise">
    <div class="surprise-panels">
      <!-- Panel de Sorpresas Tradicionales -->
      <div
        class="surprise-panel"
        v-if="currentPlan && currentPlan.options.traditional > 0"
        @click="openModal('traditional')"
      >
        <div class="panel-title">Tradicionales</div>
        <div class="panel-image">
          <img src="/images/traditional.png" alt="Sorpresas tradicionales" />
        </div>
        <div class="panel-counter">
          {{ surpriseStore.selectedSurprises.traditional.length }}/{{
            currentPlan.options.traditional
          }}
        </div>
      </div>

      <!-- Panel de Premios Especiales -->
      <div
        class="surprise-panel"
        v-if="currentPlan && currentPlan.options.special > 0"
        @click="openModal('special')"
      >
        <div class="panel-title">Premios especiales</div>
        <div class="panel-image">
          <img src="/images/special.png" alt="Premios especiales" />
        </div>
        <div class="panel-counter">
          {{ surpriseStore.selectedSurprises.special.length }}/{{
            currentPlan.options.special
          }}
        </div>
      </div>

      <!-- Panel de Super Regalo -->
      <div
        class="surprise-panel"
        v-if="currentPlan && currentPlan.options.super > 0"
        @click="openModal('super')"
      >
        <div class="panel-title">Super regalo</div>
        <div class="panel-image">
          <img src="/images/super.png" alt="Super regalo" />
        </div>
        <div class="panel-counter">
          {{ surpriseStore.selectedSurprises.super.length }}/{{
            currentPlan.options.super
          }}
        </div>
      </div>
    </div>

    <!-- Modal de selección de sorpresas con Teleport -->
    <Teleport to="body">
      <div
        class="surprise-modal-backdrop"
        v-if="showModal"
        @click.self="closeModal"
      >
        <div class="surprise-modal">
          <div class="modal-content">
            <div class="modal-header">
              <div class="modal-title-container">
                <h2 class="modal-title">{{ getModalTitle() }}</h2>
                <div class="modal-counter">
                  {{ surpriseStore.selectedSurprises[currentType].length }}/{{
                    currentPlan?.options[currentType] || 0
                  }}
                </div>
              </div>
              <button class="close-button" @click="closeModal">✕</button>
            </div>
            <div class="modal-body">
              <div class="surprises-grid">
                <div
                  v-for="(surprise, index) in getSurprisesByType()"
                  :key="surprise.id"
                  class="surprise-item"
                  :class="{ selected: isSurpriseSelected(surprise.id) }"
                  @click="toggleSurprise(surprise.id)"
                  :title="surprise.info"
                >
                  <div class="surprise-item-title">{{ surprise.title }}</div>
                  <div class="surprise-item-image">
                    <img :src="surprise.image" :alt="surprise.title" />
                  </div>
                  <div
                    class="surprise-item-tooltip"
                    :class="{ 'tooltip-bottom': index < 4 }"
                  >
                    {{ surprise.info }}
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="save-button" @click="saveAndClose">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useUserSelectionStore } from 'stores/user-selection-store';

const surpriseStore = useUserSelectionStore();

// Definir el emisor de eventos
const emit = defineEmits(['nextStep']);

// Definir tipo para las categorías de sorpresas
type SurpriseType = 'traditional' | 'special' | 'super';

// Modal control
const showModal = ref(false);
const currentType = ref<SurpriseType>('traditional');

// Obtener el plan seleccionado actualmente
const currentPlan = computed(() => {
  if (!surpriseStore.selectedPlan) return null;

  return surpriseStore.plans.find(
    (plan) => plan.id === surpriseStore.selectedPlan
  );
});

// Abrir el modal para un tipo específico
const openModal = (type: SurpriseType) => {
  currentType.value = type;
  showModal.value = true;
  // Evitar scroll del body cuando el modal está abierto
  document.body.style.overflow = 'hidden';
};

// Cerrar el modal sin avanzar a la siguiente diapositiva
const closeModal = () => {
  showModal.value = false;
  // Restaurar scroll del body al cerrar el modal
  document.body.style.overflow = '';
  // No emitir ningún evento aquí, solo cerrar el modal
};

// Método específico para cuando se hace clic en el botón "Cerrar" del footer
const saveAndClose = () => {
  closeModal();
};

// Obtener título del modal según el tipo
const getModalTitle = () => {
  if (currentType.value === 'traditional') return 'Sorpresas Tradicionales';
  if (currentType.value === 'special') return 'Premios especiales';
  if (currentType.value === 'super') return 'Super regalo';
  return '';
};

// Obtener los elementos de sorpresa según el tipo
const getSurprisesByType = () => {
  if (currentType.value === 'traditional')
    return surpriseStore.surprises.surpises;
  if (currentType.value === 'special') return surpriseStore.surprises.special;
  if (currentType.value === 'super') return surpriseStore.surprises.super;
  return [];
};

// Verificar si una sorpresa está seleccionada
const isSurpriseSelected = (id: number) => {
  return surpriseStore.selectedSurprises[currentType.value].includes(id);
};

// Toggle para seleccionar/deseleccionar una sorpresa
const toggleSurprise = (id: number) => {
  const selected = surpriseStore.selectedSurprises[currentType.value];
  const maxAllowed = currentPlan.value?.options[currentType.value] || 0;

  if (selected.includes(id)) {
    // Deseleccionar
    const index = selected.indexOf(id);
    if (index !== -1) {
      surpriseStore.selectedSurprises[currentType.value].splice(index, 1);
    }
  } else {
    // Seleccionar si no se ha alcanzado el máximo
    if (selected.length < maxAllowed) {
      surpriseStore.selectedSurprises[currentType.value].push(id);
    }
  }
};
</script>

<style lang="scss" scoped>
@use 'sass:color';

.select-surprise {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.surprise-panels {
  display: flex;
  justify-content: center;
  gap: 30px;
  width: 100%;
  max-width: 1000px;
}

.surprise-panel {
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.7) 60%
  );
  border-radius: 15px;
  padding: 20px;
  width: 250px;
  height: 300px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: relative;
  border: 2px solid #fff;
  transition: transform 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
  }
}

.panel-title {
  font-family: 'Luckiest Guy', cursive;
  font-size: 24px;
  color: #e61684;
  text-align: center;
}

.panel-image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.panel-image::before {
  content: '';
  display: block;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.panel-image img {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 50%;
  position: relative;
  z-index: 2;
}

.panel-counter {
  font-family: 'Luckiest Guy', cursive;
  font-size: 20px;
  color: #666;
  text-align: center;
  padding: 10px 0;
}

/* Estilos para el modal con teleport */
.surprise-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.surprise-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 100%;
  height: 100%;
  background-color: #fae4aa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background-color: #e61684;
  color: white;
}

.modal-title-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.modal-title {
  font-family: 'Luckiest Guy', cursive;
  font-size: 32px;
  margin: 0;
}

.modal-counter {
  font-family: 'Luckiest Guy', cursive;
  font-size: 24px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 5px 15px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

.modal-body {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.surprises-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
  max-width: 1400px;
  margin: 0 auto;
}

.surprise-item {
  background: white;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
  border: 3px solid transparent;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);

    .surprise-item-tooltip {
      opacity: 1;
      transform: translateY(0);
      visibility: visible;
    }
  }

  &.selected {
    border-color: #e61684;
  }
}

.surprise-item-title {
  font-family: 'Luckiest Guy', cursive;
  font-size: 22px;
  color: #e61684;
  text-align: center;
}

.surprise-item-image {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    mix-blend-mode: multiply;
  }
}

.surprise-item-tooltip {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;
  background-color: #333;
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s;
  visibility: hidden;
  z-index: 10;
  text-align: center;

  &:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }

  &.tooltip-bottom {
    bottom: auto;
    top: 100%;
    transform: translateY(-10px);

    &:after {
      top: auto;
      bottom: 100%;
      border-color: transparent transparent #333 transparent;
    }
  }
}

.modal-footer {
  padding: 25px;
  display: flex;
  justify-content: center;
  background-color: #fae4aa;
}

.save-button {
  background-color: #e61684;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 15px 40px;
  font-family: 'Luckiest Guy', cursive;
  font-size: 22px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: color.adjust(#e61684, $lightness: -10%);
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
}
</style>

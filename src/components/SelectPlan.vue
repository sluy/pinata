<template>
  <div class="select-plan">
    <div class="plans-border">
      <Swiper
        :modules="modules"
        :slides-per-view="3"
        :space-between="30"
        :navigation="false"
        :nested="true"
        :touchStartPreventDefault="false"
        class="plans-swiper"
      >
        <SwiperSlide v-for="(plan, index) in planStore.plans" :key="index">
          <div
            class="select-plan-item"
            @click="selectPlan(plan.id)"
            :class="{ selected: planStore.selectedPlan === plan.id }"
          >
            <div class="select-plan-title">{{ plan.title }}</div>
            <ul class="select-plan-options">
              <li>{{ plan.options.traditional }} Sorpresas Tradicionales</li>
              <li v-show="plan.options.special > 0">
                {{ plan.options.special }}
                {{
                  plan.options.special > 1
                    ? 'Premios Especiales'
                    : 'Premio Especial'
                }}
              </li>
              <li v-show="plan.options.super > 0">
                {{ plan.options.super }}
                {{ plan.options.super > 1 ? 'Super regalos' : 'Super regalo' }}
              </li>
              <li style="padding-top: 15px">
                1 - {{ plan.options.members }} Invitados
              </li>
            </ul>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation } from 'swiper/modules';
import { computed } from 'vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { useUserSelectionStore } from 'stores/user-selection-store';

const modules = [Navigation];
const planStore = useUserSelectionStore();

// Definir el emisor de eventos
const emit = defineEmits(['planSelected', 'nextStep']);

const selectPlan = (planId: number) => {
  planStore.setSelectedPlan(planId);
  // Emitir evento para que el componente padre avance a la siguiente diapositiva global
  emit('planSelected', planId);
  emit('nextStep');
};
</script>

<style lang="scss" scoped>
.select-plan {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  cursor: pointer;
  overflow: hidden; /* Evitar desbordamiento */
}

.plans-border {
  width: 100%;
  max-width: 95%; /* Limitar ancho máximo */
  border-radius: 20px;
  background: #fff0;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  position: relative;
  overflow: visible; /* Permitir que se vean las flechas */
}

.plans-swiper {
  width: 100%;
  height: 100%;
  padding-left: 10px;
  padding-right: 10px;
  box-sizing: border-box;
  position: relative;
  padding-top: 20px;
  padding-bottom: 20px;
}

.select-plan-item {
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.7) 60%
  );
  border-radius: 15px;
  padding: 15px;
  height: 200px;
  max-width: 220px; /* Limitar ancho máximo */
  margin: 0 auto; /* Centrar cada ítem */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: relative;
  border: 2px solid #fff;
}

.select-plan-title {
  font-family: 'Luckiest Guy', cursive;
  font-size: 22px; /* Reducir tamaño de fuente */
  color: #e61684;
  text-align: center;
}

.select-plan-options {
  list-style: none;
  padding: 0;
  margin: 0;
  font-family: 'Luckiest Guy', cursive;

  li {
    text-align: center;
    margin-bottom: 10px;
    color: #666;
    font-size: 14px; /* Reducir tamaño de fuente */
  }
}

.select-plan-item.selected {
  border: 2px solid #e61684;
}

/* Ajustar el Swiper para mostrar correctamente los 3 elementos */
:deep(.swiper-wrapper) {
  display: flex;
  justify-content: center;
}

:deep(.swiper-slide) {
  display: flex;
  justify-content: center;
  width: auto !important; /* Permitir que el ancho se adapte al contenido */
  max-width: 33.33%; /* No exceder 1/3 del ancho disponible */
}
</style>

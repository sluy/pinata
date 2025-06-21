<template>
  <div class="buy-now">
    <div class="buy-now-border">
      <div class="buy-now-panel">
        <div class="buy-now-title">¡Ya casi estás listo!</div>

        <div class="buy-now-intro">
          Felicidades, estás a punto de adquirir tu piñata virtual, verifica la
          información y si es correcta haz clic en el botón "Comprar". Al
          finalizar el pago aparecerá un código QR que podrás enviar a tus
          invitados y comenzar la diversión.
        </div>

        <div class="buy-now-info">
          <div class="info-row">
            <div class="info-label">Tipo de Piñata:</div>
            <div class="info-value">{{ selectedPlanName }}</div>
            <div class="info-label right">Fecha de activación:</div>
            <div class="info-value">{{ formattedDate }}</div>
          </div>

          <div class="info-row surprises-row">
            <template v-if="hasTraditionalSurprises">
              <div class="info-label">Sorpresas tradicionales:</div>
              <div class="info-value">{{ countTraditionalSurprises }}</div>
            </template>

            <template v-if="hasSpecialSurprises">
              <div
                class="info-label"
                :class="{ 'ml-20': hasTraditionalSurprises }"
              >
                Regalos especiales:
              </div>
              <div class="info-value">{{ countSpecialSurprises }}</div>
            </template>

            <template v-if="hasSuperSurprises">
              <div
                class="info-label"
                :class="{
                  'ml-20': hasTraditionalSurprises || hasSpecialSurprises,
                }"
              >
                Super regalos:
              </div>
              <div class="info-value">{{ countSuperSurprises }}</div>
            </template>
          </div>

          <div class="info-row">
            <div class="info-label">Invitados:</div>
            <div class="info-value">1 - {{ maxMembers }}</div>
          </div>

          <div class="info-row">
            <div class="info-label">Mensaje de bienvenida:</div>
            <div class="info-value message">{{ messageText }}</div>
          </div>
        </div>

        <button class="buy-button" @click="handleBuy">Comprar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserSelectionStore } from 'stores/user-selection-store';
import { computed } from 'vue';

const userSelectionStore = useUserSelectionStore();
const emit = defineEmits(['nextStep']);

// Obtener el plan seleccionado
const selectedPlan = computed(() => {
  return userSelectionStore.plans.find(
    (plan) => plan.id === userSelectionStore.selectedPlan
  );
});

// Nombre del plan seleccionado
const selectedPlanName = computed(() => {
  return selectedPlan.value?.title || 'No seleccionado';
});

// Formatear la fecha
const formattedDate = computed(() => {
  if (!userSelectionStore.selectedDate) return 'No seleccionada';

  const date = userSelectionStore.selectedDate;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
});

// Verificar si hay sorpresas de cada tipo
const hasTraditionalSurprises = computed(() => {
  return (selectedPlan.value?.options.traditional || 0) > 0;
});

const hasSpecialSurprises = computed(() => {
  return (selectedPlan.value?.options.special || 0) > 0;
});

const hasSuperSurprises = computed(() => {
  return (selectedPlan.value?.options.super || 0) > 0;
});

// Contar las sorpresas seleccionadas
const countTraditionalSurprises = computed(() => {
  return userSelectionStore.selectedSurprises.traditional.length;
});

const countSpecialSurprises = computed(() => {
  return userSelectionStore.selectedSurprises.special.length;
});

const countSuperSurprises = computed(() => {
  return userSelectionStore.selectedSurprises.super.length;
});

// Obtener el número máximo de invitados
const maxMembers = computed(() => {
  return selectedPlan.value?.options.members || 0;
});

// Obtener el mensaje (o mostrar "Sin mensaje" si está vacío)
const messageText = computed(() => {
  return userSelectionStore.selectedMessage.trim() || 'Sin mensaje';
});

// Función para manejar la compra
const handleBuy = () => {
  // Marcar como comprado
  userSelectionStore.bought = true;

  // Avanzar a la siguiente pantalla
  emit('nextStep');
};
</script>

<style lang="scss" scoped>
@use 'sass:color';

.buy-now {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.buy-now-border {
  width: 100%;
  max-width: 800px;
  border-radius: 20px;
  background: #fff0;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.buy-now-panel {
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.7) 60%
  );
  border-radius: 15px;
  padding: 30px;
  width: 100%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 25px;
  position: relative;
  border: 2px solid #fff;
}

.buy-now-title {
  font-family: 'Luckiest Guy', cursive;
  font-size: 32px;
  color: #e61684;
  text-align: center;
  margin-bottom: 5px;
}

.buy-now-intro {
  font-family: 'Luckiest Guy', cursive;
  color: #666;
  font-size: 16px;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 20px;
}

.buy-now-info {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.surprises-row {
  flex-wrap: wrap;
}

.info-label {
  font-family: 'Luckiest Guy', cursive;
  color: #e61684;
  font-size: 16px;
  min-width: 140px;

  &.right {
    margin-left: auto;
  }

  &.ml-20 {
    margin-left: 20px;
  }
}

.info-value {
  font-family: 'Luckiest Guy', cursive;
  color: #444;
  font-size: 16px;
  margin-right: 20px;

  &.message {
    flex: 1;
    overflow-wrap: break-word;
    word-wrap: break-word;
    max-width: 100%;
  }
}

.buy-button {
  background-color: #e61684;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 15px 40px;
  font-family: 'Luckiest Guy', cursive;
  font-size: 22px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 20px;
  align-self: center;

  &:hover {
    background-color: color.adjust(#e61684, $lightness: -10%);
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
}
</style>

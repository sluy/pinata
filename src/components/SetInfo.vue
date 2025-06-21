<template>
  <div class="set-info">
    <div class="info-border">
      <div class="info-panel">
        <div class="info-title">Completa la información</div>

        <div class="form-group">
          <label for="date-input">Fecha y hora de la sorpresa:</label>
          <input
            type="datetime-local"
            id="date-input"
            v-model="dateTime"
            class="form-input"
            :min="minDateTime"
            @change="onDateChange"
          />
          <div class="input-help" v-if="dateError">
            <span class="error-message"
              >Por favor selecciona una fecha y hora futura</span
            >
          </div>
        </div>

        <div class="form-group">
          <label for="message-input">Mensaje personalizado:</label>
          <textarea
            id="message-input"
            v-model="message"
            class="form-input"
            placeholder="Escribe un mensaje para acompañar tu sorpresa..."
            maxlength="255"
            @input="updateMessage"
          ></textarea>
          <div class="character-count">{{ message.length }}/255</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserSelectionStore } from 'stores/user-selection-store';
import { ref, computed, onMounted, watch } from 'vue';

const userSelectionStore = useUserSelectionStore();
const emit = defineEmits(['nextStep']);

// Variables para los inputs
const dateTime = ref('');
const message = ref(userSelectionStore.selectedMessage || '');

// Actualizar fecha en el store
const updateDate = (shouldEmit = false) => {
  if (!dateError.value) {
    userSelectionStore.selectedDate = new Date(dateTime.value);
    if (shouldEmit) {
      emit('nextStep');
    }
  }
};

// Manejador del evento change del input de fecha
const onDateChange = (event: Event) => {
  updateDate(true); // Emitir el evento cuando el usuario cambia la fecha
};

// Actualizar mensaje en el store
const updateMessage = () => {
  userSelectionStore.selectedMessage = message.value;
};

// Calcular la fecha y hora mínima (actual)
const minDateTime = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
});

// Validar que la fecha sea futura
const dateError = computed(() => {
  if (!dateTime.value) return true;

  const selectedDate = new Date(dateTime.value);
  const now = new Date();

  return selectedDate <= now;
});

// Establecer fecha inicial si existe en el store o usar fecha por defecto
onMounted(() => {
  // Si ya hay una fecha en el store, formatearla para el input datetime-local
  if (userSelectionStore.selectedDate) {
    const date = userSelectionStore.selectedDate;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    dateTime.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    updateDate(false); // No emitir el evento al inicializar
  } else {
    // Si no hay fecha, usar una hora en el futuro por defecto
    const now = new Date();
    now.setHours(now.getHours() + 1); // Añadir una hora por defecto

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    dateTime.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    updateDate(false); // No emitir el evento al inicializar
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:color';

.set-info {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.info-border {
  width: 100%;
  max-width: 600px;
  border-radius: 20px;
  background: #fff0;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.info-panel {
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

.info-title {
  font-family: 'Luckiest Guy', cursive;
  font-size: 28px;
  color: #e61684;
  text-align: center;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-family: 'Luckiest Guy', cursive;
  font-size: 18px;
  color: #666;
}

.form-input {
  padding: 12px 15px;
  border-radius: 10px;
  border: 2px solid #ddd;
  font-size: 16px;
  font-family: 'Luckiest Guy', cursive;
  transition: border-color 0.3s;
  background-color: rgba(255, 255, 255, 0.7);

  &:focus {
    outline: none;
    border-color: #e61684;
    box-shadow: 0 0 0 3px rgba(230, 22, 132, 0.2);
  }

  &::placeholder {
    font-family: 'Luckiest Guy', cursive;
    opacity: 0.6;
  }
}

textarea.form-input {
  min-height: 100px;
  resize: vertical;
}

.input-help {
  font-size: 14px;
  margin-top: 5px;
}

.error-message {
  color: #e61684;
  font-weight: bold;
}

.character-count {
  text-align: right;
  font-size: 14px;
  color: #666;
}

.save-button {
  background-color: #e61684;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 15px 30px;
  font-family: 'Luckiest Guy', cursive;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
  align-self: center;

  &:hover:not(:disabled) {
    background-color: color.adjust(#e61684, $lightness: -10%);
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
}
</style>

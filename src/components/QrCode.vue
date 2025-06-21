<template>
  <div class="qr-code-screen">
    <div class="qr-content">
      <!-- Lado izquierdo: mensaje de éxito -->
      <div class="message-container">
        <div class="title">Compra exitosa</div>
        <div class="instructions">
          Copie y comparta este código QR con sus invitados.
          <br />
          El enlace les permitirá conectarse con su piñata y jugar a partir de
          las <span class="highlight">{{ formattedTime }}</span> día
          <span class="highlight">{{ formattedDate }}</span>
        </div>
      </div>

      <!-- Lado derecho: código QR -->
      <div class="qr-container">
        <qrcode-vue
          :value="qrValue"
          :size="200"
          level="H"
          render-as="svg"
          class="qr-image"
          :background="'rgba(255,255,255,1)'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserSelectionStore } from 'stores/user-selection-store';
import { computed } from 'vue';
import QrcodeVue from 'qrcode.vue';

const userSelectionStore = useUserSelectionStore();

// Generar un valor aleatorio para el QR que incluya la información de la piñata
const qrValue = computed(() => {
  const pinataId = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, '0');
  const selectedDate = userSelectionStore.selectedDate || new Date();
  const timestamp = selectedDate.getTime();

  return `https://www.tusorpresota.com.ve/pinata/${pinataId}?plan=${userSelectionStore.selectedPlan}&title=${userSelectionStore.selectedTitle}&date=${timestamp}`;
});

// Formatear la fecha para mostrar
const formattedDate = computed(() => {
  if (!userSelectionStore.selectedDate) return 'XX/XX/XXXX';

  const date = userSelectionStore.selectedDate;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
});

// Formatear la hora para mostrar
const formattedTime = computed(() => {
  if (!userSelectionStore.selectedDate) return 'XX:XX';

  const date = userSelectionStore.selectedDate;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
});
</script>

<style lang="scss" scoped>
.qr-code-screen {
  width: 100%;
  height: 100%;
  max-width: 900px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  box-sizing: border-box;
  /* No background color - uses the app's default background */
}

.qr-content {
  display: flex;
  flex-direction: row; /* Horizontal layout */
  align-items: center; /* Center vertically */
  justify-content: space-between; /* Space between text and QR */
  width: 100%;
  max-width: 1200px;
  gap: 40px;
}

.message-container {
  flex: 1;
  text-align: left;
}

.title {
  font-family: 'Luckiest Guy', cursive;
  font-size: 48px;
  color: #e61684;
  margin-bottom: 20px;
  text-shadow: 0 1px 0px #762f55, 1px 0 0px #9b3d6f, 1px 2px 1px #762f55,
    2px 1px 1px #9b3d6f, 2px 3px 2px #762f55;
}

.instructions {
  font-family: 'Luckiest Guy', cursive;
  font-size: 24px;
  line-height: 1.5;
  color: rgb(243, 202, 18);
  text-shadow: 0 1px 0px #762f55, 1px 0 0px #9b3d6f, 1px 2px 1px #762f55,
    2px 1px 1px #9b3d6f, 2px 3px 2px #762f55;

  .highlight {
    color: #e61684;
  }
}

.qr-container {
  background-color: transparent;
  border-radius: 20px;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-image {
  display: block;
}

/* Responsive design */
@media (max-width: 900px) {
  .qr-content {
    flex-direction: column;
    gap: 30px;
  }

  .message-container {
    text-align: center;
  }

  .title {
    font-size: 36px;
  }

  .instructions {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .qr-code-screen {
    padding: 20px;
  }

  .title {
    font-size: 28px;
  }

  .instructions {
    font-size: 16px;
  }

  .qr-container {
    padding: 15px;
  }

  .qr-image {
    width: 200px;
    height: 200px;
  }
}
</style>

<template>
  <div class="select-title">
    <div class="titles-border">
      <Swiper
        :modules="modules"
        :slides-per-view="1"
        :space-between="30"
        :navigation="false"
        :nested="true"
        :touchStartPreventDefault="false"
        class="titles-swiper"
      >
        <SwiperSlide
          v-for="(chunk, slideIndex) in titleChunks"
          :key="slideIndex"
        >
          <div class="titles-grid">
            <div
              v-for="title in chunk"
              :key="title.id"
              class="select-title-item"
              @click="selectTitle(title.id)"
              :class="{ selected: titleStore.selectedTitle === title.id }"
            >
              <div class="select-title-name">{{ title.title }}</div>
              <div class="select-title-image">
                <img :src="title.image" :alt="title.title" />
              </div>
            </div>
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
const titleStore = useUserSelectionStore();

// Definir el emisor de eventos
const emit = defineEmits(['titleSelected', 'nextStep']);

const selectTitle = (titleId: number) => {
  titleStore.setSelectedTitle(titleId);
  // Emitir evento para que el componente padre avance a la siguiente diapositiva global
  emit('titleSelected', titleId);
  emit('nextStep');
};

// Agrupar los títulos en chunks de 6 para mostrar 6 por slide
const titleChunks = computed(() => {
  const titles = titleStore.titles;
  const chunks = [];
  for (let i = 0; i < titles.length; i += 6) {
    chunks.push(titles.slice(i, i + 6));
  }
  return chunks;
});
</script>

<style lang="scss" scoped>
.select-title {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  cursor: pointer;
  overflow: hidden;
}

.titles-border {
  width: 100%;
  max-width: 95%;
  border-radius: 20px;
  background: #fff0;
  padding: 0 0px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  position: relative;
  overflow: visible;
}

.titles-swiper {
  width: 100%;
  height: 100%;
  padding-left: 40px;
  padding-right: 40px;
  box-sizing: border-box;
  position: relative;
  padding-top: 20px;
  padding-bottom: 20px;
}

.titles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  padding: 10px;
}

.select-title-item {
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.7) 60%
  );
  border-radius: 15px;
  padding: 15px;
  height: 180px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  border: 2px solid #fff;
  transition: border-color 0.2s;
}

.select-title-name {
  font-family: 'Luckiest Guy', cursive;
  font-size: 20px;
  color: #e61684;
  text-align: center;
}

.select-title-image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.select-title-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
  filter: contrast(1.1);
}

.select-title-item.selected {
  border: 2px solid #e61684;
}

:deep(.swiper-wrapper) {
  display: flex;
  justify-content: center;
}

:deep(.swiper-slide) {
  display: flex;
  justify-content: center;
  width: auto !important;
  max-width: 100%;
}
</style>

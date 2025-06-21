<template>
  <div class="main-header">
    <MainLogo />
  </div>
</template>
<script setup lang="ts">
import MainLogo from './MainLogo.vue';
</script>

<style lang="scss" scoped>
.main-header {
  height: auto;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 20px;
}
</style>

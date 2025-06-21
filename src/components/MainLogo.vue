<template>
  <div class="main-logo-container">
    <a href="/" class="logo-link">
      <div class="main-logo">
        <div class="oval"></div>
        <div class="text">
          <span style="color: #fff"> TU </span>
          <span> SORPRESOTA </span>
        </div>
      </div>
    </a>
    <a class="link" href="/">www.tusorpresota.com.ve</a>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.main-logo-container {
  text-align: center;
  transition: transform 0.25s cubic-bezier(0.4, 1.5, 0.5, 1);
}

.main-logo-container:hover {
  transform: scale(1.2);
}

.logo-link {
  display: block;
  text-decoration: none;
}

.main-logo {
  position: relative;
  height: auto;
  width: 250px;
  text-align: center;
  margin-bottom: 15px;
}
.main-logo > .oval {
  margin-top: 15px;
  display: inline-block;
  width: 150px;
  height: 100px;
  position: relative;
  border-radius: 50%;
  z-index: 1;
  transform: rotate(-8deg);
  background: linear-gradient(120deg, #ffe9a0 0%, #fcd375 60%, #f7b85c 100%);
  overflow: visible;
}

.main-logo > .oval::before {
  content: '';
  position: absolute;
  top: -7px;
  left: -7px;
  width: 164px;
  height: 114px;
  border-radius: 50%;
  z-index: -1;
  background: linear-gradient(120deg, #ffb86b 0%, #dd7b3a 100%);
}

.main-logo > .text {
  position: absolute;
  z-index: 2;
  font-size: 40px;
  font-family: 'Luckiest Guy', cursive;
  color: #fbd148;
  text-shadow: 0 4px 0 #762f55, 0 8px 12px #9b3d6f;
  text-align: center;
  line-height: 40px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-shadow: 0 1px 0px #762f55, 1px 0 0px #9b3d6f, 1px 2px 1px #762f55,
    2px 1px 1px #9b3d6f, 2px 3px 2px #762f55, 3px 2px 2px #9b3d6f,
    3px 4px 2px #762f55, 4px 3px 3px #9b3d6f, 4px 5px 3px #762f55,
    5px 4px 2px #9b3d6f, 5px 6px 2px #762f55, 6px 5px 2px #9b3d6f,
    6px 7px 1px #762f55, 7px 6px 1px #9b3d6f, 7px 8px 0px #762f55,
    8px 7px 0px #9b3d6f;
}
.link {
  color: #fff;
  font-size: 15px;
  text-decoration: none;
  font-weight: bold;
}
</style>

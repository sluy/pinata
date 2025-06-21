<template>
  <q-page class="flex flex-center pinata-container">
    <!-- Nubes de fondo -->
    <div class="clouds-container">
      <div class="cloud cloud1"></div>
      <div class="cloud cloud2"></div>
      <div class="cloud cloud3"></div>
      <div class="cloud cloud4"></div>
      <div class="cloud cloud5"></div>
    </div>

    <!-- Audio para el sonido de golpe -->
    <audio ref="hitSoundRef" src="/sounds/woop.mp3" preload="auto"></audio>

    <!-- Audio para el sonido de ruptura -->
    <audio
      ref="breakSoundRef"
      src="/sounds/game-over.mp3"
      preload="auto"
    ></audio>

    <!-- Capa de detección de golpes (cubre toda la pantalla) -->
    <div
      class="hit-detector"
      @mousedown="startSwipe"
      @touchstart="startSwipe"
      @mousemove="handleSwipe"
      @touchmove="handleSwipe"
      @mouseup="endSwipe"
      @touchend="endSwipe"
      @mouseleave="endSwipe"
    ></div>

    <!-- Piñata (solo recibe los golpes, no los eventos) -->
    <div
      ref="pinataRef"
      class="pinata"
      :class="{ breaking: isBreaking, broken: isBroken }"
    >
      <!-- Piñata completa (visible solo cuando no está rota ni rompiéndose) -->
      <img
        v-if="!isBreaking && !isBroken"
        src="/images/pinata3.png"
        alt="pégale"
      />

      <!-- Efecto de crack cuando se rompe -->
      <div v-if="isBreaking && !isBroken" class="crack-effect">
        <svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M50,0 L45,40 L55,70 L42,100 L58,130 L48,160 L50,200"
            stroke="white"
            stroke-width="3"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- Mitades de la piñata (visible cuando se rompe) -->
      <div v-if="isBreaking || isBroken" class="pinata-parts">
        <div class="pinata-half left">
          <img src="/images/pinata3.png" alt="mitad izquierda" />
        </div>
        <div class="pinata-half right">
          <img src="/images/pinata3.png" alt="mitad derecha" />
        </div>
      </div>

      <!-- Confeti que cae cuando se rompe -->
      <div v-if="isBroken" class="confetti-container">
        <div
          v-for="n in 30"
          :key="n"
          class="confetti"
          :style="getConfettiStyle(n)"
        ></div>
      </div>
    </div>

    <!-- Efectos de corte - solo visibles durante el drag -->
    <div
      v-for="(slash, index) in slashEffects"
      :key="index"
      class="slash"
      :style="slashStyle(slash)"
      v-show="isSlashing"
    ></div>

    <!-- Contador de golpes (aparece al golpear) -->
    <div class="hit-counter" v-if="showHitCounter" :class="hitValueClass">
      {{ hitValueDisplayed }}
    </div>

    <!-- Contenedor para contador y botón de reinicio -->
    <div class="dev-controls">
      <div class="dev-counter">
        Golpes: {{ parseFloat(hitCount.toFixed(1)) }} / {{ hitsNeeded }}
      </div>
      <button class="reset-button" @click="resetGame">Reiniciar</button>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';

// Referencias y estado
const pinataRef = ref<HTMLElement | null>(null);
const hitSoundRef = ref<HTMLAudioElement | null>(null);
const breakSoundRef = ref<HTMLAudioElement | null>(null);
const isSlashing = ref(false);
const startPosition = reactive({ x: 0, y: 0 });
const lastPosition = reactive({ x: 0, y: 0 });
const lastMoveTime = ref(0);
const pinataPosition = reactive({ x: 0, y: 0, rotation: 0 });
const slashEffects = ref<
  Array<{
    x: number;
    y: number;
    angle: number;
    opacity: number;
    length: number;
  }>
>([]);

// Parámetros de física
const springForce = 0.1; // Fuerza de retorno al centro
const friction = 0.95; // Fricción
const velocity = reactive({ x: 0, y: 0, rotation: 0 });

// Contador de golpes y estado de ruptura
const hitCount = ref(0);
const hitsNeeded = 30; // Número de golpes necesarios para romper la piñata
const isBreaking = ref(false);
const isBroken = ref(false);
const showHitCounter = ref(false);
const hasHitDuringSwipe = ref(false); // Para controlar que cada swipe cuente solo una vez
const hitValueDisplayed = ref(''); // Para mostrar el valor del golpe actual
const hitValueClass = ref(''); // Para aplicar clase según intensidad

// Variables para medir la intensidad del golpe
const swipeStartTime = ref(0);
const swipeDistance = ref(0);
const swipeMaxSpeed = ref(0);
const swipeDirectDistance = ref(0); // Distancia directa entre punto inicial y final

// Función para reiniciar el juego
function resetGame() {
  // Restablecer contadores
  hitCount.value = 0;
  isBreaking.value = false;
  isBroken.value = false;
  hasHitDuringSwipe.value = false;
  showHitCounter.value = false;

  // Limpiar efectos
  slashEffects.value = [];

  // Restablecer posición y movimiento
  pinataPosition.x = 0;
  pinataPosition.y = 0;
  pinataPosition.rotation = 0;
  velocity.x = 0;
  velocity.y = 0;
  velocity.rotation = 0;

  // Aplicar transformación inmediatamente
  if (pinataRef.value) {
    pinataRef.value.style.transform = 'translate(0px, 0px) rotate(0deg)';
  }

  console.log('Juego reiniciado');
}

// Estilo para los efectos de corte
const slashStyle = computed(
  () =>
    (slash: {
      x: number;
      y: number;
      angle: number;
      opacity: number;
      length: number;
    }) => {
      return {
        left: `${slash.x}px`,
        top: `${slash.y}px`,
        transform: `rotate(${slash.angle}deg)`,
        opacity: slash.opacity,
        width: `${slash.length}px`,
      };
    }
);

// Generar estilos aleatorios para el confeti
function getConfettiStyle(n: number) {
  const hue = (n * 12) % 360;
  const delay = (n % 10) * 0.1;
  const size = Math.floor(Math.random() * 10) + 5;
  const left = Math.floor(Math.random() * 100);
  const animationDuration = Math.floor(Math.random() * 3) + 2;

  return {
    backgroundColor: `hsl(${hue}, 90%, 65%)`,
    animationDelay: `${delay}s`,
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDuration: `${animationDuration}s`,
  };
}

// Iniciar un swipe
function startSwipe(e: MouseEvent | TouchEvent) {
  // Si la piñata ya está rota, no responder a nuevos golpes
  if (isBreaking.value || isBroken.value) return;

  isSlashing.value = true;
  const pos = getEventPosition(e);
  if (pos) {
    startPosition.x = pos.x;
    startPosition.y = pos.y;
    lastPosition.x = pos.x;
    lastPosition.y = pos.y;
    lastMoveTime.value = Date.now();
  }

  // Reiniciamos el indicador para este nuevo swipe
  hasHitDuringSwipe.value = false;

  // Reiniciamos las variables de intensidad
  swipeStartTime.value = Date.now();
  swipeDistance.value = 0;
  swipeMaxSpeed.value = 0;
  swipeDirectDistance.value = 0;

  // Limpiar efectos anteriores
  slashEffects.value = [];
}

// Manejar el movimiento durante un swipe
function handleSwipe(e: MouseEvent | TouchEvent) {
  if (!isSlashing.value || isBreaking.value || isBroken.value) return;

  const pos = getEventPosition(e);
  if (!pos) return;

  // Calcular tiempo transcurrido para la velocidad
  const currentTime = Date.now();
  const deltaTime = Math.max(1, currentTime - lastMoveTime.value); // Evitar división por cero

  // Calcular distancia desde la última posición
  const dx = pos.x - lastPosition.x;
  const dy = pos.y - lastPosition.y;

  // Calcular velocidad (píxeles por milisegundo)
  const speedX = dx / deltaTime;
  const speedY = dy / deltaTime;
  const speed = Math.sqrt(speedX * speedX + speedY * speedY);

  // Actualizar la velocidad máxima si es mayor
  swipeMaxSpeed.value = Math.max(swipeMaxSpeed.value, speed);

  // Solo aplicar un corte si el movimiento es significativo
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > 10) {
    // Actualizar la distancia total recorrida
    swipeDistance.value += distance;

    // Calcular distancia directa desde el inicio del swipe
    const totalDistanceX = pos.x - startPosition.x;
    const totalDistanceY = pos.y - startPosition.y;
    swipeDirectDistance.value = Math.sqrt(
      totalDistanceX * totalDistanceX + totalDistanceY * totalDistanceY
    );

    // Añadir el efecto visual del corte
    addSlashEffect(lastPosition.x, lastPosition.y, pos.x, pos.y);

    // Aplicar fuerza a la piñata solo si el corte pasa cerca de ella
    const pinataCenter = getPinataCenter();
    const distanceToPinata = getDistanceToLine(
      pinataCenter.x,
      pinataCenter.y,
      lastPosition.x,
      lastPosition.y,
      pos.x,
      pos.y
    );

    // Si el corte está cerca de la piñata y no hemos contado este swipe antes, contar golpe
    if (distanceToPinata < 150 && !hasHitDuringSwipe.value) {
      // Marcar que ya hemos contado un golpe para este swipe
      hasHitDuringSwipe.value = true;

      // Reproducir sonido de golpe
      playHitSound();

      // La intensidad se calcula después, al terminar el swipe

      // Mostrar contador brevemente
      showHitCounter.value = true;
      setTimeout(() => {
        showHitCounter.value = false;
      }, 1000);
    }

    // Calcular la intensidad basada en la velocidad y distancia
    // Aplica fuerza si está cerca de la piñata, independientemente de si ya contamos el golpe
    if (distanceToPinata < 150) {
      // Normalizar la velocidad a un rango razonable (0.05 - 0.3)
      const speedFactor = Math.min(0.3, Math.max(0.05, speed * 10));

      // La fuerza aplicada depende de la velocidad del movimiento
      velocity.x += dx * speedFactor;
      velocity.y += dy * speedFactor;

      // Rotación basada en distancia y dirección
      const rotationFactor = Math.min(0.03, Math.max(0.01, speed * 5));
      velocity.rotation += (dx > 0 ? 1 : -1) * distance * rotationFactor;
    }

    // Actualizar la posición de inicio para el próximo movimiento
    lastPosition.x = pos.x;
    lastPosition.y = pos.y;
    lastMoveTime.value = currentTime;
  }
}

// Finalizar un swipe
function endSwipe() {
  // Si no estamos haciendo un swipe o ya se rompió, no hacer nada
  if (!isSlashing.value || isBreaking.value || isBroken.value) {
    isSlashing.value = false;
    return;
  }

  // Si golpeamos la piñata durante este swipe, calcular y aplicar la intensidad
  if (hasHitDuringSwipe.value) {
    // Calcular duración total del swipe
    const swipeDuration = (Date.now() - swipeStartTime.value) / 1000; // en segundos

    // Para debug
    console.log({
      swipeDistance: swipeDistance.value.toFixed(2),
      swipeDirectDistance: swipeDirectDistance.value.toFixed(2),
      swipeMaxSpeed: swipeMaxSpeed.value.toFixed(4),
      swipeDuration: swipeDuration.toFixed(2),
    });

    // Evitar división por cero
    if (swipeDuration > 0 && swipeDistance.value > 0) {
      // Factor 1: Longitud total del swipe (0.5 - 1.5 de contribución)
      // Valores de referencia: 100px es muy corto, 500px es medio, 1000px+ es largo
      const distanceFactor = Math.min(
        1.5,
        Math.max(0.5, swipeDistance.value / 500)
      );

      // Factor 2: Velocidad máxima alcanzada (0.5 - 1.5 de contribución)
      // La velocidad está en píxeles por milisegundo, valores comunes 0.1-1.0
      const speedFactor = Math.min(1.5, Math.max(0.5, swipeMaxSpeed.value * 5));

      // Factor 3: Menor duración es mejor (penaliza swipes lentos)
      // 0.1s es muy rápido, 0.5s es medio, 1s+ es lento
      const durationFactor = Math.min(
        1.5,
        Math.max(0.5, 1 / (swipeDuration * 2))
      );

      // Calcular el valor final del golpe combinando los factores
      // Cada factor tiene una contribución diferente al resultado final
      const hitValue =
        distanceFactor * 0.6 + speedFactor * 0.3 + durationFactor * 0.1;

      // Normalizar a un rango entre 0.5 y 3.0
      const normalizedHitValue = 0.5 + (hitValue - 0.5) * (2.5 / 1.5);

      // Redondear a un decimal para mostrar
      const hitValueRounded = parseFloat(normalizedHitValue.toFixed(1));

      // Log para debug
      console.log(
        `Factores: Distancia=${distanceFactor.toFixed(
          2
        )}, Velocidad=${speedFactor.toFixed(
          2
        )}, Duración=${durationFactor.toFixed(2)}`
      );
      console.log(`Valor del golpe: ${hitValueRounded}`);

      // Incrementar el contador según la intensidad
      hitCount.value += hitValueRounded;

      // Determinar texto y clase según la intensidad
      if (hitValueRounded <= 1.0) {
        hitValueDisplayed.value = '¡Suave!';
        hitValueClass.value = 'hit-low';
      } else if (hitValueRounded <= 2.0) {
        hitValueDisplayed.value = '¡Bueno!';
        hitValueClass.value = 'hit-mid';
      } else {
        hitValueDisplayed.value = '¡INCREÍBLE!';
        hitValueClass.value = 'hit-strong';
      }

      console.log(
        `Golpe con intensidad: ${hitValueRounded}, contador: ${hitCount.value.toFixed(
          1
        )} de ${hitsNeeded}`
      );

      // Verificar si es hora de romper la piñata
      if (hitCount.value >= hitsNeeded && !isBreaking.value) {
        startBreakingAnimation();
      }
    } else {
      // Si el swipe fue demasiado corto o rápido, contar como mínimo
      hitCount.value += 0.5;
      hitValueDisplayed.value = '¡Flojo!';
      hitValueClass.value = 'hit-very-low';
    }
  }

  // Resetear el estado de slashing
  isSlashing.value = false;

  // Limpiar todos los efectos de corte al soltar
  slashEffects.value = [];
}

// Iniciar la animación de ruptura
function startBreakingAnimation() {
  console.log('¡Iniciando animación de ruptura!');

  // Reproducir sonido de ruptura
  playBreakSound();

  // Detener cualquier interacción
  isSlashing.value = false;
  isBreaking.value = true;

  // Limpiar efectos de corte
  slashEffects.value = [];

  // Mostrar el contador una última vez por más tiempo
  showHitCounter.value = true;

  // Volver a la posición central con una animación
  const returnToCenter = () => {
    // Detener cualquier velocidad actual
    velocity.x = 0;
    velocity.y = 0;
    velocity.rotation = 0;

    // Animar suavemente hacia el centro
    const centerAnimation = setInterval(() => {
      pinataPosition.x *= 0.9;
      pinataPosition.y *= 0.9;
      pinataPosition.rotation *= 0.9;

      // Cuando esté lo bastante cerca del centro, romper
      if (
        Math.abs(pinataPosition.x) < 1 &&
        Math.abs(pinataPosition.y) < 1 &&
        Math.abs(pinataPosition.rotation) < 1
      ) {
        clearInterval(centerAnimation);
        setTimeout(() => {
          showHitCounter.value = false;
          completeBreaking();
        }, 300);
      }
    }, 16);
  };

  // Iniciar retorno al centro
  returnToCenter();
}

// Completar la ruptura después de volver al centro
function completeBreaking() {
  console.log('Completando ruptura');

  // Aplicar el efecto de "crack" final
  isBreaking.value = true;

  // Después de un breve momento, mostrar la piñata completamente rota
  setTimeout(() => {
    isBroken.value = true;

    // Aplicar fuerzas para que las piezas salgan volando
    velocity.y = -20; // Salto hacia arriba más pronunciado
    velocity.rotation = Math.random() > 0.5 ? 40 : -40; // Rotación más dramática

    // Sonido de ruptura (opcional)
    // Si quieres agregar un sonido, podrías hacerlo aquí
  }, 300);
}

// Obtener el centro de la piñata
function getPinataCenter() {
  if (!pinataRef.value) {
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  const rect = pinataRef.value.getBoundingClientRect();
  const containerRect = document
    .querySelector('.pinata-container')
    ?.getBoundingClientRect();

  if (!containerRect) {
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  return {
    x: rect.left + rect.width / 2 - containerRect.left,
    y: rect.top + rect.height / 2 - containerRect.top,
  };
}

// Calcular la distancia desde un punto a una línea (usado para saber si el corte afecta a la piñata)
function getDistanceToLine(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;

  if (len_sq !== 0) {
    param = dot / len_sq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;

  return Math.sqrt(dx * dx + dy * dy);
}

// Añadir efecto visual de corte
function addSlashEffect(
  startX: number,
  startY: number,
  endX: number,
  endY: number
) {
  // Calcular punto medio para el efecto
  const centerX = (startX + endX) / 2;
  const centerY = (startY + endY) / 2;

  // Calcular ángulo del corte
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

  // Calcular longitud del corte
  const length = Math.sqrt(
    Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
  );

  // Añadir el efecto
  slashEffects.value.push({
    x: centerX - length / 2, // Centrar el efecto
    y: centerY,
    angle,
    opacity: 1,
    length,
  });
}

// Obtener la posición del evento
function getEventPosition(e: MouseEvent | TouchEvent) {
  let clientX: number, clientY: number;

  if (window.TouchEvent && e instanceof TouchEvent) {
    if (e.touches.length === 0) return null;
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if (e instanceof MouseEvent) {
    clientX = e.clientX;
    clientY = e.clientY;
  } else {
    return null;
  }

  const rect = document
    .querySelector('.pinata-container')
    ?.getBoundingClientRect();
  if (!rect) return null;

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

// Actualizar la física
let animationId: number;

function updatePhysics() {
  // Si la piñata está rota, aplicar una física diferente
  if (isBroken.value) {
    // Aplicar gravedad
    velocity.y += 0.5;

    // Actualizar posición
    pinataPosition.y += velocity.y;
    pinataPosition.rotation += velocity.rotation * 0.5;

    // Detener cuando salga de la pantalla
    if (pinataPosition.y > 500) {
      velocity.y = 0;
      velocity.rotation = 0;
    }
  } else {
    // Física normal
    // Aplicar fricción
    velocity.x *= friction;
    velocity.y *= friction;
    velocity.rotation *= friction;

    // Aplicar fuerza de retorno al centro (efecto resorte)
    velocity.x -= pinataPosition.x * springForce;
    velocity.y -= pinataPosition.y * springForce;
    velocity.rotation -= pinataPosition.rotation * springForce;

    // Actualizar posición
    pinataPosition.x += velocity.x;
    pinataPosition.y += velocity.y;
    pinataPosition.rotation += velocity.rotation;
  }

  // Aplicar transformación a la piñata
  if (pinataRef.value) {
    pinataRef.value.style.transform = `translate(${pinataPosition.x}px, ${pinataPosition.y}px) rotate(${pinataPosition.rotation}deg)`;
  }

  // Continuar la animación
  animationId = requestAnimationFrame(updatePhysics);
}

// Iniciar y detener la animación
onMounted(() => {
  animationId = requestAnimationFrame(updatePhysics);

  // Reiniciar contadores por si acaso
  resetGame();
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
});

// Reproducir sonido de golpe
function playHitSound() {
  if (hitSoundRef.value) {
    hitSoundRef.value.currentTime = 1; // Adelantar al segundo 1
    hitSoundRef.value
      .play()
      .catch((e) => console.error('Error reproduciendo sonido:', e));
  }
}

// Reproducir sonido de ruptura
function playBreakSound() {
  if (breakSoundRef.value) {
    breakSoundRef.value.currentTime = 0;
    breakSoundRef.value
      .play()
      .catch((e) => console.error('Error reproduciendo sonido de ruptura:', e));
  }
}
</script>

<style scoped>
.pinata-container {
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #1e88e5, #64b5f6, #90caf9);
  position: relative;
  overflow: hidden;
  user-select: none;
  touch-action: none;
}

/* Estilos para el cielo con nubes */
.clouds-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
}

.cloud {
  position: absolute;
  background: white;
  border-radius: 50%;
  opacity: 0.8;
  box-shadow: 0 8px 5px rgba(0, 0, 0, 0.1);
}

.cloud:before,
.cloud:after {
  content: '';
  position: absolute;
  background: white;
  border-radius: 50%;
}

.cloud1 {
  width: 200px;
  height: 60px;
  top: 15%;
  left: -10%;
  animation: moveCloud 80s linear infinite;
}

.cloud1:before {
  width: 100px;
  height: 100px;
  top: -50px;
  left: 45px;
}

.cloud1:after {
  width: 80px;
  height: 80px;
  top: -30px;
  left: 90px;
}

.cloud2 {
  width: 150px;
  height: 50px;
  top: 40%;
  left: -10%;
  animation: moveCloud 60s linear infinite;
  animation-delay: 10s;
}

.cloud2:before {
  width: 80px;
  height: 80px;
  top: -40px;
  left: 30px;
}

.cloud2:after {
  width: 60px;
  height: 60px;
  top: -20px;
  left: 70px;
}

.cloud3 {
  width: 180px;
  height: 60px;
  top: 25%;
  left: -10%;
  animation: moveCloud 70s linear infinite;
  animation-delay: 25s;
}

.cloud3:before {
  width: 90px;
  height: 90px;
  top: -45px;
  left: 40px;
}

.cloud3:after {
  width: 70px;
  height: 70px;
  top: -25px;
  left: 85px;
}

.cloud4 {
  width: 160px;
  height: 50px;
  top: 65%;
  left: -10%;
  animation: moveCloud 75s linear infinite;
  animation-delay: 5s;
}

.cloud4:before {
  width: 85px;
  height: 85px;
  top: -42px;
  left: 35px;
}

.cloud4:after {
  width: 65px;
  height: 65px;
  top: -22px;
  left: 75px;
}

.cloud5 {
  width: 220px;
  height: 70px;
  top: 50%;
  left: -10%;
  animation: moveCloud 90s linear infinite;
  animation-delay: 18s;
}

.cloud5:before {
  width: 110px;
  height: 110px;
  top: -55px;
  left: 50px;
}

.cloud5:after {
  width: 90px;
  height: 90px;
  top: -35px;
  left: 100px;
}

@keyframes moveCloud {
  0% {
    left: -10%;
  }
  100% {
    left: 110%;
  }
}

/* Capa que detecta los golpes */
.hit-detector {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  cursor: pointer;
}

.pinata {
  position: relative;
  will-change: transform;
  z-index: 5;
}

.pinata img {
  max-width: 300px;
  height: auto;
  filter: drop-shadow(0 10px 10px rgba(0, 0, 0, 0.3));
}

/* Estilo para las mitades de la piñata */
.pinata-parts {
  position: relative;
  width: 300px;
  height: 300px;
}

.pinata-half {
  position: absolute;
  top: 0;
  height: 100%;
  width: 50%;
  overflow: hidden;
}

.pinata-half img {
  position: absolute;
  top: 0;
  max-width: 300px;
  height: auto;
}

.pinata-half.left {
  left: 0;
  transform-origin: right center;
}

.pinata-half.right {
  right: 0;
  transform-origin: left center;
}

.pinata-half.left img {
  left: 0;
  clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);
}

.pinata-half.right img {
  right: 0;
  clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
}

/* Efecto de crack */
.crack-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  z-index: 6;
  animation: flashCrack 0.5s ease-in-out;
}

.crack-effect svg {
  width: 100%;
  height: 100%;
}

.crack-effect path {
  stroke-dasharray: 300;
  stroke-dashoffset: 300;
  animation: drawCrack 0.5s ease-in-out forwards;
}

@keyframes drawCrack {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes flashCrack {
  0%,
  100% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
}

/* Animación de ruptura mejorada */
.breaking .pinata-half.left {
  animation: breakLeft 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.breaking .pinata-half.right {
  animation: breakRight 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

/* Cuando ya está rota */
.broken .pinata-half.left {
  transform: translateX(-70px) rotate(-30deg);
}

.broken .pinata-half.right {
  transform: translateX(70px) rotate(30deg);
}

@keyframes breakLeft {
  0% {
    transform: translateX(0) rotate(0);
  }
  20% {
    transform: translateX(-5px) rotate(-2deg);
  }
  40% {
    transform: translateX(-20px) rotate(-10deg);
  }
  100% {
    transform: translateX(-70px) rotate(-30deg);
  }
}

@keyframes breakRight {
  0% {
    transform: translateX(0) rotate(0);
  }
  20% {
    transform: translateX(5px) rotate(2deg);
  }
  40% {
    transform: translateX(20px) rotate(10deg);
  }
  100% {
    transform: translateX(70px) rotate(30deg);
  }
}

.slash {
  position: absolute;
  height: 8px;
  background: linear-gradient(to right, transparent, white, transparent);
  border-radius: 4px;
  pointer-events: none;
  will-change: transform, opacity;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
  z-index: 20;
}

/* Estilo para el confeti */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.confetti {
  position: absolute;
  top: 0;
  width: 10px;
  height: 10px;
  border-radius: 4px;
  animation: fall 1.5s linear forwards;
}

@keyframes fall {
  0% {
    transform: translateY(0) rotate(0);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: translateY(500px) rotate(360deg);
    opacity: 0;
  }
}

/* Contador de golpes */
.hit-counter {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.8);
  padding: 12px 20px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 2rem;
  opacity: 0.9;
  z-index: 30;
  transition: opacity 0.3s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  animation-duration: 0.6s;
  animation-fill-mode: both;
}

/* Estilos específicos según intensidad */
.hit-very-low {
  color: #888888;
  font-size: 1.5rem;
  animation-name: popFade;
}

.hit-low {
  color: #4caf50;
  font-size: 1.8rem;
  animation-name: popSlide;
}

.hit-mid {
  color: #ff9800;
  font-size: 2.2rem;
  animation-name: bounceScale;
}

.hit-strong {
  color: #ff4081;
  font-size: 2.5rem;
  text-shadow: 0 0 10px rgba(255, 64, 129, 0.5);
  animation-name: pulseGlow;
}

/* Animaciones para los hits */
@keyframes popFade {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

@keyframes popSlide {
  0% {
    transform: translate(-50%, -50%) scale(0.8) translateY(20px);
    opacity: 0;
  }
  60% {
    transform: translate(-50%, -50%) scale(1.2) translateY(-5px);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes bounceScale {
  0% {
    transform: translate(-50%, -50%) scale(0.7);
    opacity: 0;
  }
  40% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 1;
  }
  60% {
    transform: translate(-50%, -50%) scale(0.95);
    opacity: 1;
  }
  80% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

@keyframes pulseGlow {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
    box-shadow: 0 0 0 rgba(255, 64, 129, 0);
  }
  40% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
    box-shadow: 0 0 30px rgba(255, 64, 129, 0.6);
  }
  60% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 1;
    box-shadow: 0 0 20px rgba(255, 64, 129, 0.4);
  }
  80% {
    transform: translate(-50%, -50%) scale(1.15);
    opacity: 1;
    box-shadow: 0 0 25px rgba(255, 64, 129, 0.5);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
    box-shadow: 0 0 15px rgba(255, 64, 129, 0.3);
  }
}

/* Contadores en esquina (modo dev) */
.dev-controls {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  gap: 10px;
  z-index: 100;
}

/* Contador en esquina */
.dev-counter {
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: monospace;
}

/* Botón de reinicio */
.reset-button {
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: monospace;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-button:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.reset-button:active {
  transform: scale(0.97);
}

@media (max-width: 600px) {
  .pinata img {
    max-width: 200px;
  }

  .pinata-parts {
    width: 200px;
    height: 200px;
  }

  .pinata-half img {
    max-width: 200px;
  }

  .dev-counter,
  .reset-button {
    font-size: 0.8rem;
    padding: 5px 8px;
  }
}
</style>

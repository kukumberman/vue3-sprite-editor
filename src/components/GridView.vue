<template>
  <div class="atlas-container" :class="{ 'bg': display.background }" :style="atlasSize">
    <img :src="sprite.image" alt="atlas" :style="atlasSize">

    <div class="grid" :class="{ visible: display.grid }" :style="gridTemplate">
      <div
        class="frame"
        v-for="i in framesCount"
        :key="i"
        :style="frameSize"
      >
        <div class="circle">
          <span>{{ i }}</span>
        </div>
        <div
          class="pivot"
          :style="pivotPosition"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    sprite: {
      type: Object,
      required: true,
    },
    grid: {
      type: Object,
      required: true,
    },
    pivot: {
      type: Object,
      required: true,
    },
    display: {
      type: Object,
      required: true,
    }
  },
  computed: {
    frame() {
      return {
        x: this.sprite.size.x / this.grid.x,
        y: this.sprite.size.y / this.grid.y
      }
    },
    framesCount() {
      return this.grid.x * this.grid.y
    },
    pivotPosition() {
      return {
        left: `calc(${this.pivot.x} * 100%)`,
        top: `calc(${this.pivot.y} * 100%)`
      }
    },
    frameSize() {
      return {
        width: `${this.frame.x}px`,
        height: `${this.frame.y}px`
      }
    },
    atlasSize() {
      return {
        width: `${this.sprite.size.x}px`,
        height: `${this.sprite.size.y}px`
      }
    },
    gridTemplate() {
      return {
        "grid-template-columns": `repeat(${this.grid.x}, 1fr)`,
        "grid-template-rows": `repeat(${this.grid.y}, 1fr)`,
      }
    }
  }
}
</script>

<style>

</style>
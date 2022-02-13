<template>
  <input type="file" @change="onFilesUploaded" ref="fileInput" accept="image/*" multiple>

  <div class="file-container">
    <div id="drop-zone" @click="dropzoneClickHandler">Drop file(s) or click here!</div>
    <ul>
      <li v-for="(file, i) in files" :key="i">{{ file.name }}</li>
    </ul>
    <button @click="clearClick" v-if="files.length > 0">Clear</button>
  </div>

  <div class="settings-container">
    
    <div class="settings-grid">
      <div>
        <span>Grid X</span>
        <input type="number" v-model="grid.x" min="0">
      </div>
      <div>
        <span>Grid Y</span>
        <input type="number" v-model="grid.y" min="0">
      </div>
    </div>

    <div class="settings-pivot">
      <div>
        <span>Pivot X</span>
        <input type="number" v-model="pivot.x" step="0.1" min="0" max="1">
      </div>
      <div>
        <span>Pivot Y</span>
        <input type="number" v-model="pivot.y" step="0.1" min="0" max="1">
      </div>
    </div>

    <div>
      <span>Show Grid</span>
      <input type="checkbox" v-model="displayGrid">
    </div>

    <div>
      <button @click="createGrid">Pack grid</button>
      <button @click="createHorizontal">Pack horizontal</button>
      <button @click="createVertical">Pack vertical</button>
    </div>
    
  </div>

  <div class="atlas-container" :style="atlasSize">
    <img :src="image" alt="atlas" :style="atlasSize">

    <div class="grid" :class="{ visible: displayGrid }" :style="gridTemplate">
      <div
        class="frame"
        v-for="i in (grid.x * grid.y)"
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
import AtlasCreator from "./utils/AtlasCreator"

export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      image: "./images/placeholder.png",
      files: [],
      displayGrid: true,
      grid: {
        x: 2,
        y: 2
      },
      pivot: {
        x: 0.5,
        y: 0.5
      },
      frame: {
        x: 200,
        y: 200
      },
    }
  },
  methods: {
    readFileAsBuffer(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = () => resolve(reader.result)
      })
    },
    onFilesUploaded(event) {
      const promises = Array.from(event.target.files).map(async (f) => {
        return {
          name: f.name,
          buffer: await this.readFileAsBuffer(f)
        }
      })
      Promise.all(promises).then(files => this.files = files)
    },
    clearClick() {
      this.files = []
    },
    dropzoneClickHandler() {
      this.$refs.fileInput.click()
    },
    filesAsBuffers() {
      return this.files.map(f => f.buffer)
    },
    applyDisplay(atlas) {
      const { grid, frame, pivot } = atlas.options
      this.grid.x = grid.x
      this.grid.y = grid.y
      this.frame.x = frame.width
      this.frame.y = frame.height
      this.pivot.x = pivot.x
      this.pivot.y = pivot.y
    },
    async createHorizontal() {
      const atlas = new AtlasCreator(this.filesAsBuffers())
      const src = await atlas.createHorizontal(this.pivot)
      this.image = src
      this.applyDisplay(atlas)
    },
    async createVertical() {
      const atlas = new AtlasCreator(this.filesAsBuffers())
      const src = await atlas.createVertical(this.pivot)
      this.image = src
      this.applyDisplay(atlas)
    },
    async createGrid() {
      const atlas = new AtlasCreator(this.filesAsBuffers())
      const src = await atlas.createGrid(this.grid, this.pivot)
      this.image = src
      this.applyDisplay(atlas)
    }
  },
  computed: {
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
        width: `calc(${this.frame.x}px * ${this.grid.x})`,
        height: `calc(${this.frame.y}px * ${this.grid.y})`
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

<style src="./style.css">
</style>

<template>
  <input type="file" @change="onFilesUploaded" ref="fileInput" accept="image/*" multiple>

  <div class="file-container">
    <div id="drop-zone"
      @click="dropzoneClickHandler"
      @drop="onFilesDrop"
      @dragover="$event.preventDefault()"
    >Drop file(s) or click here!</div>
    <ul>
      <li v-for="(file, i) in files" :key="i">
        <span>{{ file.name }}</span>
        &nbsp;
        <button @click="clickRemoveFile(i)">Remove</button>
      </li>
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
      <span>Display Background</span>
      <input type="checkbox" v-model="displayBackground">
    </div>
    <div>
      <span>useNextPow2</span>
      <input type="checkbox" v-model="useNextPow2">
    </div>
    <div>
      <span>autoUpdate</span>
      <input type="checkbox" v-model="autoUpdate">
    </div>

    <div>
      <button @click="createGrid" :disabled="hasNoFiles">Pack grid</button>
      <button @click="createHorizontal" :disabled="hasNoFiles">Pack horizontal</button>
      <button @click="createVertical" :disabled="hasNoFiles">Pack vertical</button>
    </div>
    
  </div>

  <div class="atlas-container" :class="{ 'bg': displayBackground }" :style="atlasSize">
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

function readFileAsBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = () => resolve(reader.result)
  })
}

export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      image: "./images/placeholder.png",
      files: [],
      displayGrid: true,
      displayBackground: true,
      useNextPow2: true,
      autoUpdate: true,
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
    onFilesUploaded(event) {
      this.fetchFiles(event.target.files)
      event.target.value = ""
    },
    onFilesDrop(event) {
      event.preventDefault()
      this.fetchFiles(event.dataTransfer.files)
    },
    async fetchFiles(fileList) {
      const promises = Array.from(fileList).map(async (f) => {
        return {
          name: f.name,
          buffer: await readFileAsBuffer(f)
        }
      })
      const files = await Promise.all(promises)
      this.files.push(...files)
    },
    clickRemoveFile(index) {
      this.files.splice(index, 1)
    },
    clearClick() {
      this.files = []
      this.setDefaults()
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
      const atlas = new AtlasCreator(this.filesAsBuffers(), this.useNextPow2)
      const src = await atlas.createHorizontal(this.pivot)
      this.image = src
      this.applyDisplay(atlas)
    },
    async createVertical() {
      const atlas = new AtlasCreator(this.filesAsBuffers(), this.useNextPow2)
      const src = await atlas.createVertical(this.pivot)
      this.image = src
      this.applyDisplay(atlas)
    },
    async createGrid() {
      const atlas = new AtlasCreator(this.filesAsBuffers(), this.useNextPow2)
      const src = await atlas.createGrid(this.grid, this.pivot)
      this.image = src
      this.applyDisplay(atlas)
    },
    tryUpdate() {
      if (!this.autoUpdate) {
        return
      }
      if (this.files.length === 0) {
        return
      }
      this.createGrid()
    },
    setDefaults() {
      this.image = "./images/placeholder.png"
      this.grid = {
        x: 2,
        y: 2
      }
      this.pivot = {
        x: 0.5,
        y: 0.5
      }
      this.frame = {
        x: 200,
        y: 200
      }
    }
  },
  watch: {
    useNextPow2() {
      this.tryUpdate()
    },
    "grid.x": function() {
      this.tryUpdate()
    },
    "grid.y": function() {
      this.tryUpdate()
    }
  },
  computed: {
    hasNoFiles() {
      return this.files.length === 0
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

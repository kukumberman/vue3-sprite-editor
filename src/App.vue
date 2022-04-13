<template>
  <FileView
    :files="files"
    @onFilesDrop="onFilesDrop"
    @onFilesUploaded="onFilesUploaded"
    @clickRemoveFile="clickRemoveFile"
    @clearClick="clearClick"
    @onFileDragEnd="onFileDragEnd"
  />

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
      <input type="checkbox" v-model="display.grid">
    </div>
    <div>
      <span>Display Background</span>
      <input type="checkbox" v-model="display.background">
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

  <GridView
    :sprite="sprite"
    :grid="grid"
    :pivot="pivot"
    :display="display"
  />

  <FooterView link="https://github.com/kukumberman/vue3-sprite-editor" />
</template>

<script>
import FileView from "./components/FileView.vue"
import GridView from "./components/GridView.vue"
import FooterView from "./components/FooterView.vue"
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
    FileView,
    GridView,
    FooterView,
  },
  data() {
    return {
      sprite: {
        image: "./images/placeholder.png",
        size: {
          x: 500,
          y: 500
        },
      },
      grid: {
        x: 2,
        y: 2
      },
      pivot: {
        x: 0.5,
        y: 0.5
      },
      files: [],
      display: {
        grid: true,
        background: true,
      },
      useNextPow2: true,
      autoUpdate: true,
    }
  },
  methods: {
    onFilesUploaded(fileList) {
      this.fetchFiles(fileList)
    },
    onFilesDrop(fileList) {
      this.fetchFiles(fileList)
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
      this.tryUpdate()
    },
    clickRemoveFile(index) {
      this.files.splice(index, 1)
      this.tryUpdate()
    },
    clearClick() {
      this.files = []
      this.setDefaults()
    },
    filesAsBuffers() {
      return this.files.map(f => f.buffer)
    },
    applyDisplay(atlas) {
      const { grid, frame, pivot } = atlas.options
      this.grid.x = grid.x
      this.grid.y = grid.y
      this.sprite.size.x = grid.x * frame.width
      this.sprite.size.y = grid.y * frame.height
      this.pivot.x = pivot.x
      this.pivot.y = pivot.y
    },
    async createHorizontal() {
      const atlas = new AtlasCreator(this.filesAsBuffers(), this.useNextPow2)
      const src = await atlas.createHorizontal(this.pivot)
      this.sprite.image = src
      this.applyDisplay(atlas)
      console.log("createHorizontal")
    },
    async createVertical() {
      const atlas = new AtlasCreator(this.filesAsBuffers(), this.useNextPow2)
      const src = await atlas.createVertical(this.pivot)
      this.sprite.image = src
      this.applyDisplay(atlas)
      console.log("createVertical")
    },
    async createGrid() {
      const atlas = new AtlasCreator(this.filesAsBuffers(), this.useNextPow2)
      const src = await atlas.createGrid(this.grid, this.pivot)
      this.sprite.image = src
      this.applyDisplay(atlas)
      console.log("createGrid")
    },
    onFileDragEnd(event, files) {
      // temp bandaid - manually reasigning array
      // todo: proper way of reordering based on event arguments
      this.files = files
      this.tryUpdate()
    },
    tryUpdate() {
      if (!this.autoUpdate) {
        return
      }
      if (this.files.length > 0) {
        this.createGrid()
      }
      else {
        this.setDefaults()
      }
    },
    setDefaults() {
      this.sprite.image = "./images/placeholder.png"
      this.sprite.size = {
        x: 500,
        y: 500,
      }
      this.grid = {
        x: 2,
        y: 2
      }
      this.pivot = {
        x: 0.5,
        y: 0.5
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
    },
    "pivot.x": function() {
      this.tryUpdate()
    },
    "pivot.y": function() {
      this.tryUpdate()
    }
  },
  computed: {
    hasNoFiles() {
      return this.files.length === 0
    },
  }
}
</script>

<style src="./style.css">
</style>

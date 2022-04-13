<template>
  <input type="file" @change="onFilesUploaded" ref="fileInput" accept="image/png, image/jpeg" multiple>

  <div class="file-container">
    <div id="drop-zone"
      @click="dropzoneClickHandler"
      @drop="onFilesDrop"
      @dragover="$event.preventDefault()"
    >Drop file(s) or click here!</div>
    
    <!-- old unordered list -->
    <!-- <ul>
      <li v-for="(file, i) in files" :key="i">
        <span>{{ file.name }}</span>
        &nbsp;
        <button @click="clickRemoveFile(i)">Remove</button>
      </li>
    </ul> -->

    <!-- new draggable list -->
    <draggable
      v-model="files"
      item-key="name"
      @end="onFileDragEnd"
      tag="ul"
    >
      <template #item="{ element, index }">
        <li>
          <span>{{ element.name }}</span>
          &nbsp;
          <button @click="clickRemoveFile(index)">Remove</button>
        </li>
      </template>
    </draggable>

    <button @click="clearClick" v-if="files.length > 0">Clear</button>
  </div>
</template>

<script>
import draggable from "vuedraggable"

export default {
  emits: [
    "onFilesDrop",
    "onFilesUploaded",
    "clickRemoveFile",
    "clearClick",
    "onFileDragEnd",
  ],
  props: {
    files: {
      type: Array,
      required: true,
    },
  },
  components: {
    draggable,
  },
  methods: {
    dropzoneClickHandler() {
      this.$refs.fileInput.click()
    },
    onFilesDrop(event) {
      event.preventDefault()
      this.$emit("onFilesDrop", event.dataTransfer.files)
    },
    onFilesUploaded(event) {
      this.$emit("onFilesUploaded", event.target.files)
      event.target.value = ""
    },
    clickRemoveFile(index) {
      this.$emit("clickRemoveFile", index)
    },
    clearClick() {
      this.$emit("clearClick")
    },
    onFileDragEnd() {
      this.$emit("onFileDragEnd")
    }
  }
}
</script>

<style>

</style>
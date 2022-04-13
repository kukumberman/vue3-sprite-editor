<template>
  <a :href="link" target="_blank">{{ link }}</a>
</template>

<script>
export default {
  props: {
    link: {
      type: String,
      required: true
    }
  }
}
</script>

<style>

</style>
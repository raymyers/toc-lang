<template>
  <div id="error-page">
    <h1>Oops!</h1>
    <p>Sorry, an unexpected error has occurred.</p>
    <p>
      <i>{{ error?.statusText || error?.message || "Unknown error" }}</i>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const error = ref(route.error || null)

console.error(error.value)
</script>

<style scoped>
/* Add styles if needed */
</style>

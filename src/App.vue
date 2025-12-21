<template>
  <div class="App">
    <div class="flex-row nav">
      <!-- <div class="nav-item">
        <router-link class="nav-link" to="/draw/evaporating-cloud">
          Evaporating Cloud
        </router-link>
      </div>
      |
      <div class="nav-item">
        <router-link class="nav-link" to="/draw/goal-tree">
          Goal Tree
        </router-link>
      </div>
      |
      <div class="nav-item">
        <router-link class="nav-link" to="/draw/problem-tree">
          Problem Tree
        </router-link>
      </div>
      | -->
      <div class="nav-item title">
        <span>TOC-lang</span>
      </div>
      <div class="nav-item right">
        <router-link class="nav-link" to="/about"> About </router-link>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
// No script needed for this component
</script>

<style scoped>
/* Styles can be added here if needed */
</style>

<template>
  <div class="file-controls">
    <button class="load" @click="onLoad">Load</button>
    <button class="save" @click="onSave">Save</button>
    <select @change="handleSelectChange">
      <option value="">Examples</option>
      <option value="goal">Goal Tree</option>
      <option value="problem">Problem Tree</option>
      <option value="conflict">Conflict Cloud</option>
    </select>
  </div>
</template>

<script setup lang="ts">
interface Props {
  onLoad: () => void
  onSave: () => void
  onSelectExample: (value: string) => void
}

const props = defineProps<Props>()

const handleSelectChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  props.onSelectExample(target.value)
}
</script>

<style scoped>
/* Add styles if needed */
</style>

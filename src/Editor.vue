<script setup lang="ts">
import { ref, onMounted } from "vue"
import { fileOpen, fileSave } from "browser-fs-access"
import FileControls from "./FileControls.vue"
import {
  exampleEvaporatingCloudText,
  exampleGoalTreeText,
  exampleProblemTreeText
} from "./examples"
import { Completions } from "./interpreter"

interface Props {
  onChange: (value: string) => void
  rows?: number
  text: string | undefined
  setText: (text: string) => void
  error: string
  completions: Completions
}

const myProps = withDefaults(defineProps<Props>(), {
  rows: 20
})

const editorText = ref(myProps.text || "")

const handleEditorChange = (event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value
  editorText.value = value
  myProps.setText(value)
  myProps.onChange(value)
}

const handleLoad = async () => {
  const file = await fileOpen()
  const fileText = await file.text()
  editorText.value = fileText
  myProps.setText(fileText)
  myProps.onChange(fileText)
}

const handleSave = async () => {
  await fileSave(new Blob([editorText.value], { type: "text/plain" }), {
    fileName: "document.txt",
    extensions: [".txt"]
  })
}

const examplesByType = {
  conflict: exampleEvaporatingCloudText,
  goal: exampleGoalTreeText,
  problem: exampleProblemTreeText
}

const handleSelectExample = async (example: string) => {
  if (example in examplesByType) {
    const exampleText = examplesByType[example as keyof typeof examplesByType]
    editorText.value = exampleText
    myProps.setText(exampleText)
    myProps.onChange(exampleText)
  }
}

onMounted(() => {
  handleSelectExample("goal")
})
</script>

<template>
  <div class="editor">
    <FileControls
      :onLoad="handleLoad"
      :onSave="handleSave"
      :onSelectExample="handleSelectExample"
    />
    <textarea
      :value="editorText"
      :rows="myProps.rows"
      @input="handleEditorChange"
      style="width: 100%; height: 80vh"
    />
    <p :class="['edit-result', { error: myProps.error }]">
      {{ myProps.error }}
    </p>
  </div>
</template>

<style scoped>
/* Add styles if needed */
</style>

<template>
  <div class="draw-container">
    <div class="editor-section">
      <Editor
        :onChange="onEditorChange"
        :rows="20"
        :text="text"
        :setText="(val) => (text = val)"
        :error="error"
        :completions="completions"
      />
    </div>
    <div class="diagram-section">
      <Diagram :ast="ast" :semantics="semantics" :diagramType="diagramType" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import Editor from "./Editor.vue"
import Diagram from "./Diagram.vue"
import {
  parseTextToAst,
  parseGoalTreeSemantics,
  parseProblemTreeSemantics,
  type TreeSemantics,
  type Completions
} from "./interpreter"

const completions: Completions = {
  idents: []
}

const ast = ref<any>(null)
const semantics = ref<TreeSemantics | null>(null)
const error = ref("")
const text = ref<string>()
const diagramType = ref<string | null>()

const onEditorChange = async (value: string) => {
  try {
    const { ast: parsedAst, type } = await parseTextToAst(value)
    console.log("diagramType", type)
    if (type === "goal") {
      const sem = parseGoalTreeSemantics(parsedAst)
      semantics.value = sem
      completions.idents = Array.from(sem.nodes.keys())
    } else if (type === "problem") {
      const sem = parseProblemTreeSemantics(parsedAst)
      semantics.value = sem
      completions.idents = Array.from(sem.nodes.keys())
    } else {
      semantics.value = null
      diagramType.value = null
      completions.idents = ["A", "B", "C", "D", "D'"]
    }
    console.log(parsedAst)
    ast.value = parsedAst
    diagramType.value = type
    error.value = ""
  } catch (e) {
    console.error(e)
    error.value = e.toString()
  }
}
</script>

<style scoped>
/* Add styles if needed */
</style>

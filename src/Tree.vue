<script setup lang="ts">
import {onMounted, watch} from "vue"
import * as d3 from "d3";
import * as dagreD3 from "dagre-d3-es";
import {computeResizeTransform, wrapLines} from "./util"
import {type TreeSemantics, type Node} from "./interpreter"

interface Props {
  semantics: TreeSemantics | null
  setSvgElem: (elem: SVGElement | null) => void
}

const props = defineProps<Props>()

onMounted(() => {
  renderTree()
})

watch(
  () => props.semantics,
  () => {
    renderTree()
  }
)

const renderTree = () => {
  if (!props.semantics) return

  const g = new dagreD3.graphlib.Graph({ directed: true })
  g.setGraph({})
  g.graph().rankdir = props.semantics.rankdir ?? "TB"
  g.graph().ranksep = 15
  g.graph().nodesep = 20
  g.setDefaultEdgeLabel(() => ({}))

  // Add nodes and edges as in original
  // ... (omitted for brevity, need to port the logic)

  const svg = d3.select("#treeSvg")
  const inner = svg.select("g")
  const render = dagreD3.render()
  render(inner, g)
  // Set transform etc.

  props.setSvgElem(document.getElementById("treeSvg") as SVGElement | null);
}
</script>

<template>
  <div id="tree-svg-container" style="width: 100%; height: 500px">
    <svg
      id="treeSvg"
      width="100%"
      height="100%"
      version="1.1"
      preserveAspectRatio="xMinYMin"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g />
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        dominant-baseline="middle"
        v-if="!semantics"
      >
        No AST
      </text>
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        dominant-baseline="middle"
        v-else
      >
        Tree Diagram Placeholder
      </text>
    </svg>
  </div>
</template>

<style scoped>
.annotation-label {
  fill: black;
  text-anchor: middle;
  font-weight: bold;
  alignment-baseline: middle;
}
</style>

<template>
  <div id="cloudSvgContainer" style="width: 100%; height: 500px">
    <!-- Placeholder for Cloud diagram -->
    <svg id="cloudSvg" width="100%" height="100%">
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">
        Cloud Diagram Placeholder
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue"
import { computeResizeTransform } from "./util"

interface Props {
  ast: any
  setSvgElem: (elem: SVGElement | null) => void
}

const props = defineProps<Props>()

onMounted(() => {
  updateTransform()
})

watch(
  () => props.ast,
  () => {
    updateTransform()
    props.setSvgElem(document.getElementById("cloudSvg") as SVGElement)
  }
)

const updateTransform = () => {
  const g = document.getElementById("cloudSvgInner")
  const svgContainer = document.getElementById("cloudSvgContainer")
  if (g && svgContainer) {
    g.setAttribute(
      "transform",
      computeResizeTransform(g, svgContainer, 10, 0) + ", translate(-10, 0)"
    )
  }
}
</script>

<style scoped>
/* Add styles if needed */
</style>

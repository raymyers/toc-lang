<template>
  <div>
    <div class="diagram-controls">
      <button v-if="!downloadUrl && !pngDownloadUrl" @click="genUrls">
        Export
      </button>
      <div v-if="downloadUrl && pngDownloadUrl">
        <a :href="downloadUrl" download="diagram.svg">Download SVG</a>
        <span> | </span>
        <a :href="pngDownloadUrl" download="diagram.png">PNG</a>
      </div>
    </div>

    <Cloud
      v-if="diagramType === 'conflict'"
      :ast="ast"
      :setSvgElem="updateSvgElem"
    />
    <Tree
      v-if="diagramType === 'goal'"
      :semantics="semantics"
      :setSvgElem="updateSvgElem"
    />
    <Tree
      v-if="diagramType === 'problem'"
      :semantics="semantics"
      :setSvgElem="updateSvgElem"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import Cloud from "./Cloud.vue"
import Tree from "./Tree.vue"
import { saveSvgUrl } from "./util"
import { toPng } from "./imageExport"

interface Props {
  ast: any
  semantics: any
  diagramType: string | null
}

defineProps<Props>()

const downloadUrl = ref<string | null>(null)
const pngDownloadUrl = ref<string | null>(null)
const svgElem = ref<SVGElement | null>(null)

const genUrls = async () => {
  if (svgElem.value) {
    downloadUrl.value = saveSvgUrl(svgElem.value)
    pngDownloadUrl.value = await toPng({
      svg: svgElem.value,
      width: svgElem.value.clientWidth * 2,
      height: svgElem.value.clientHeight * 2
    })
  } else {
    downloadUrl.value = null
    pngDownloadUrl.value = null
  }
}

const updateSvgElem = async (elem: SVGElement | null) => {
  svgElem.value = elem
  downloadUrl.value = null
  pngDownloadUrl.value = null
}
</script>

<style scoped>
/* Add styles if needed */
</style>

<template>
  <div
    ref="container"
    class="dxf-viewer-container"
    @dragover.prevent
    @drop.prevent="onDropFile"
  >
    <div class="dxf-viewer-toolbar">
      <button type="button" class="dxf-viewer-button" @click="openFilePicker">
        Open DXF
      </button>
      <button type="button" class="dxf-viewer-button" @click="fitToView">
        Fit
      </button>
      <button
        type="button"
        class="dxf-viewer-button"
        :aria-pressed="isMeasureModeEnabled"
        @click="toggleMeasureMode"
      >
        Measure
      </button>
      <div v-if="measureDistanceText" class="dxf-viewer-measure">
        {{ measureDistanceText }}
      </div>
    </div>

    <input
      ref="fileInput"
      class="dxf-viewer-file-input"
      type="file"
      accept=".dxf"
      @change="onFilePicked"
    />

    <div v-if="isLoading" class="dxf-loading">Loading DXF...</div>
    <div v-if="errorMessage" class="dxf-error">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
/**
 * Responsibility:
 * - Provide a lightweight DXF viewer UI for VitePress pages.
 * - Delegate rendering/loading/controls to the shared viewer core.
 */

import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { withBase } from 'vitepress'

import helvetikerFontUrl from 'three/examples/fonts/helvetiker_regular.typeface.json?url'
import { createDxfViewer } from '../../../src/viewer/createDxfViewer'

const props = defineProps({
  src: {
    type: String,
    required: true
  }
})

const container = ref(/** @type {HTMLElement | null} */ (null))
const fileInput = ref(/** @type {HTMLInputElement | null} */ (null))

const isLoading = ref(true)
const errorMessage = ref(/** @type {string | null} */ (null))
const isMeasureModeEnabled = ref(false)
const measureDistance = ref(/** @type {number | null} */ (null))

const measureDistanceText = computed(() => {
  if (measureDistance.value === null) return null
  return `Distance: ${measureDistance.value.toFixed(3)}`
})

let viewerHandle = /** @type {Awaited<ReturnType<typeof createDxfViewer>> | null} */ (null)

onMounted(async () => {
  if (!container.value) return

  const dxfUrl = withBase(props.src)
  const resolvedFontUrl = withBase(helvetikerFontUrl)

  viewerHandle = await createDxfViewer({
    containerElement: container.value,
    fontUrl: resolvedFontUrl,
    initialSource: { type: 'url', url: dxfUrl },
    onStatusChange: (status) => {
      isLoading.value = status.isLoading
      errorMessage.value = status.errorMessage
    },
    onMeasureDistanceChange: (nextDistance) => {
      measureDistance.value = nextDistance
    }
  })
})

const openFilePicker = () => {
  if (!fileInput.value) return
  fileInput.value.value = ''
  fileInput.value.click()
}

const setViewerFile = async (file) => {
  if (!viewerHandle) return
  await viewerHandle.setSource({ type: 'file', file })
}

const onFilePicked = async (event) => {
  const inputElement = event.target
  const fileList = inputElement?.files
  if (!fileList) return

  const firstFile = fileList.item(0)
  if (!firstFile) return

  await setViewerFile(firstFile)
}

const onDropFile = async (event) => {
  const fileList = event.dataTransfer?.files
  if (!fileList) return

  const firstFile = fileList.item(0)
  if (!firstFile) return

  await setViewerFile(firstFile)
}

const fitToView = () => {
  if (!viewerHandle) return
  viewerHandle.fitToView()
}

const toggleMeasureMode = () => {
  if (!viewerHandle) return

  const nextEnabled = !isMeasureModeEnabled.value
  isMeasureModeEnabled.value = nextEnabled
  viewerHandle.setMeasureModeEnabled(nextEnabled)
}

onBeforeUnmount(() => {
  viewerHandle?.dispose()
  viewerHandle = null
})
</script>

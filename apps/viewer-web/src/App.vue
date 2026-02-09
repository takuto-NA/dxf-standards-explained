<template>
  <div class="appShell">
    <div class="toolbar">
      <button type="button" class="button" @click="openFilePicker">
        Open DXF
      </button>
      <button type="button" class="button" @click="fitToView" :disabled="!viewerHandle">
        Fit
      </button>
      <button
        type="button"
        class="button"
        :disabled="!viewerHandle"
        :aria-pressed="isMeasureModeEnabled"
        @click="toggleMeasureMode"
      >
        Measure
      </button>
      <span class="statusText">{{ statusText }}</span>
    </div>

    <div class="viewerArea">
      <div
        ref="containerElement"
        class="dropZone"
        @dragover.prevent
        @drop.prevent="onDropFile"
      >
        <div v-if="!hasLoadedFile" class="hintOverlay">
          Drop a DXF file here, or click “Open DXF”.
        </div>
        <div v-if="errorMessage" class="errorOverlay">
          {{ errorMessage }}
        </div>
      </div>

      <input
        ref="fileInputElement"
        class="hiddenFileInput"
        type="file"
        accept=".dxf"
        @change="onFilePicked"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Responsibility:
 * - Provide a super-fast standalone browser DXF viewer UI.
 */

import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import helvetikerFontUrl from 'three/examples/fonts/helvetiker_regular.typeface.json?url'
import { createDxfViewer, type DxfViewerHandle } from '@viewer/createDxfViewer'

const containerElement = ref<HTMLElement | null>(null)
const fileInputElement = ref<HTMLInputElement | null>(null)

const isLoading = ref<boolean>(true)
const errorMessage = ref<string | null>(null)
const hasLoadedFile = ref<boolean>(false)

const isMeasureModeEnabled = ref<boolean>(false)
const measureDistance = ref<number | null>(null)

const statusText = computed(() => {
  if (isLoading.value) return 'Loading...'
  if (measureDistance.value !== null) return `Distance: ${measureDistance.value.toFixed(3)}`
  if (isMeasureModeEnabled.value) return 'Measure: click 2 points (ESC to cancel)'
  return 'Pan: left-drag, Zoom: wheel/middle'
})

let viewerHandle = ref<DxfViewerHandle | null>(null)

onMounted(async () => {
  if (!containerElement.value) return

  viewerHandle.value = await createDxfViewer({
    containerElement: containerElement.value,
    fontUrl: helvetikerFontUrl,
    onStatusChange: (status) => {
      isLoading.value = status.isLoading
      errorMessage.value = status.errorMessage
    },
    onMeasureDistanceChange: (nextDistance) => {
      measureDistance.value = nextDistance
    }
  })
})

onBeforeUnmount(() => {
  viewerHandle.value?.dispose()
  viewerHandle.value = null
})

function openFilePicker(): void {
  if (!fileInputElement.value) return
  fileInputElement.value.value = ''
  fileInputElement.value.click()
}

async function setViewerFile(file: File): Promise<void> {
  if (!viewerHandle.value) return
  hasLoadedFile.value = true
  await viewerHandle.value.setSource({ type: 'file', file })
}

async function onFilePicked(event: Event): Promise<void> {
  const inputElement = event.target as HTMLInputElement | null
  const fileList = inputElement?.files
  if (!fileList) return

  const firstFile = fileList.item(0)
  if (!firstFile) return

  await setViewerFile(firstFile)
}

async function onDropFile(event: DragEvent): Promise<void> {
  const fileList = event.dataTransfer?.files
  if (!fileList) return

  const firstFile = fileList.item(0)
  if (!firstFile) return

  await setViewerFile(firstFile)
}

function fitToView(): void {
  viewerHandle.value?.fitToView()
}

function toggleMeasureMode(): void {
  if (!viewerHandle.value) return

  const nextEnabled = !isMeasureModeEnabled.value
  isMeasureModeEnabled.value = nextEnabled
  measureDistance.value = null
  viewerHandle.value.setMeasureModeEnabled(nextEnabled)
}
</script>


<template>
  <div ref="container" class="dxf-viewer-container">
    <div v-if="loading" class="dxf-loading">Loading DXF...</div>
    <div v-if="error" class="dxf-error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps({
  src: {
    type: String,
    required: true
  }
})

const container = ref(null)
const loading = ref(true)
const error = ref(null)
let renderer = null
let scene = null
let camera = null
let controls = null
let animationId = null

onMounted(async () => {
  // SSRを避けるため、マウント後にのみインポート
  try {
    const THREE = await import('three')
    const { DXFViewer } = await import('three-dxf-viewer')
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

    if (!container.value) return

    const width = container.value.clientWidth
    const height = container.value.clientHeight

    // Scene setup
    scene = new THREE.Scene()
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100000)
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.value.appendChild(renderer.domElement)

    // Controls
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    // DXF Viewer
    const dxfViewer = new DXFViewer()
    
    // vitepressのbaseパスを考慮してURLを解決
    const url = withBase(props.src)
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch DXF: ${response.status} ${response.statusText}`)
    }
    const data = await response.blob()
    const file = new File([data], 'model.dxf')

    // 読み込み
    const dxfScene = await dxfViewer.getFromFile(file, null)
    if (!dxfScene) {
      throw new Error('Failed to parse DXF content')
    }
    scene.add(dxfScene)

    // オブジェクトが中心に来るようにカメラを調整
    const box = new THREE.Box3().setFromObject(dxfScene)
    if (box.isEmpty()) {
      throw new Error('DXF scene is empty or has no geometry')
    }
    
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    
    const maxDim = Math.max(size.x, size.y, size.z)
    const cameraZ = maxDim * 2 || 500

    camera.position.set(center.x, center.y, center.z + cameraZ)
    camera.lookAt(center)
    controls.target.copy(center)
    controls.update()

    loading.value = false

    const animate = () => {
      if (!renderer) return
      animationId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    window.addEventListener('resize', onWindowResize)

  } catch (e) {
    console.error('DxfViewer Error:', e)
    error.value = `Failed to load: ${e.message}`
    loading.value = false
  }
})

const onWindowResize = () => {
  if (!container.value || !camera || !renderer) return
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize)
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
    renderer = null
  }
})
</script>

<style scoped>
.dxf-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ff6b6b;
  font-family: sans-serif;
  background: rgba(0,0,0,0.7);
  padding: 10px 20px;
  border-radius: 4px;
}
</style>

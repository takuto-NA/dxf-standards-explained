<template>
  <div ref="container" class="dxf-viewer-container">
    <div v-if="loading" class="dxf-loading">Loading DXF...</div>
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
let viewer = null
let scene = null
let renderer = null
let camera = null

onMounted(async () => {
  // SSRを避けるため、マウント後にのみインポート
  const THREE = await import('three')
  const { DXFViewer } = await import('three-dxf-viewer')
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

  try {
    const width = container.value.clientWidth
    const height = container.value.clientHeight

    // Scene setup
    scene = new THREE.Scene()
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000)
    camera.position.set(0, 0, 500)

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.value.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0, 0)
    controls.update()

    // DXF Viewer
    const dxfViewer = new DXFViewer()
    
    // vitepressのbaseパスを考慮してURLを解決
    const url = withBase(props.src)
    
    const response = await fetch(url)
    const data = await response.blob()
    const file = new File([data], 'model.dxf')

    // three-dxf-viewerのgetFromFileを使用
    // 第2引数はフォントパスだが、一旦nullで進める
    const dxfScene = await dxfViewer.getFromFile(file, null)
    
    scene.add(dxfScene)

    // オブジェクトが中心に来るようにカメラを調整
    const box = new THREE.Box3().setFromObject(dxfScene)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = camera.fov * (Math.PI / 180)
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))
    cameraZ *= 1.5 // 少し余裕を持たせる

    camera.position.set(center.x, center.y, center.z + cameraZ)
    camera.lookAt(center)
    controls.target.copy(center)
    controls.update()

    loading.value = false

    const animate = () => {
      if (!renderer) return
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // ウィンドウリサイズ対応
    window.addEventListener('resize', onWindowResize)

  } catch (error) {
    console.error('Failed to load DXF:', error)
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
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer.domElement.remove()
    renderer = null
  }
})
</script>

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
let animationId = null

// CDN上のフォントURL
const FONT_URL = 'https://unpkg.com/three@0.171.0/examples/fonts/helvetiker_regular.typeface.json'

onMounted(async () => {
  try {
    // 全てをマウント後に動的インポート
    const THREE = await import('three')
    const { DXFViewer } = await import('three-dxf-viewer')
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

    if (!container.value) return

    const width = container.value.clientWidth
    const height = container.value.clientHeight

    // Scene setup
    const scene = new THREE.Scene()
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000000)
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.value.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    // DXF Viewer
    const dxfViewer = new DXFViewer()
    
    // vitepressのbaseパスを考慮してURLを解決
    const url = withBase(props.src)
    
    // fetchしてファイルオブジェクトを作成
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`DXFファイルの取得に失敗しました: ${response.status} ${response.statusText}`)
    }
    const blob = await response.blob()
    const file = new File([blob], 'model.dxf')

    // three-dxf-viewerで読み込み
    // fontPathをnullではなく空文字列か有効なURLにする
    // nullを渡すと内部で fetch(null) が走り、404エラーが出る可能性があるため
    const dxfScene = await dxfViewer.getFromFile(file, FONT_URL)
    
    if (!dxfScene) {
      throw new Error('DXFデータのパースに失敗しました。')
    }
    scene.add(dxfScene)

    // カメラ位置の調整
    const box = new THREE.Box3().setFromObject(dxfScene)
    if (box.isEmpty()) {
      // ジオメトリがない場合（空の図面など）
      camera.position.set(0, 0, 100)
    } else {
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const cameraZ = maxDim * 2.5 || 500

      camera.position.set(center.x, center.y, center.z + cameraZ)
      camera.lookAt(center)
      controls.target.copy(center)
    }
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
    
    // リサイズハンドラ
    function onWindowResize() {
      if (!container.value || !camera || !renderer) return
      const w = container.value.clientWidth
      const h = container.value.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

  } catch (e) {
    console.error('DxfViewer Error:', e)
    error.value = `エラー: ${e.message}`
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) {
    renderer.dispose()
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
  background: rgba(0,0,0,0.8);
  padding: 15px 25px;
  border-radius: 8px;
  text-align: center;
  max-width: 80%;
  z-index: 10;
}
</style>

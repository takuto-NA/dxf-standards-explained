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
let camera = null
let scene = null
let controls = null

const FONT_URL = 'https://unpkg.com/three@0.171.0/examples/fonts/helvetiker_regular.typeface.json'

onMounted(async () => {
  try {
    const THREE = await import('three')
    const { DXFViewer } = await import('three-dxf-viewer')
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

    if (!container.value) return

    const width = container.value.clientWidth
    const height = container.value.clientHeight

    scene = new THREE.Scene()
    
    // 2D図面用に平行投影カメラ (OrthographicCamera) を使用
    camera = new THREE.OrthographicCamera(
      width / -2, width / 2, height / 2, height / -2, 0.1, 1000000
    )
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.value.appendChild(renderer.domElement)

    // 2Dライクな操作設定
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableRotate = false // 3D回転を無効化
    controls.enableDamping = true
    controls.screenSpacePanning = true // 平行移動をスクリーン空間に固定
    
    // マウスボタンの割り当て変更
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,   // 左クリックでパン
      MIDDLE: THREE.MOUSE.DOLLY, // ホイールでズーム
      RIGHT: THREE.MOUSE.ROTATE // 右クリックは一応回転（ほぼ動かないが残す）
    }

    const dxfViewer = new DXFViewer()
    const url = withBase(props.src)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)
    const data = await response.blob()
    const file = new File([data], 'model.dxf')

    const dxfScene = await dxfViewer.getFromFile(file, FONT_URL)
    if (!dxfScene) throw new Error('Parse failed')
    scene.add(dxfScene)

    // オブジェクトの大きさに合わせて表示範囲を調整
    const box = new THREE.Box3().setFromObject(dxfScene)
    if (!box.isEmpty()) {
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      
      const maxDim = Math.max(size.x, size.y)
      const aspect = width / height
      
      // カメラの表示範囲をフィットさせる
      if (aspect > 1) {
        camera.left = -maxDim * aspect / 2
        camera.right = maxDim * aspect / 2
        camera.top = maxDim / 2
        camera.bottom = -maxDim / 2
      } else {
        camera.left = -maxDim / 2
        camera.right = maxDim / 2
        camera.top = maxDim / aspect / 2
        camera.bottom = -maxDim / aspect / 2
      }
      
      // 少し余裕を持たせる（ズームアウト）
      camera.zoom = 0.8
      camera.updateProjectionMatrix()
      
      camera.position.set(center.x, center.y, 1000)
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

  } catch (e) {
    console.error(e)
    error.value = `エラー: ${e.message}`
    loading.value = false
  }
})

const onWindowResize = () => {
  if (!container.value || !camera || !renderer) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight
  const aspect = w / h
  
  // 平行投影カメラのサイズ更新
  const viewSize = Math.max(camera.right - camera.left, camera.top - camera.bottom) / (camera.zoom || 1)
  camera.left = -viewSize * aspect / 2
  camera.right = viewSize * aspect / 2
  camera.top = viewSize / 2
  camera.bottom = -viewSize / 2
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize)
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) renderer.dispose()
})
</script>

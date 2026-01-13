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

// CDN上のフォントURL (バージョンを固定)
const FONT_URL = 'https://unpkg.com/three@0.171.0/examples/fonts/helvetiker_regular.typeface.json'

onMounted(async () => {
  try {
    // 全てをマウント後に動的な一括インポート
    const [THREE, { DXFViewer }, { OrbitControls }] = await Promise.all([
      import('three'),
      import('three-dxf-viewer'),
      import('three/examples/jsm/controls/OrbitControls.js')
    ])

    if (!container.value) return

    const width = container.value.clientWidth
    const height = container.value.clientHeight

    scene = new THREE.Scene()
    
    // 2D図面用に平行投影カメラ (OrthographicCamera)
    // 初期サイズはダミー。後で調整。
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000000)
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.value.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableRotate = false // 3D回転を無効化
    controls.enableDamping = true
    controls.screenSpacePanning = true
    
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE
    }

    const dxfViewer = new DXFViewer()
    const url = withBase(props.src)
    
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)
    const data = await response.blob()
    const file = new File([data], 'model.dxf')

    // DXFの読み込み
    const dxfScene = await dxfViewer.getFromFile(file, FONT_URL)
    if (!dxfScene) throw new Error('DXFのパースに失敗しました')
    
    scene.add(dxfScene)

    // NaNエラー対策: ジオメトリの計算を確実に行う
    dxfScene.traverse((child) => {
      if (child.isMesh || child.isLine) {
        if (child.geometry) {
          child.geometry.computeBoundingBox()
          child.geometry.computeBoundingSphere()
        }
      }
    })

    // 表示範囲の自動調整
    const box = new THREE.Box3().setFromObject(dxfScene)
    
    if (!box.isEmpty() && !isNaN(box.min.x)) {
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      
      const maxDim = Math.max(size.x, size.y)
      const aspect = width / height
      
      let viewW, viewH
      if (aspect > 1) {
        viewW = maxDim * aspect
        viewH = maxDim
      } else {
        viewW = maxDim
        viewH = maxDim / aspect
      }
      
      // カメラのクリッピングプレーンを更新
      camera.left = -viewW / 2
      camera.right = viewW / 2
      camera.top = viewH / 2
      camera.bottom = -viewH / 2
      camera.zoom = 0.8 // 少し余白
      camera.updateProjectionMatrix()
      
      camera.position.set(center.x, center.y, 5000)
      camera.lookAt(center)
      controls.target.copy(center)
    } else {
      // ジオメトリがない場合などのデフォルト
      camera.position.set(0, 0, 1000)
      controls.target.set(0, 0, 0)
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
    console.error('DxfViewer Error:', e)
    error.value = `エラー: ${e.message}`
    loading.value = false
  }
})

const onWindowResize = () => {
  if (!container.value || !camera || !renderer) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight
  const aspect = w / h
  
  // 表示範囲を維持したままアスペクト比を修正
  const currentHeight = camera.top - camera.bottom
  const viewH = currentHeight
  const viewW = viewH * aspect
  
  camera.left = -viewW / 2
  camera.right = viewW / 2
  camera.top = viewH / 2
  camera.bottom = -viewH / 2
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize)
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) {
    renderer.dispose()
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }
})
</script>

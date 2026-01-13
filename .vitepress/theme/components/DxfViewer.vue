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
    const [THREE, { DXFViewer, Merger }, { OrbitControls }] = await Promise.all([
      import('three'),
      import('three-dxf-viewer'),
      import('three/examples/jsm/controls/OrbitControls.js')
    ])

    if (!container.value) return

    const width = container.value.clientWidth
    const height = container.value.clientHeight

    scene = new THREE.Scene()
    camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0.1, 1000000)
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.value.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableRotate = false
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
    
    // Mergerを使用して、ブロック定義(BLOCK)を実体(INSERT)として正しく展開・統合する
    const merger = new Merger()
    const finalScene = merger.merge(dxfScene)
    
    // NaNデータのクリーンアップと更新
    finalScene.traverse((child) => {
      if (child.geometry && child.geometry.attributes.position) {
        const pos = child.geometry.attributes.position
        let hasNan = false
        for (let i = 0; i < pos.array.length; i++) {
          if (isNaN(pos.array[i])) {
            pos.array[i] = 0
            hasNan = true
          }
        }
        if (hasNan) pos.needsUpdate = true
        child.geometry.computeBoundingBox()
        child.geometry.computeBoundingSphere()
      }
    })

    scene.add(finalScene)

    // 表示範囲の自動調整
    const box = new THREE.Box3().setFromObject(finalScene)
    
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
      
      camera.left = -viewW / 2
      camera.right = viewW / 2
      camera.top = viewH / 2
      camera.bottom = -viewH / 2
      camera.zoom = 0.8
      camera.updateProjectionMatrix()
      
      camera.position.set(center.x, center.y, 5000)
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
  const currentHeight = camera.top - camera.bottom
  const viewW = currentHeight * aspect
  camera.left = -viewW / 2
  camera.right = viewW / 2
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize)
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) renderer.dispose()
})
</script>

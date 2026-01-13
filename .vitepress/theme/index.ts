import DefaultTheme from 'vitepress/theme'
import DxfViewer from './components/DxfViewer.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // グローバルコンポーネントとして登録
    app.component('DxfViewer', DxfViewer)
  }
}

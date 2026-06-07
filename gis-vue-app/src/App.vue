<template>
  <div class="app">
    <header>
      <h1>🗺️ Leaflet 地图组件演示</h1>
      <p class="subtitle">AI 辅助生成的 Vue 3 + Leaflet 地图初始化组件</p>
    </header>

    <div class="demo-area">
      <LeafletMap
        :center="mapCenter"
        :zoom="mapZoom"
        height="500px"
        @map-click="handleMapClick"
        @map-ready="handleMapReady"
        @marker-click="handleMarkerClick"
        ref="mapComponent"
      />

      <div class="controls">
        <button @click="addBeijingMarker">📍 北京天安门</button>
        <button @click="addShanghaiMarker">📍 上海外滩</button>
        <button @click="clearAllMarkers">🗑️ 清除标注</button>
      </div>

      <div class="city-jump">
        <label>🚀 城市快跳：</label>
        <select v-model="selectedCity" @change="jumpToCity">
          <option value="">-- 选择城市 --</option>
          <option v-for="city in CHINA_CITIES" :key="city.name" :value="city.name">
            {{ city.name }}（{{ city.province }}）
          </option>
        </select>
      </div>

      <div class="info-panel">
        <p><strong>地图状态：</strong>{{ mapReady ? '✅ 已就绪' : '⏳ 加载中...' }}</p>
        <p><strong>标注数量：</strong>{{ markerCount }}</p>
        <p v-if="lastClick"><strong>最后点击：</strong>{{ lastClick }}</p>
        <p v-if="lastMarker"><strong>最后标注点击：</strong>{{ lastMarker }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LeafletMap from './components/LeafletMap.vue'
import { CHINA_CITIES, findCity } from './data/cities'

const mapCenter = ref<[number, number]>([116.4, 39.9])
const mapZoom = ref(5)
const mapComponent = ref<InstanceType<typeof LeafletMap> | null>(null)
const mapReady = ref(false)
const markerCount = ref(0)
const lastClick = ref('')
const lastMarker = ref('')
const selectedCity = ref('')

const handleMapReady = () => { mapReady.value = true }

const handleMapClick = (coords: { lat: number; lng: number }) => {
  lastClick.value = `经度 ${coords.lng.toFixed(4)}, 纬度 ${coords.lat.toFixed(4)}`
  mapComponent.value?.addMarker(coords.lat, coords.lng, {
    popupContent: `<b>点击位置</b><br>经度: ${coords.lng.toFixed(4)}<br>纬度: ${coords.lat.toFixed(4)}`,
    tooltip: `${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)}`
  })
  markerCount.value++
}

const handleMarkerClick = (data: { lat: number; lng: number }) => {
  lastMarker.value = `经度 ${data.lng.toFixed(4)}, 纬度 ${data.lat.toFixed(4)}`
}

const addBeijingMarker = () => {
  mapComponent.value?.addMarker(39.9042, 116.4074, {
    popupContent: '<b>🏛️ 天安门</b><br>北京市东城区',
    tooltip: '天安门'
  })
  mapComponent.value?.setView(39.9042, 116.4074, 12)
  markerCount.value++
}

const addShanghaiMarker = () => {
  mapComponent.value?.addMarker(31.2304, 121.4737, {
    popupContent: '<b>🌃 外滩</b><br>上海市黄浦区',
    tooltip: '外滩'
  })
  mapComponent.value?.setView(31.2304, 121.4737, 12)
  markerCount.value++
}

const clearAllMarkers = () => {
  mapComponent.value?.clearMarkers()
  markerCount.value = 0
}

/**
 * 城市快跳——飞至选中城市并添加标注
 */
const jumpToCity = () => {
  const city = findCity(selectedCity.value)
  if (!city) return

  // 更新地图中心与缩放
  mapCenter.value = city.center
  mapZoom.value = city.zoom

  // 添加城市标注
  mapComponent.value?.addMarker(city.center[1], city.center[0], {
    popupContent: `<b>${city.name}</b><br>${city.province}`,
    tooltip: city.name
  })
  mapComponent.value?.setView(city.center[1], city.center[0], city.zoom)
  markerCount.value++
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f7fa;
}

header {
  background: linear-gradient(135deg, #1a5276 0%, #2e86c1 100%);
  color: white;
  padding: 24px 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

header h1 { margin: 0 0 8px; font-size: 26px; }
.subtitle { margin: 0; opacity: 0.85; font-size: 14px; }

.demo-area { max-width: 1000px; margin: 30px auto; padding: 0 20px; }

.controls { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }

.controls button {
  padding: 10px 20px;
  background: #2e86c1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.controls button:hover { background: #1a5276; }

.city-jump {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.city-jump label { font-size: 14px; font-weight: 600; color: #333; white-space: nowrap; }

.city-jump select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.city-jump select:focus { outline: none; border-color: #2e86c1; }

.info-panel {
  margin-top: 20px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}

.info-panel p { margin: 6px 0; font-size: 14px; color: #555; }
.info-panel strong { color: #333; }
</style>

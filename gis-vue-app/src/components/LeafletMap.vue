<template>
  <div class="leaflet-map-container">
    <div
      ref="mapRef"
      :style="{ height: height }"
      class="map-element"
    />
    <div v-if="loading" class="loading-overlay">
      <div class="spinner" />
      <p>地图加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ===== 修复 Leaflet + Vite 默认图标路径问题 =====
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// 重置 Leaflet 默认图标路径（Vite 打包后会改变路径）
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})
// =============================================

/**
 * 组件 Props
 */
interface Props {
  center?: [number, number]
  zoom?: number
  minZoom?: number
  maxZoom?: number
  height?: string
  /** 瓦片 URL 模板，默认使用高德地图（国内访问快） */
  tileUrl?: string
}

/**
 * 组件事件
 */
interface Emits {
  (e: 'map-ready', map: L.Map): void
  (e: 'map-click', coords: { lat: number; lng: number }): void
  (e: 'marker-click', data: { lat: number; lng: number; marker: L.Marker }): void
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [116.4, 39.9],
  zoom: 10,
  minZoom: 3,
  maxZoom: 18,
  height: '500px',
  tileUrl: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
})

const emit = defineEmits<Emits>()

const mapRef = ref<HTMLDivElement | null>(null)
const loading = ref(true)
let map: L.Map | null = null
const markers: L.Marker[] = []

const initMap = (): void => {
  if (!mapRef.value) {
    console.error('Map container not found')
    return
  }

  try {
    map = L.map(mapRef.value, {
      center: [props.center[1], props.center[0]],
      zoom: props.zoom,
      minZoom: props.minZoom,
      maxZoom: props.maxZoom,
      zoomControl: true
    })

    L.tileLayer(props.tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> | 高德地图',
      maxZoom: 18,
      subdomains: ['1', '2', '3', '4']
    }).addTo(map)

    map.on('click', (e: L.LeafletMouseEvent) => {
      emit('map-click', { lat: e.latlng.lat, lng: e.latlng.lng })
    })

    map.whenReady(() => {
      loading.value = false
      emit('map-ready', map!)
    })
  } catch (error) {
    console.error('地图初始化失败:', error)
    loading.value = false
  }
}

const setView = (lat: number, lng: number, zoom?: number): void => {
  if (!map) return
  map.setView([lat, lng], zoom ?? map.getZoom())
}

const addMarker = (
  lat: number,
  lng: number,
  options?: { popupContent?: string; tooltip?: string }
): L.Marker | null => {
  if (!map) {
    console.warn('地图未初始化')
    return null
  }

  const marker = L.marker([lat, lng]).addTo(map)

  if (options?.popupContent) {
    marker.bindPopup(options.popupContent)
  }
  if (options?.tooltip) {
    marker.bindTooltip(options.tooltip, {
      direction: 'top',
      offset: [0, -15]
    })
  }

  marker.on('click', () => {
    emit('marker-click', { lat, lng, marker })
  })

  markers.push(marker)
  return marker
}

const clearMarkers = (): void => {
  markers.forEach(m => m.remove())
  markers.length = 0
}

watch(() => props.center, (val) => {
  if (map) map.setView([val[1], val[0]], map.getZoom())
})

watch(() => props.zoom, (val) => {
  if (map) map.setZoom(val)
})

onMounted(() => initMap())

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

defineExpose({ setView, addMarker, clearMarkers, getMap: () => map })
</script>

<style scoped>
.leaflet-map-container {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.map-element {
  width: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  margin-top: 16px;
  color: #333;
  font-size: 14px;
}
</style>

/**
 * ============================================================
 * 主程序 — 个人GIS作品集
 * 整合多图层 · 专题图 · 交互 · 信息面板
 * ============================================================
 */

// ===== 全局状态 =====
let map;
let allMarkers = [];           // 全部标记
let markerGroup;               // 当前显示的标记图层组
let currentCategory = 'all';   // 当前分类筛选
let currentMode = 'explore';   // 当前模式：explore | timeline | thematic
let highlightedMarker = null;  // 当前高亮的标记
let timelineLine = null;       // 时间线轨迹
let choroplethLayer = null;    // 专题图层（GDP设色）
let gdpLegendEl = null;        // GDP图例元素

// 测量状态
let measureActive = false;
let measurePoints = [];
let measureMarkers = [];
let measureLines = [];

// 书签存储
const STORAGE_KEY = 'gis-portfolio-bookmarks';

/* ================================================================
 * 入口 — DOM 加载完成后初始化
 * ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initModeSwitcher();
  initFilters();
  initStats();
  initPlacesList();
  initBookmarks();
  initMeasure();
  initDetailOverlay();
  initEditor();
  loadPOIs();
});

/* ================================================================
 * 1. 初始化地图
 * ================================================================ */
function initMap() {
  map = L.map('map', {
    center: mapConfig.initialView.center,
    zoom: mapConfig.initialView.zoom,
    minZoom: mapConfig.minZoom,
    maxZoom: mapConfig.maxZoom,
    zoomControl: false,
    attributionControl: true
  });

  // --- 底图 ---
  const osmLayer = L.tileLayer(mapConfig.osm.url, {
    attribution: mapConfig.osm.attribution,
    maxZoom: 19
  });

  const cartoLightLayer = L.tileLayer(mapConfig.cartoLight.url, {
    attribution: mapConfig.cartoLight.attribution,
    maxZoom: 19
  });

  const esriSatLayer = L.tileLayer(mapConfig.esriSat.url, {
    attribution: mapConfig.esriSat.attribution,
    maxZoom: 18
  });

  const cartoDarkLayer = L.tileLayer(mapConfig.cartoDark.url, {
    attribution: mapConfig.cartoDark.attribution,
    maxZoom: 19
  });

  // 天地图（仅当 Key 有效时可用）
  const tdtKey = mapConfig.tiandituKey;
  const tdtVec = L.tileLayer(
    `http://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tdtKey}`,
    { subdomains: ['0','1','2','3','4','5','6','7'], maxZoom: 18 }
  );
  const tdtCva = L.tileLayer(
    `http://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tdtKey}`,
    { subdomains: ['0','1','2','3','4','5','6','7'], maxZoom: 18 }
  );
  const tdtGroup = L.layerGroup([tdtVec, tdtCva]);

  // 默认显示 OSM
  osmLayer.addTo(map);

  // 图层控制器
  const baseLayers = {
    '🗺️ OpenStreetMap': osmLayer,
    '🎨 CartoDB 浅色': cartoLightLayer,
    '🛰️ ESRI 卫星': esriSatLayer,
    '🌙 CartoDB 暗黑': cartoDarkLayer,
    '🇨🇳 天地图(需Key)': tdtGroup
  };
  L.control.layers(baseLayers, null, { position: 'topright' }).addTo(map);

  // 缩放控件
  L.control.zoom({ position: 'topright' }).addTo(map);

  // 比例尺
  L.control.scale({
    metric: true,
    imperial: false,
    position: 'bottomright'
  }).addTo(map);

  // --- 坐标显示 ---
  map.on('mousemove', (e) => {
    document.getElementById('display-lng').textContent = e.latlng.lng.toFixed(5);
    document.getElementById('display-lat').textContent = e.latlng.lat.toFixed(5);
  });
  map.on('zoomend', () => {
    document.getElementById('display-zoom').textContent = map.getZoom();
  });
  // 初始 zoom 值
  document.getElementById('display-zoom').textContent = map.getZoom();

  // --- Shift+Click 测距 ---
  map.on('click', (e) => {
    if (measureActive) {
      addMeasurePoint(e.latlng);
    }
  });

  // 创建 marker 图层组
  markerGroup = L.layerGroup().addTo(map);

  // 创建 GDP 图例元素
  createGDPLegend();
}

/* ================================================================
 * 2. 模式切换
 * ================================================================ */
function initModeSwitcher() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      switchMode(mode);
    });
  });
}

function switchMode(mode) {
  currentMode = mode;
  // 先关闭测距
  if (measureActive) stopMeasure();

  switch (mode) {
    case 'explore':
      clearTimelineLine();
      clearChoropleth();
      hideGDPLegend();
      loadPOIs();
      hideEditorHint();
      break;
    case 'timeline':
      clearChoropleth();
      hideGDPLegend();
      loadPOIs();
      drawTimeline();
      hideEditorHint();
      break;
    case 'thematic':
      clearTimelineLine();
      loadPOIs();
      loadChoropleth();
      hideEditorHint();
      break;
    case 'editor':
      clearTimelineLine();
      clearChoropleth();
      hideGDPLegend();
      loadPOIs();
      showEditorHint();
      break;
  }
}

/* ================================================================
 * 3. 加载 POI 标记
 * ================================================================ */
function loadPOIs() {
  markerGroup.clearLayers();
  allMarkers = [];

  // 合并原始数据 + 自定义POI（localStorage）
  const customPOIs = getCustomPOIs();
  const allFeatures = [
    ...myData.features.map(f => ({ ...f, _source: 'builtin' })),
    ...customPOIs.map(f => ({ ...f, _source: 'custom' }))
  ];

  allFeatures.forEach((feature, idx) => {
    const props = feature.properties;
    const coords = feature.geometry.coordinates;
    const latlng = [coords[1], coords[0]];

    // 创建标记
    const marker = L.marker(latlng, {
      icon: createCustomIcon(props.icon, props.category)
    });

    // 绑定 Popup
    marker.bindPopup(createPopupHTML(props), {
      className: 'custom-popup',
      maxWidth: 300
    });

    // 绑定 Tooltip（悬停显示名称）
    marker.bindTooltip(props.name + (feature._source === 'custom' ? ' ✏️' : ''), {
      direction: 'top',
      offset: [0, -24],
      sticky: true,
      className: 'custom-tooltip'
    });

    // 存储属性引用
    marker.featureProps = props;
    marker.featureIndex = idx;
    marker._source = feature._source;
    marker._customId = feature._source === 'custom' ? props.id : null;
    // 保存完整 feature 引用，用于编辑器
    marker._feature = feature;

    // 编辑模式下的点击处理
    if (currentMode === 'editor') {
      marker.off('click');
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        openEditorForMarker(marker);
      });
    }

    allMarkers.push(marker);

    // 按分类筛选
    if (currentCategory === 'all' || props.category === currentCategory) {
      markerGroup.addLayer(marker);
    }
  });

  // 适应范围
  if (allMarkers.length > 0) {
    const group = L.featureGroup(
      currentCategory === 'all' ? allMarkers : allMarkers.filter(m =>
        currentCategory === 'all' || m.featureProps.category === currentCategory
      )
    );
    if (group.getLayers().length > 0) {
      map.fitBounds(group.getBounds(), { padding: [60, 60], maxZoom: 8 });
    }
  }
}

/* ================================================================
 * 4. 分类筛选
 * ================================================================ */
function initFilters() {
  const container = document.getElementById('filter-buttons');

  Object.entries(categoryConfig).forEach(([key, cfg]) => {
    const btn = document.createElement('button');
    btn.className = `filter-btn ${key === 'all' ? 'active' : ''}`;
    btn.dataset.category = key;
    btn.textContent = `${cfg.icon} ${cfg.name}`;

    btn.addEventListener('click', () => {
      currentCategory = key;
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 过滤标记
      markerGroup.clearLayers();
      allMarkers.forEach(m => {
        if (key === 'all' || m.featureProps.category === key) {
          markerGroup.addLayer(m);
        }
      });

      // 更新列表和统计
      updatePlacesList(key);
    });

    container.appendChild(btn);
  });
}

/* ================================================================
 * 5. 统计面板
 * ================================================================ */
function initStats() {
  const features = myData.features;
  const totalPlaces = features.length;

  // 涉及城市（去重）
  const cities = new Set(features.map(f =>
    `${f.properties.city || ''}_${f.properties.province || ''}`
  ));

  // 跨越年份
  const years = features.map(f => {
    const d = f.properties.date;
    return d ? parseInt(d.split('-')[0]) : null;
  }).filter(Boolean);
  const yearSpan = years.length > 0 ? Math.max(...years) - Math.min(...years) : 0;

  // 分类数
  const cats = new Set(features.map(f => f.properties.category));

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-item">
      <div class="stat-value">${totalPlaces}</div>
      <div class="stat-label">地点总数</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${cities.size}</div>
      <div class="stat-label">涉及城市</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${yearSpan}</div>
      <div class="stat-label">跨越年份</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${cats.size}</div>
      <div class="stat-label">分类数量</div>
    </div>
  `;
}

/* ================================================================
 * 6. 地点列表
 * ================================================================ */
function initPlacesList() {
  updatePlacesList('all');
}

function updatePlacesList(category) {
  const container = document.getElementById('places-list');

  const filtered = myData.features.filter(f =>
    category === 'all' || f.properties.category === category
  );

  // 按重要性降序排列
  filtered.sort((a, b) => (b.properties.importance || 0) - (a.properties.importance || 0));

  container.innerHTML = filtered.map(f => {
    const p = f.properties;
    const cfg = categoryConfig[p.category] || categoryConfig.all;
    return `
      <li class="place-item" data-id="${p.id}">
        <span class="place-icon">${p.icon}</span>
        <div class="place-info">
          <div class="place-name">${p.name}</div>
          <div class="place-meta">
            <span class="place-cat-dot" style="background:${cfg.color};"></span>
            ${cfg.name} · ${p.date || ''}
          </div>
        </div>
      </li>
    `;
  }).join('');

  // 点击事件
  container.querySelectorAll('.place-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.id);
      flyToPlace(id);

      // 高亮
      container.querySelectorAll('.place-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

/**
 * 飞行到指定地点并打开弹窗
 */
function flyToPlace(id) {
  const feature = myData.features.find(f => f.properties.id === id);
  if (!feature) return;

  const coords = feature.geometry.coordinates;
  map.flyTo([coords[1], coords[0]], 14, { duration: 1.2 });

  // 找到对应 marker
  const marker = allMarkers.find(m => m.featureProps.id === id);
  if (marker) {
    // 高亮
    resetHighlight();
    highlightMarker = marker;
    const props = marker.featureProps;
    marker.setIcon(createHighlightIcon(props.icon, props.category));

    setTimeout(() => {
      marker.openPopup();
    }, 1300);
  }

  // 侧边栏滚动到对应项
  document.querySelectorAll('.place-item').forEach(i => i.classList.remove('active'));
  const target = document.querySelector(`.place-item[data-id="${id}"]`);
  if (target) {
    target.classList.add('active');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function resetHighlight() {
  if (highlightedMarker) {
    const props = highlightedMarker.featureProps;
    highlightedMarker.setIcon(createCustomIcon(props.icon, props.category));
    highlightedMarker.closePopup();
    highlightedMarker = null;
  }
}

/* ================================================================
 * 7. 书签功能（localStorage 持久化）
 * ================================================================ */
function initBookmarks() {
  renderBookmarks();

  document.getElementById('btn-add-bookmark').addEventListener('click', () => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const name = prompt('书签名称：', `视图 (z${zoom} ${center.lat.toFixed(3)}, ${center.lng.toFixed(3)})`);
    if (!name) return;

    const bookmarks = getBookmarks();
    bookmarks.push({
      name: name,
      lat: center.lat,
      lng: center.lng,
      zoom: zoom,
      time: new Date().toLocaleString()
    });
    saveBookmarks(bookmarks);
    renderBookmarks();
  });
}

function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function saveBookmarks(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function renderBookmarks() {
  const container = document.getElementById('bookmarks-list');
  const bookmarks = getBookmarks();

  if (bookmarks.length === 0) {
    container.innerHTML = '<li class="bookmark-empty">暂无书签，点击下方按钮或使用"添加当前视图"</li>';
    return;
  }

  container.innerHTML = bookmarks.map((b, i) => `
    <li class="bookmark-item" data-index="${i}">
      <span class="bookmark-name" title="${b.name}">🔖 ${b.name}</span>
      <span class="bookmark-coord">${b.lat.toFixed(2)}, ${b.lng.toFixed(2)}</span>
      <button class="bookmark-delete" data-index="${i}" title="删除书签">×</button>
    </li>
  `).join('');

  // 点击书签 → 飞行
  container.querySelectorAll('.bookmark-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('bookmark-delete')) return;
      const idx = parseInt(item.dataset.index);
      const bm = bookmarks[idx];
      map.flyTo([bm.lat, bm.lng], bm.zoom, { duration: 1 });
    });
  });

  // 删除书签
  container.querySelectorAll('.bookmark-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.index);
      const updated = getBookmarks();
      updated.splice(idx, 1);
      saveBookmarks(updated);
      renderBookmarks();
    });
  });
}

/* ================================================================
 * 8. 距离测量（Shift+Click / 按钮切换）
 * ================================================================ */
function initMeasure() {
  document.getElementById('btn-measure-start').addEventListener('click', () => {
    if (measureActive) {
      stopMeasure();
    } else {
      startMeasure();
    }
  });

  document.getElementById('btn-measure-clear').addEventListener('click', clearMeasure);
}

function startMeasure() {
  measureActive = true;
  document.getElementById('btn-measure-start').textContent = '⏹ 结束';
  document.getElementById('btn-measure-start').classList.add('active');
  document.getElementById('btn-measure-clear').style.display = 'inline-block';
  document.getElementById('measure-result').style.display = 'inline-block';
  map.getContainer().style.cursor = 'crosshair';
}

function stopMeasure() {
  measureActive = false;
  document.getElementById('btn-measure-start').textContent = '📏 测距';
  document.getElementById('btn-measure-start').classList.remove('active');
  map.getContainer().style.cursor = '';
}

function addMeasurePoint(latlng) {
  measurePoints.push([latlng.lat, latlng.lng]);

  // 添加标记
  const marker = L.marker(latlng, {
    icon: L.divIcon({
      className: 'measure-marker',
      html: `<div class="measure-dot"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    }),
    interactive: false
  }).addTo(map);
  measureMarkers.push(marker);

  // 更新连线
  updateMeasureLines();
  updateMeasureResult();
}

function updateMeasureLines() {
  // 清除旧线
  measureLines.forEach(l => map.removeLayer(l));
  measureLines = [];

  if (measurePoints.length < 2) return;

  // 绘制折线
  for (let i = 1; i < measurePoints.length; i++) {
    const line = L.polyline([measurePoints[i - 1], measurePoints[i]], {
      color: '#ef4444',
      weight: 2,
      dashArray: '6 4',
      opacity: 0.9
    }).addTo(map);
    measureLines.push(line);

    // 段标签
    const segDist = haversineDistance(measurePoints[i - 1], measurePoints[i]);
    const midLat = (measurePoints[i - 1][0] + measurePoints[i][0]) / 2;
    const midLng = (measurePoints[i - 1][1] + measurePoints[i][1]) / 2;

    const label = L.marker([midLat, midLng], {
      icon: L.divIcon({
        className: 'measure-marker',
        html: `<div class="measure-label">${formatDistance(segDist)}</div>`,
        iconSize: [0, 0]
      }),
      interactive: false
    }).addTo(map);
    measureLines.push(label);  // 复用数组存标签，方便清理
  }
}

function updateMeasureResult() {
  let total = 0;
  for (let i = 1; i < measurePoints.length; i++) {
    total += haversineDistance(measurePoints[i - 1], measurePoints[i]);
  }
  document.getElementById('measure-result').textContent =
    `总计: ${formatDistance(total)}`;
}

function clearMeasure() {
  measurePoints = [];
  measureMarkers.forEach(m => map.removeLayer(m));
  measureMarkers = [];
  measureLines.forEach(l => map.removeLayer(l));
  measureLines = [];
  document.getElementById('measure-result').textContent = '';
}

/* ================================================================
 * 9. 时间线模式
 * ================================================================ */
function drawTimeline() {
  // 按时间排序所有地点
  const sorted = [...myData.features]
    .filter(f => currentCategory === 'all' || f.properties.category === currentCategory)
    .sort((a, b) => (a.properties.date || '').localeCompare(b.properties.date || ''));

  if (sorted.length < 2) return;

  const coords = sorted.map(f => {
    const c = f.geometry.coordinates;
    return [c[1], c[0]];
  });

  timelineLine = L.polyline(coords, {
    color: '#4f6ef7',
    weight: 3,
    opacity: 0.55,
    dashArray: '12 6',
    smoothFactor: 1
  }).addTo(map);

  // 添加顺序标注
  sorted.forEach((f, i) => {
    const c = f.geometry.coordinates;
    const label = L.marker([c[1], c[0]], {
      icon: L.divIcon({
        className: '',
        html: `<div style="
          background:#4f6ef7; color:#fff; border-radius:50%;
          width:20px; height:20px; font-size:10px; font-weight:700;
          display:flex; align-items:center; justify-content:center;
          border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3);
        ">${i + 1}</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      }),
      interactive: false
    }).addTo(map);
    // 存引用以便清理
    if (!timelineLine._labels) timelineLine._labels = [];
    timelineLine._labels.push(label);
  });
}

function clearTimelineLine() {
  if (timelineLine) {
    map.removeLayer(timelineLine);
    if (timelineLine._labels) {
      timelineLine._labels.forEach(l => map.removeLayer(l));
    }
    timelineLine = null;
  }
}

/* ================================================================
 * 10. GDP 专题图层（thematic 模式）
 * ================================================================ */
async function loadChoropleth() {
  if (choroplethLayer) {
    map.removeLayer(choroplethLayer);
    choroplethLayer = null;
  }

  try {
    const resp = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const geoJSON = await resp.json();

    choroplethLayer = L.geoJSON(geoJSON, {
      style: (feature) => {
        const adcode = feature.properties.adcode;
        const gdp = GDP_DATA[adcode];
        return {
          fillColor: getGDPColor(gdp),
          weight: 1,
          opacity: 1,
          color: '#ffffff',
          fillOpacity: 0.7
        };
      },
      onEachFeature: (feature, layer) => {
        const adcode = feature.properties.adcode;
        const name = feature.properties.name;
        const gdp = GDP_DATA[adcode];

        layer.bindTooltip(`${name}${gdp ? ' GDP: ' + (gdp/10000).toFixed(1) + '万亿' : ''}`, {
          sticky: true,
          direction: 'center'
        });

        layer.on({
          mouseover: (e) => {
            e.target.setStyle({ weight: 3, color: '#333', fillOpacity: 0.9 });
            e.target.bringToFront();
          },
          mouseout: (e) => {
            choroplethLayer.resetStyle(e.target);
          },
          click: (e) => {
            const p = e.target.feature.properties;
            const g = GDP_DATA[p.adcode];
            map.fitBounds(e.target.getBounds(), { padding: [40, 40] });
            L.popup()
              .setLatLng(e.latlng)
              .setContent(`
                <b>${p.name}</b><br>
                GDP: ${g ? (g/10000).toFixed(2) + ' 万亿' : '无数据'}<br>
                <span style="font-size:0.75rem;color:#888;">点击查看详情 | 出自 DataV GeoAtlas</span>
              `)
              .openOn(map);
          }
        });
      }
    }).addTo(map);

    showGDPLegend();
    // 专题图层置于 POI 之下
    choroplethLayer.bringToBack();

  } catch (err) {
    console.error('GDP专题图层加载失败:', err);
    alert('⚠️ GDP专题数据加载失败，请检查网络连接。（数据源：阿里 DataV GeoAtlas）');
  }
}

function clearChoropleth() {
  if (choroplethLayer) {
    map.removeLayer(choroplethLayer);
    choroplethLayer = null;
  }
}

/* ================================================================
 * 11. GDP 图例
 * ================================================================ */
function createGDPLegend() {
  const el = document.createElement('div');
  el.className = 'gdp-legend';
  el.id = 'gdp-legend';
  el.innerHTML = `
    <h5>📊 GDP 分级设色（万亿元）</h5>
    ${GDP_BREAKS.slice(0, -1).map((brk, i) => {
      const next = GDP_BREAKS[i + 1];
      return `
        <div class="gdp-legend-row">
          <span class="gdp-legend-swatch" style="background:${GDP_COLORS[i]};"></span>
          ${(brk/10000).toFixed(1)} ~ ${(next/10000).toFixed(1)}
        </div>`;
    }).join('')}
    <div class="gdp-legend-row">
      <span class="gdp-legend-swatch" style="background:#cccccc;"></span>
      无数据
    </div>
    <div style="font-size:0.65rem;color:#94a3b8;margin-top:4px;">色带: YlOrRd · 点击省份查看详情</div>
  `;
  document.querySelector('.map-container').appendChild(el);
  gdpLegendEl = el;
}

function showGDPLegend() {
  if (gdpLegendEl) gdpLegendEl.classList.add('visible');
}

function hideGDPLegend() {
  if (gdpLegendEl) gdpLegendEl.classList.remove('visible');
}

/* ================================================================
 * 12. 详情弹层
 * ================================================================ */
function initDetailOverlay() {
  document.getElementById('detail-close').addEventListener('click', () => {
    document.getElementById('detail-overlay').style.display = 'none';
  });

  document.getElementById('detail-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      document.getElementById('detail-overlay').style.display = 'none';
    }
  });

  // ESC 关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.getElementById('detail-overlay').style.display = 'none';
    }
  });
}

/* ================================================================
 * 13. 标注编辑器（高级功能 — 第09讲挑战1）
 * ================================================================ */
const CUSTOM_POI_KEY = 'gis-portfolio-custom-pois';

function getCustomPOIs() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_POI_KEY)) || []; }
  catch { return []; }
}

function saveCustomPOIs(list) {
  localStorage.setItem(CUSTOM_POI_KEY, JSON.stringify(list));
}

let editorTargetMarker = null;   // 正在编辑的 marker（null = 新建）
let editorPickedLatLng = null;   // 点击地图选中的坐标

function initEditor() {
  // 地图点击 → 新建 POI
  map.on('click', (e) => {
    if (currentMode !== 'editor') return;
    // 检查是否点到了 marker（marker 自己的 click 会 stopPropagation）
    openEditorForNew(e.latlng);
  });

  // 对话框事件
  document.getElementById('editor-close').addEventListener('click', closeEditor);
  document.getElementById('editor-btn-cancel').addEventListener('click', closeEditor);
  document.getElementById('editor-btn-save').addEventListener('click', saveEditorPOI);
  document.getElementById('editor-btn-delete').addEventListener('click', deleteEditorPOI);

  // ESC 关闭
  document.getElementById('editor-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeEditor();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('editor-overlay').style.display !== 'none') {
      closeEditor();
    }
  });
}

function openEditorForNew(latlng) {
  editorTargetMarker = null;
  editorPickedLatLng = latlng;
  document.getElementById('editor-title').textContent = '✏️ 添加新地点';
  document.getElementById('editor-btn-delete').style.display = 'none';
  document.getElementById('editor-btn-save').textContent = '💾 保存';
  clearEditorForm();
  document.getElementById('editor-coord').textContent =
    `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
  document.getElementById('editor-overlay').style.display = 'flex';
}

function openEditorForMarker(marker) {
  editorTargetMarker = marker;
  editorPickedLatLng = marker.getLatLng();
  const p = marker.featureProps;

  document.getElementById('editor-title').textContent = '✏️ 编辑地点';
  document.getElementById('editor-btn-delete').style.display =
    marker._source === 'custom' ? 'inline-block' : 'none';
  document.getElementById('editor-btn-save').textContent = '💾 更新';

  // 填充表单
  document.getElementById('editor-name').value = p.name || '';
  document.getElementById('editor-category').value = p.category || 'travel';
  document.getElementById('editor-icon').value = p.icon || '📍';
  document.getElementById('editor-importance').value = p.importance || 70;
  document.getElementById('editor-desc').value = p.description || '';
  document.getElementById('editor-memory').value = p.memory || '';
  document.getElementById('editor-city').value = p.city || '';
  document.getElementById('editor-province').value = p.province || '';

  // 日期格式转换
  if (p.date) {
    const m = p.date.match(/^(\d{4})-(\d{2})/);
    if (m) document.getElementById('editor-date').value = `${m[1]}-${m[2]}`;
    else document.getElementById('editor-date').value = '';
  }

  document.getElementById('editor-coord').textContent =
    `${editorPickedLatLng.lat.toFixed(5)}, ${editorPickedLatLng.lng.toFixed(5)}`;
  document.getElementById('editor-overlay').style.display = 'flex';
}

function closeEditor() {
  document.getElementById('editor-overlay').style.display = 'none';
  editorTargetMarker = null;
  editorPickedLatLng = null;
}

function clearEditorForm() {
  document.getElementById('editor-name').value = '';
  document.getElementById('editor-category').value = 'travel';
  document.getElementById('editor-date').value = '';
  document.getElementById('editor-icon').value = '📍';
  document.getElementById('editor-importance').value = '70';
  document.getElementById('editor-desc').value = '';
  document.getElementById('editor-memory').value = '';
  document.getElementById('editor-city').value = '';
  document.getElementById('editor-province').value = '';
}

function saveEditorPOI() {
  const name = document.getElementById('editor-name').value.trim();
  if (!name) { alert('请输入地点名称'); return; }
  if (!editorPickedLatLng) { alert('请在地图上点击选择位置'); return; }

  const cat = document.getElementById('editor-category').value;
  const cfg = categoryConfig[cat] || categoryConfig.travel;
  const dateVal = document.getElementById('editor-date').value || '';

  const props = {
    id: editorTargetMarker ? editorTargetMarker.featureProps.id : Date.now(),
    name: name,
    category: cat,
    categoryName: cfg.name,
    date: dateVal,
    description: document.getElementById('editor-desc').value.trim(),
    icon: document.getElementById('editor-icon').value.trim() || '📍',
    importance: parseInt(document.getElementById('editor-importance').value) || 70,
    memory: document.getElementById('editor-memory').value.trim(),
    city: document.getElementById('editor-city').value.trim(),
    province: document.getElementById('editor-province').value.trim()
  };

  const feature = {
    type: 'Feature',
    properties: props,
    geometry: {
      type: 'Point',
      coordinates: [editorPickedLatLng.lng, editorPickedLatLng.lat]
    }
  };

  if (editorTargetMarker && editorTargetMarker._source === 'custom') {
    // 更新已有自定义 POI
    const customs = getCustomPOIs();
    const idx = customs.findIndex(f => f.properties.id === editorTargetMarker.featureProps.id);
    if (idx >= 0) customs[idx] = feature;
    saveCustomPOIs(customs);
  } else if (editorTargetMarker && editorTargetMarker._source === 'builtin') {
    // 编辑内置 POI → 另存为自定义
    props.id = Date.now();
    feature.properties = props;
    const customs = getCustomPOIs();
    customs.push(feature);
    saveCustomPOIs(customs);
  } else {
    // 新建
    const customs = getCustomPOIs();
    feature.properties.id = Date.now();
    customs.push(feature);
    saveCustomPOIs(customs);
  }

  closeEditor();
  loadPOIs();
  updatePlacesList(currentCategory);
  initStats();
}

function deleteEditorPOI() {
  if (!editorTargetMarker || editorTargetMarker._source !== 'custom') return;
  if (!confirm(`确定删除"${editorTargetMarker.featureProps.name}"？此操作不可撤销。`)) return;

  const customs = getCustomPOIs();
  const filtered = customs.filter(f => f.properties.id !== editorTargetMarker.featureProps.id);
  saveCustomPOIs(filtered);

  closeEditor();
  loadPOIs();
  updatePlacesList(currentCategory);
  initStats();
}

function showEditorHint() {
  let hint = document.getElementById('editor-hint');
  if (!hint) {
    hint = document.createElement('div');
    hint.id = 'editor-hint';
    hint.className = 'editor-hint';
    hint.textContent = '💡 点击地图添加新地点 · 点击已有标注编辑';
    document.querySelector('.map-container').appendChild(hint);
  }
  hint.style.display = 'block';
}

function hideEditorHint() {
  const hint = document.getElementById('editor-hint');
  if (hint) hint.style.display = 'none';
}

/* ================================================================
 * 14. 全局错误处理
 * ================================================================ */
window.onerror = function (msg, url, line, col, err) {
  console.error(`[Portfolio Error] ${msg} @ ${url}:${line}:${col}`, err);
  return false;
};

// 设置页脚年份
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

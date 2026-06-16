/**
 * ============================================================
 * 实验三 - WebGIS二维开发 主逻辑
 * 功能模块：
 *   1. 地图初始化 + 多底图切换（天地图 / OSM）
 *   2. 多类型 POI 标注（自定义图标 + Popup + Tooltip）
 *   3. 地图书签 / 视角定位（localStorage 持久化）
 *   4. 比例尺 + 鼠标坐标显示 + 距离测量工具
 * ============================================================
 */

/* ================================================================
   第一部分：全局配置
   ================================================================ */

/** 天地图密钥（请替换为自己的 Key，若无 Key 可使用 OSM 底图） */
const TIANDITU_KEY = '您的天地图密钥';

/** 默认地图中心（北京天安门） */
const DEFAULT_CENTER = [39.9042, 116.4074];

/** 默认缩放级别 */
const DEFAULT_ZOOM = 11;

/** localStorage 书签存储键 */
const BOOKMARK_STORAGE_KEY = 'exp3_map_bookmarks';

/* ================================================================
   第二部分：底图图层工厂
   ================================================================ */

/**
 * 创建天地图瓦片图层
 * @param {string} layer - 图层类型 (vec/cva/img/cia/ter/cta)
 * @param {string} attribution - 版权声明
 * @returns {L.TileLayer}
 */
function createTiandituLayer(layer, attribution) {
    const baseURL = `http://t{s}.tianditu.gov.cn/${layer}_w/wmts`;
    const params = `SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0` +
                   `&LAYER=${layer}&STYLE=default&TILEMATRIXSET=w` +
                   `&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_KEY}`;
    return L.tileLayer(`${baseURL}?${params}`, {
        subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
        attribution: attribution || '&copy; 天地图'
    });
}

/**
 * 创建 OSM 瓦片图层
 * @returns {L.TileLayer}
 */
function createOSMLayer() {
    return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
}

/* ================================================================
   第三部分：地图初始化
   ================================================================ */

/** @type {L.Map} 地图实例 */
let map;

/** POI 标记数组 [{ feature, marker }] */
let poiMarkers = [];

/** POI 分类图层组映射 { category: L.LayerGroup } */
let poiLayerGroups = {};

/** 所有分类图层集合（用于图层控制器） */
let allPOIGroup;

/** 地图是否已初始化 */
let mapInitialized = false;

/**
 * 初始化地图
 */
function initMap() {
    // ---- 创建地图实例 ----
    map = L.map('map', {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: 3,
        maxZoom: 18,
        zoomControl: false
    });

    // ---- 底图图层 ----
    // 天地图图层组
    const tiandituVec = createTiandituLayer('vec', '&copy; 天地图 矢量');
    const tiandituCva = createTiandituLayer('cva');
    const tiandituImg = createTiandituLayer('img', '&copy; 天地图 影像');
    const tiandituCia = createTiandituLayer('cia');
    const tiandituTer = createTiandituLayer('ter', '&copy; 天地图 地形');
    const tiandituCta = createTiandituLayer('cta');

    // OSM 图层
    const osmLayer = createOSMLayer();

    // 底图组合（底图 + 对应注记 包装为 LayerGroup）
    const baseVecGroup = L.layerGroup([tiandituVec, tiandituCva]);
    const baseImgGroup = L.layerGroup([tiandituImg, tiandituCia]);
    const baseTerGroup = L.layerGroup([tiandituTer, tiandituCta]);
    const baseOSMGroup = L.layerGroup([osmLayer]);

    // 默认加载 OSM（无需 Key），天地图需替换 Key 后可使用
    baseOSMGroup.addTo(map);

    // ---- POI 叠加图层 ----
    allPOIGroup = L.layerGroup().addTo(map);

    // ---- 图层控制器 ----
    const baseLayers = {
        '🗺️ 矢量地图 (天地图)': baseVecGroup,
        '🛰️ 卫星影像 (天地图)': baseImgGroup,
        '⛰️ 地形地图 (天地图)': baseTerGroup,
        '🌍 OpenStreetMap': baseOSMGroup
    };

    const overlayLayers = {
        '📍 全部 POI': allPOIGroup
    };

    L.control.layers(baseLayers, overlayLayers, {
        position: 'topright',
        collapsed: false
    }).addTo(map);

    // ---- 缩放控件 ----
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // ---- 比例尺 ----
    L.control.scale({
        metric: true,
        imperial: false,
        position: 'bottomleft'
    }).addTo(map);

    mapInitialized = true;
}

/* ================================================================
   第四部分：POI 标注加载
   ================================================================ */

/**
 * 加载所有 POI 标注到地图
 */
function loadPOIs() {
    if (!mapInitialized) return;

    // 分类统计
    const counts = {};

    // 遍历 GeoJSON 创建标注
    poiGeoJSON.features.forEach((feature) => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates; // [lng, lat]
        const category = props.category;
        const config = categoryConfig[category];

        if (!config) return;

        // 统计
        counts[category] = (counts[category] || 0) + 1;

        // 创建自定义图标
        const icon = createPOIIcon(props.icon, category);

        // 创建 Marker
        const marker = L.marker([coords[1], coords[0]], { icon: icon });

        // 绑定 Popup
        marker.bindPopup(createPopupHTML(props), {
            maxWidth: 280,
            className: 'custom-popup'
        });

        // 绑定 Tooltip（鼠标悬停显示名称）
        marker.bindTooltip(props.name, {
            direction: 'top',
            offset: [0, -22],
            opacity: 0.9
        });

        // 添加到总图层组
        marker.addTo(allPOIGroup);

        // 保存引用
        poiMarkers.push({ feature, marker });
    });

    // 更新统计面板
    updateStatsPanel(counts);
}

/**
 * 更新 POI 统计面板
 * @param {Object} counts - { category: count }
 */
function updateStatsPanel(counts) {
    const container = document.getElementById('statsContent');
    let html = '';
    for (const [category, config] of Object.entries(categoryConfig)) {
        const count = counts[category] || 0;
        html += `
            <div class="stat-row">
                <span class="stat-dot" style="background:${config.color}"></span>
                <span>${config.name}</span>
                <span class="stat-count">${count}</span>
            </div>
        `;
    }
    container.innerHTML = html;
}

/* ================================================================
   第五部分：坐标显示
   ================================================================ */

/**
 * 初始化坐标显示
 */
function initCoordinateDisplay() {
    // 鼠标移动实时更新坐标
    map.on('mousemove', function (e) {
        const { lat, lng } = e.latlng;
        document.getElementById('displayLng').textContent = lng.toFixed(6);
        document.getElementById('displayLat').textContent = lat.toFixed(6);
        document.getElementById('displayZoom').textContent = map.getZoom();
    });

    // 鼠标离开地图时保留最后坐标
    map.on('mouseout', function () {
        // 保持最后值不变
    });

    // 点击地图显示坐标
    map.on('click', function (e) {
        const { lat, lng } = e.latlng;
        document.getElementById('displayClick').textContent =
            `${lng.toFixed(6)}, ${lat.toFixed(6)}`;
    });

    // 缩放变化
    map.on('zoomend', function () {
        document.getElementById('displayZoom').textContent = map.getZoom();
    });

    // 初始缩放
    document.getElementById('displayZoom').textContent = DEFAULT_ZOOM;
}

/* ================================================================
   第六部分：地图书签功能
   ================================================================ */

/**
 * 从 localStorage 加载书签
 * @returns {Array}
 */
function loadBookmarks() {
    try {
        const data = localStorage.getItem(BOOKMARK_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

/**
 * 保存书签到 localStorage
 * @param {Array} bookmarks
 */
function saveBookmarks(bookmarks) {
    localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarks));
}

/**
 * 渲染书签列表
 */
function renderBookmarks() {
    const list = document.getElementById('bookmarkList');
    const bookmarks = loadBookmarks();

    if (bookmarks.length === 0) {
        list.innerHTML = '<li class="bookmark-empty">暂无书签<br>输入名称后点击保存</li>';
        return;
    }

    list.innerHTML = bookmarks.map((b, idx) => `
        <li class="bookmark-item" onclick="flyToBookmark(${idx})">
            <div class="bm-info">
                <div class="bm-name">📍 ${escapeHTML(b.name)}</div>
                <div class="bm-coords">
                    ${b.lat.toFixed(4)}, ${b.lng.toFixed(4)} | 级别 ${b.zoom}
                </div>
            </div>
            <button class="bm-delete" onclick="deleteBookmark(event, ${idx})"
                    title="删除此书签">×</button>
        </li>
    `).join('');
}

/**
 * 添加书签（保存当前视角）
 */
function addBookmark() {
    const nameInput = document.getElementById('bookmarkName');
    const name = nameInput.value.trim();

    if (!name) {
        // 用坐标+缩放自动生成名称
        const center = map.getCenter();
        const autoName = `视角 ${center.lat.toFixed(3)}, ${center.lng.toFixed(3)}`;
        // 提示用户输入
        nameInput.focus();
        return;
    }

    const center = map.getCenter();
    const zoom = map.getZoom();

    const bookmarks = loadBookmarks();
    bookmarks.push({
        name: name,
        lat: center.lat,
        lng: center.lng,
        zoom: zoom,
        createdAt: new Date().toISOString()
    });

    saveBookmarks(bookmarks);
    renderBookmarks();
    nameInput.value = '';

    // 反馈
    showToast('✅ 书签已保存: ' + name);
}

/**
 * 跳转到书签视角
 * @param {number} index
 */
function flyToBookmark(index) {
    const bookmarks = loadBookmarks();
    const bm = bookmarks[index];
    if (!bm) return;

    map.flyTo([bm.lat, bm.lng], bm.zoom, {
        animate: true,
        duration: 1.5
    });

    showToast('📍 跳转到: ' + bm.name);
}

/**
 * 删除书签
 * @param {Event} event - 点击事件
 * @param {number} index
 */
function deleteBookmark(event, index) {
    // 阻止冒泡（否则会触发 flyToBookmark）
    event.stopPropagation();

    const bookmarks = loadBookmarks();
    const bm = bookmarks[index];
    if (!bm) return;

    bookmarks.splice(index, 1);
    saveBookmarks(bookmarks);
    renderBookmarks();

    showToast('🗑️ 已删除: ' + bm.name);
}

/**
 * 更新当前视角显示
 */
function updateCurrentView() {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const el = document.getElementById('currentViewInfo');
    if (el) {
        el.textContent = `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)} | 缩放 ${zoom}`;
    }
}

/* ================================================================
   第七部分：距离测量工具
   ================================================================ */

/** 测量点坐标数组 */
let measurePoints = [];

/** 测量点 Marker 数组 */
let measureMarkers = [];

/** 测量线图层 */
let measureLine = null;

/** 距离标签数组 */
let measureLabels = [];

/**
 * Haversine 公式计算球面距离（米）
 * @param {L.LatLng} latlng1
 * @param {L.LatLng} latlng2
 * @returns {number} 距离（米）
 */
function haversineDistance(latlng1, latlng2) {
    const R = 6371000; // 地球平均半径（米）
    const dLat = (latlng2.lat - latlng1.lat) * Math.PI / 180;
    const dLng = (latlng2.lng - latlng1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(latlng1.lat * Math.PI / 180) *
              Math.cos(latlng2.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * 格式化距离显示
 * @param {number} meters
 * @returns {string}
 */
function formatDistance(meters) {
    if (meters >= 1000) {
        return (meters / 1000).toFixed(2) + ' km';
    }
    return meters.toFixed(1) + ' m';
}

/**
 * 计算总距离
 * @returns {number}
 */
function calcTotalDistance() {
    let total = 0;
    for (let i = 1; i < measurePoints.length; i++) {
        total += haversineDistance(measurePoints[i - 1], measurePoints[i]);
    }
    return total;
}

/**
 * 更新测量信息面板
 */
function updateMeasurePanel() {
    document.getElementById('measureCount').textContent = measurePoints.length;
    document.getElementById('totalDistance').textContent = formatDistance(calcTotalDistance());

    // 最后一段距离
    if (measurePoints.length >= 2) {
        const lastDist = haversineDistance(
            measurePoints[measurePoints.length - 2],
            measurePoints[measurePoints.length - 1]
        );
        document.getElementById('segmentDistance').textContent = formatDistance(lastDist);
    } else {
        document.getElementById('segmentDistance').textContent = '--';
    }
}

/**
 * 刷新测量线
 */
function refreshMeasureLine() {
    if (measureLine) {
        map.removeLayer(measureLine);
        measureLine = null;
    }

    if (measurePoints.length >= 2) {
        measureLine = L.polyline(measurePoints, {
            color: '#1890ff',
            weight: 3,
            opacity: 0.8,
            dashArray: '10, 6'
        }).addTo(map);
    }
}

/**
 * 刷新距离标签
 */
function refreshMeasureLabels() {
    // 清除旧标签
    measureLabels.forEach(l => map.removeLayer(l));
    measureLabels = [];

    // 为每段线段添加距离标签
    for (let i = 1; i < measurePoints.length; i++) {
        const p1 = measurePoints[i - 1];
        const p2 = measurePoints[i];
        const dist = haversineDistance(p1, p2);

        // 计算线段中点
        const midLat = (p1.lat + p2.lat) / 2;
        const midLng = (p1.lng + p2.lng) / 2;

        const label = L.marker([midLat, midLng], {
            icon: L.divIcon({
                className: '',
                html: `<div class="distance-label">${formatDistance(dist)}</div>`,
                iconSize: [80, 20],
                iconAnchor: [40, 10]
            }),
            interactive: false
        }).addTo(map);

        measureLabels.push(label);
    }
}

/**
 * 刷新测量点样式（首尾特殊色）
 */
function refreshMarkerStyles() {
    measureMarkers.forEach((marker, idx) => {
        let cls = 'measure-point-marker';
        if (idx === 0) cls += ' start';
        if (idx === measurePoints.length - 1 && idx > 0) cls += ' end';

        marker.setIcon(L.divIcon({
            className: '',
            html: `<div class="${cls}"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        }));
    });
}

/**
 * 在地图上添加测量点
 * @param {L.LatLng} latlng
 */
function addMeasurePoint(latlng) {
    const marker = L.marker(latlng, {
        draggable: true,
        icon: L.divIcon({
            className: '',
            html: '<div class="measure-point-marker"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        })
    }).addTo(map);

    // 拖拽更新
    marker.on('drag', function (e) {
        const idx = measureMarkers.indexOf(marker);
        if (idx >= 0) {
            measurePoints[idx] = e.latlng;
            refreshMeasureLine();
            refreshMeasureLabels();
            updateMeasurePanel();
        }
    });

    // 悬停提示
    marker.bindTooltip(`测量点 ${measurePoints.length + 1}`, {
        permanent: false,
        direction: 'top',
        offset: [0, -10]
    });

    return marker;
}

/**
 * 清除全部测量
 */
function clearMeasure() {
    measureMarkers.forEach(m => map.removeLayer(m));
    measureMarkers = [];
    measureLabels.forEach(l => map.removeLayer(l));
    measureLabels = [];
    if (measureLine) {
        map.removeLayer(measureLine);
        measureLine = null;
    }
    measurePoints = [];
    updateMeasurePanel();
}

/**
 * 撤销上一个测量点
 */
function undoLastPoint() {
    if (measurePoints.length === 0) return;
    measurePoints.pop();
    const lastMarker = measureMarkers.pop();
    if (lastMarker) map.removeLayer(lastMarker);

    refreshMeasureLine();
    refreshMeasureLabels();
    refreshMarkerStyles();
    updateMeasurePanel();
}

/**
 * 初始化测量模式
 */
function initMeasureTool() {
    // 双击地图不触发测量（避免与缩放冲突）
    map.on('dblclick', function (e) {
        L.DomEvent.stopPropagation(e);
    });

    // 使用 Shift+Click 来添加测量点，避免与普通点击冲突
    map.on('click', function (e) {
        // 检查是否按下了 Shift 键（测量模式）
        if (e.originalEvent.shiftKey) {
            L.DomEvent.stopPropagation(e);

            measurePoints.push(e.latlng);
            const marker = addMeasurePoint(e.latlng);
            measureMarkers.push(marker);

            refreshMeasureLine();
            refreshMeasureLabels();
            refreshMarkerStyles();
            updateMeasurePanel();
        }
    });

    // 键盘快捷键
    document.addEventListener('keydown', function (e) {
        // Ctrl+Z 撤销上一点
        if (e.ctrlKey && e.key === 'z' && measurePoints.length > 0) {
            // 仅在不聚焦输入框时
            if (document.activeElement === document.body) {
                e.preventDefault();
                undoLastPoint();
            }
        }
    });
}

/* ================================================================
   第八部分：提示消息
   ================================================================ */

/**
 * 显示 Toast 提示
 * @param {string} message
 */
function showToast(message) {
    // 移除旧 toast
    const old = document.querySelector('.map-toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.className = 'map-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 60px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.82);
        color: #fff;
        padding: 10px 24px;
        border-radius: 20px;
        font-size: 0.9rem;
        z-index: 9999;
        pointer-events: none;
        animation: toastIn 0.3s ease, toastOut 0.3s ease 1.7s forwards;
    `;
    document.body.appendChild(toast);

    // 2 秒后自动移除
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 2100);
}

// 动态注入 toast 动画
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes toastIn {
        from { opacity: 0; transform: translateX(-50%) translateY(10px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes toastOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to   { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    }
`;
document.head.appendChild(toastStyle);

/* ================================================================
   第九部分：工具函数
   ================================================================ */

/**
 * HTML 转义
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/* ================================================================
   第十部分：应用入口
   ================================================================ */

document.addEventListener('DOMContentLoaded', function () {
    console.log('🗺️ 实验三 - WebGIS 二维开发 初始化...');

    // 1. 初始化地图
    initMap();
    console.log('  ✅ 地图初始化完成');

    // 2. 加载 POI
    loadPOIs();
    console.log(`  ✅ POI 加载完成 (${poiMarkers.length} 个标注)`);

    // 3. 初始化坐标显示
    initCoordinateDisplay();
    console.log('  ✅ 坐标显示已启用');

    // 4. 渲染书签
    renderBookmarks();
    console.log('  ✅ 书签功能就绪');

    // 5. 初始化测量工具
    initMeasureTool();
    console.log('  ✅ 测量工具就绪（Shift+点击 添加测量点）');

    // 6. 监听地图移动更新视角显示
    map.on('moveend', updateCurrentView);
    map.on('zoomend', updateCurrentView);
    updateCurrentView();

    // 7. 书签输入框回车保存
    document.getElementById('bookmarkName').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addBookmark();
        }
    });

    console.log('🎉 实验三应用初始化完毕！');
    console.log('💡 提示：Shift+点击地图 = 添加测量点');
    console.log('💡 提示：Ctrl+Z = 撤销上一个测量点');
});

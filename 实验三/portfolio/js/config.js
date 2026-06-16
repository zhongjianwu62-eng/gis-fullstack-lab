/**
 * ============================================================
 * 地图配置 & 工具函数 — 个人GIS作品集
 * ============================================================
 */

/* ================================================================
 * 地图初始化配置
 * ================================================================ */
const mapConfig = {
  initialView: {
    center: [33.0, 111.0],  // 中国中部概览
    zoom: 5
  },
  maxBounds: [
    [3.0, 73.0],    // 西南
    [54.0, 135.0]   // 东北
  ],
  minZoom: 3,
  maxZoom: 18,

  // 天地图（需替换为实际 Key）
  tiandituKey: '您的天地图密钥',

  // OSM
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    name: 'OpenStreetMap'
  },

  // CartoDB 浅色（专题图底图）
  cartoLight: {
    url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    name: 'CartoDB 浅色'
  },

  // 卫星
  esriSat: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
    name: 'ESRI 卫星'
  },

  // 暗黑
  cartoDark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    name: 'CartoDB 暗黑'
  }
};

/* ================================================================
 * GDP 专题数据 — 中国各省2023年GDP（亿元）
 * 用于 thematic 模式的分级设色
 * ================================================================ */
const GDP_DATA = {
  '110000': 43760,   // 北京
  '120000': 15622,   // 天津
  '130000': 42370,   // 河北
  '140000': 25642,   // 山西
  '150000': 23159,   // 内蒙古
  '210000': 28975,   // 辽宁
  '220000': 13070,   // 吉林
  '230000': 15901,   // 黑龙江
  '310000': 44752,   // 上海
  '320000': 122875,  // 江苏
  '330000': 77715,   // 浙江
  '340000': 45045,   // 安徽
  '350000': 53109,   // 福建
  '360000': 32074,   // 江西
  '370000': 87435,   // 山东
  '410000': 61345,   // 河南
  '420000': 53734,   // 湖北
  '430000': 48670,   // 湖南
  '440000': 135673,  // 广东
  '450000': 26300,   // 广西
  '460000': 6818,    // 海南
  '500000': 29129,   // 重庆
  '510000': 56749,   // 四川
  '520000': 20164,   // 贵州
  '530000': 28954,   // 云南
  '540000': 2392,    // 西藏
  '610000': 32772,   // 陕西
  '620000': 11201,   // 甘肃
  '630000': 3610,    // 青海
  '640000': 5069,    // 宁夏
  '650000': 17741,   // 新疆
  '710000': 5320,    // 台湾
  '810000': 24280,   // 香港
  '820000': 2360     // 澳门
};

/* 分级设色断点（8级，YlOrRd 色带） */
const GDP_BREAKS = [0, 5000, 10000, 20000, 35000, 55000, 80000, 100000, 140000];
const GDP_COLORS = [
  '#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C',
  '#FC4E2A', '#E31A1C', '#BD0026', '#800026'
];

/**
 * 根据 GDP 值获取填充颜色
 */
function getGDPColor(gdp) {
  if (!gdp && gdp !== 0) return '#cccccc';
  for (let i = GDP_BREAKS.length - 1; i >= 0; i--) {
    if (gdp >= GDP_BREAKS[i]) return GDP_COLORS[i];
  }
  return GDP_COLORS[0];
}

/* ================================================================
 * 创建自定义 DivIcon
 * ================================================================ */
function createCustomIcon(emoji, category) {
  const config = categoryConfig[category] || categoryConfig.all;
  const color = config.color;
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div style="
        width: 40px; height: 40px;
        background: ${color};
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 20px;
        border: 3px solid #fff;
        box-shadow: 0 3px 12px rgba(0,0,0,0.25);
        transition: transform 0.15s;
      ">${emoji}</div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22]
  });
}

/**
 * 创建高亮（选中）状态的图标
 */
function createHighlightIcon(emoji, category) {
  const config = categoryConfig[category] || categoryConfig.all;
  const color = config.color;
  return L.divIcon({
    className: 'custom-marker-icon highlight',
    html: `
      <div style="
        width: 52px; height: 52px;
        background: ${color};
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 26px;
        border: 4px solid #fff;
        box-shadow: 0 4px 20px rgba(0,0,0,0.35);
        transform: scale(1.15);
        transition: transform 0.2s;
        animation: pulse 0.6s ease-in-out;
      ">${emoji}</div>
    `,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
    popupAnchor: [0, -28]
  });
}

/* ================================================================
 * 创建 Popup 内容 HTML
 * ================================================================ */
function createPopupHTML(props) {
  const config = categoryConfig[props.category] || categoryConfig.all;
  let dateStr = props.date || '';
  if (props.endDate) dateStr += ' ~ ' + props.endDate;

  let html = `
    <div class="popup-header" style="background:${config.color};">
      <span class="ph-icon">${props.icon}</span>
      <div>
        <h4>${props.name}</h4>
        <span class="ph-date">📅 ${dateStr}</span>
      </div>
    </div>
    <div class="popup-body">
      <p>${props.description || ''}</p>
  `;

  if (props.memory) {
    html += `<div class="popup-memory">💭 "${props.memory}"</div>`;
  }

  html += `
      <span class="popup-cat-tag" style="background:${config.color};">${config.icon} ${config.name}</span>
      <span style="margin-left:6px;font-size:0.7rem;color:#94a3b8;">📍 ${props.city || ''} · ${props.province || ''}</span>
    </div>
  `;
  return html;
}

/* ================================================================
 * 创建详情弹层内容（侧边栏点击时用）
 * ================================================================ */
function createDetailHTML(props) {
  const config = categoryConfig[props.category] || categoryConfig.all;
  let dateStr = props.date || '';
  if (props.endDate) dateStr += ' ~ ' + props.endDate;

  let html = `
    <div class="detail-header">
      <div class="detail-icon" style="background:${config.bg};">${props.icon}</div>
      <div class="detail-title">
        <h3>${props.name}</h3>
        <span class="detail-date">📅 ${dateStr}</span>
      </div>
    </div>
    <div class="detail-desc">${props.description || ''}</div>
  `;

  if (props.memory) {
    html += `<div class="detail-memory">💭 "${props.memory}"</div>`;
  }

  html += `
    <div class="detail-tags">
      <span class="detail-tag" style="background:${config.color};">${config.icon} ${config.name}</span>
      <span class="detail-tag" style="background:#64748b;">📍 ${props.city || ''} · ${props.province || ''}</span>
      ${props.importance ? `<span class="detail-tag" style="background:#94a3b8;">⭐ ${props.importance}</span>` : ''}
    </div>
  `;
  return html;
}

/* ================================================================
 * 测量辅助函数
 * ================================================================ */

/**
 * Haversine 球面距离公式
 * @param {[number,number]} p1 [lat, lng]
 * @param {[number,number]} p2 [lat, lng]
 * @returns {number} 距离（米）
 */
function haversineDistance(p1, p2) {
  const R = 6371000;
  const toRad = Math.PI / 180;
  const dLat = (p2[0] - p1[0]) * toRad;
  const dLng = (p2[1] - p1[1]) * toRad;
  const a = Math.sin(dLat/2)**2 + Math.cos(p1[0]*toRad)*Math.cos(p2[0]*toRad)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/**
 * 格式化距离
 */
function formatDistance(meters) {
  if (meters < 1000) return Math.round(meters) + ' m';
  return (meters / 1000).toFixed(2) + ' km';
}

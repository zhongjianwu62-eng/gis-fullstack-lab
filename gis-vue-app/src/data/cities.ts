/**
 * 中国主要城市坐标数据
 * 格式：[经度, 纬度]
 */
export interface CityInfo {
  /** 城市名称 */
  name: string
  /** 省份 */
  province: string
  /** 坐标 [经度, 纬度] */
  center: [number, number]
  /** 默认缩放级别 */
  zoom: number
}

export const CHINA_CITIES: CityInfo[] = [
  { name: '北京',   province: '北京市',   center: [116.4074, 39.9042],  zoom: 12 },
  { name: '上海',   province: '上海市',   center: [121.4737, 31.2304],  zoom: 12 },
  { name: '广州',   province: '广东省',   center: [113.2644, 23.1291],  zoom: 12 },
  { name: '深圳',   province: '广东省',   center: [114.0579, 22.5431],  zoom: 12 },
  { name: '武汉',   province: '湖北省',   center: [114.3054, 30.5931],  zoom: 12 },
  { name: '成都',   province: '四川省',   center: [104.0657, 30.6598],  zoom: 12 },
  { name: '西安',   province: '陕西省',   center: [108.9402, 34.3416],  zoom: 12 },
  { name: '南京',   province: '江苏省',   center: [118.7969, 32.0603],  zoom: 12 },
  { name: '杭州',   province: '浙江省',   center: [120.1551, 30.2741],  zoom: 12 },
  { name: '重庆',   province: '重庆市',   center: [106.5516, 29.5630],  zoom: 12 },
  { name: '哈尔滨', province: '黑龙江省', center: [126.6424, 45.7567],  zoom: 12 },
  { name: '乌鲁木齐', province: '新疆维吾尔自治区', center: [87.6168, 43.8256], zoom: 11 },
  { name: '拉萨',   province: '西藏自治区', center: [91.1119, 29.6500],  zoom: 12 },
  { name: '昆明',   province: '云南省',   center: [102.7123, 25.0406],  zoom: 12 },
  { name: '三亚',   province: '海南省',   center: [109.5082, 18.2528],  zoom: 13 },
]

/**
 * 根据城市名查找坐标
 */
export function findCity(name: string): CityInfo | undefined {
  return CHINA_CITIES.find(c => c.name === name)
}

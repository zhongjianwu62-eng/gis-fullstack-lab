/**
 * ============================================================
 * 个人地点数据 — 钟健武 · 我的GIS人生地图
 * ============================================================
 * 数据标准：GeoJSON FeatureCollection (RFC 7946)
 * 坐标系统：WGS84 (EPSG:4326)，经纬度顺序 [lng, lat]
 * 15+ 地点 · 5 大类 · 覆盖 8 个省份
 * ============================================================
 */

const myData = {
  type: 'FeatureCollection',
  metadata: {
    author: '钟健武',
    title: '我的GIS人生地图',
    description: '记录从求学到成长的重要地点，用空间数据讲述个人故事',
    created: '2025-06-01',
    totalPlaces: 17
  },
  features: [
    // ================================================================
    // 🎓 教育经历 (education)
    // ================================================================
    {
      type: 'Feature',
      properties: {
        id: 1,
        name: '家乡小学',
        category: 'education',
        categoryName: '教育经历',
        date: '2008-09',
        endDate: '2014-06',
        description: '六年小学时光，在这里学会了拼音、算术和第一次用电脑看地图。'
          + '那时最喜欢翻地理课本后面的中国地图，也许正是这些彩色的版图在我心里埋下了GIS的种子。',
        icon: '🏫',
        emoji: '📚',
        importance: 75,
        city: '家乡',
        province: '广东省'
      },
      geometry: { type: 'Point', coordinates: [113.2500, 23.1300] }
    },
    {
      type: 'Feature',
      properties: {
        id: 2,
        name: '县第一中学',
        category: 'education',
        categoryName: '教育经历',
        date: '2014-09',
        endDate: '2020-06',
        description: '初中+高中六年，地理老师用Google Earth给我们看卫星影像的那一刻，'
          + '我第一次感受到"从太空看地球"的震撼。高考填报志愿时，我毫不犹豫地选择了地理信息科学专业。',
        icon: '🎒',
        emoji: '✏️',
        importance: 85,
        city: '家乡',
        province: '广东省'
      },
      geometry: { type: 'Point', coordinates: [113.3000, 23.1500] }
    },
    {
      type: 'Feature',
      properties: {
        id: 3,
        name: '大学校园',
        category: 'education',
        categoryName: '教育经历',
        date: '2021-09',
        endDate: '2025-06',
        description: '地理信息科学专业。在这里系统学习了GIS原理、遥感、空间分析、WebGIS开发等技术。'
          + '从ArcMap到QGIS，从Python到JavaScript，从二维到三维——这里是专业能力的锻造之地。',
        icon: '🎓',
        emoji: '💻',
        importance: 100,
        city: '大学城',
        province: '湖北省'
      },
      geometry: { type: 'Point', coordinates: [114.3600, 30.5400] }
    },
    {
      type: 'Feature',
      properties: {
        id: 4,
        name: '学校GIS实验室',
        category: 'education',
        categoryName: '教育经历',
        date: '2023-03',
        description: '大二开始在实验室参与实际项目：校园导航系统、土地利用分类、城市热岛效应分析。'
          + '第一次用代码让地图"活"起来的感觉无与伦比——一个click事件就能弹出信息窗口，'
          + '这种"创造交互式地图"的体验让我坚定了做GIS开发的方向。',
        icon: '🔬',
        emoji: '🧪',
        importance: 90,
        city: '大学城',
        province: '湖北省'
      },
      geometry: { type: 'Point', coordinates: [114.3580, 30.5420] }
    },

    // ================================================================
    // 🏠 日常生活 (life)
    // ================================================================
    {
      type: 'Feature',
      properties: {
        id: 5,
        name: '老家宅院',
        category: 'life',
        categoryName: '日常生活',
        date: '2002-06-15',
        description: '出生和长大的地方。院子里的龙眼树每年夏天结满果实，'
          + '奶奶总说"这棵树比你还大三岁"。这里是人生坐标的原点。',
        icon: '🏠',
        emoji: '🌳',
        importance: 100,
        memory: '每年暑假在院子里数星星，第一次对"天空"产生好奇',
        city: '家乡',
        province: '广东省'
      },
      geometry: { type: 'Point', coordinates: [113.2200, 23.1100] }
    },
    {
      type: 'Feature',
      properties: {
        id: 6,
        name: '大学宿舍',
        category: 'life',
        categoryName: '日常生活',
        date: '2021-09',
        description: '四人间，上床下桌。墙上贴满了地图——世界地图、中国地形图、地铁线路图。'
          + '室友说我的床位"像个作战指挥室"。无数个深夜在这里写代码、画地图、赶DDL。',
        icon: '🛏️',
        emoji: '🌙',
        importance: 85,
        city: '大学城',
        province: '湖北省'
      },
      geometry: { type: 'Point', coordinates: [114.3570, 30.5380] }
    },
    {
      type: 'Feature',
      properties: {
        id: 7,
        name: '常去的图书馆',
        category: 'life',
        categoryName: '日常生活',
        date: '2021-10',
        description: '每个周末的固定去处。GIS专业书架在四楼东侧，靠窗的位置可以看到整个校园。'
          + '在这里读完了《地理信息系统导论》、《WebGIS原理与实践》和无数篇论文。',
        icon: '📖',
        emoji: '📚',
        importance: 80,
        city: '大学城',
        province: '湖北省'
      },
      geometry: { type: 'Point', coordinates: [114.3620, 30.5410] }
    },

    // ================================================================
    // ✈️ 旅行足迹 (travel)
    // ================================================================
    {
      type: 'Feature',
      properties: {
        id: 8,
        name: '广州塔',
        category: 'travel',
        categoryName: '旅行足迹',
        date: '2019-08-15',
        description: '高三暑假第一次独自旅行。登上600米高的广州塔观光层，'
          + '俯瞰整个珠江新城——那一刻突然理解了"尺度"对于空间认知的意义：'
          + '在地面上感受到的拥挤，从高处看却是井然有序的城市肌理。',
        icon: '🗼',
        emoji: '🏙️',
        importance: 88,
        memory: '在塔顶用手机地图比对每一栋建筑，第一次用"空间视角"看城市',
        city: '广州',
        province: '广东省'
      },
      geometry: { type: 'Point', coordinates: [113.3245, 23.1080] }
    },
    {
      type: 'Feature',
      properties: {
        id: 9,
        name: '北京故宫',
        category: 'travel',
        categoryName: '旅行足迹',
        date: '2022-07-20',
        description: '大二暑假的北京之旅。故宫的中轴线布局堪称中国传统空间规划的巅峰——'
          + '从永定门到钟鼓楼，7.8公里的轴线体现了"居中不偏"的礼制思想。'
          + '作为一名GIS学生，我边走边用GPS记录了整条中轴线的轨迹。',
        icon: '🏯',
        emoji: '👑',
        importance: 92,
        memory: '用手机GPS沿着中轴线走了7.8公里，回学校后做了一张个人版"北京中轴线地图"',
        city: '北京',
        province: '北京市'
      },
      geometry: { type: 'Point', coordinates: [116.3970, 39.9170] }
    },
    {
      type: 'Feature',
      properties: {
        id: 10,
        name: '上海外滩',
        category: 'travel',
        categoryName: '旅行足迹',
        date: '2023-05-01',
        description: '五一假期和同学一起游上海。站在外滩看陆家嘴的天际线——东方明珠、上海中心、'
          + '环球金融中心——这些建筑的空间分布本身就是一堂生动的"城市地理学"课。'
          + '晚上用Leaflet做了一个"上海一日"的地图笔记。',
        icon: '🌃',
        emoji: '🚢',
        importance: 86,
        memory: '夜晚的外滩灯光璀璨，第一次感受到GIS可以和旅行笔记完美结合',
        city: '上海',
        province: '上海市'
      },
      geometry: { type: 'Point', coordinates: [121.4905, 31.2397] }
    },
    {
      type: 'Feature',
      properties: {
        id: 11,
        name: '西安兵马俑',
        category: 'travel',
        categoryName: '旅行足迹',
        date: '2023-10-02',
        description: '国庆假期西安之旅。兵马俑的排列方式和空间布局令人叹为观止——'
          + '2000多年前的秦人已经在实践"空间秩序"的理念。在博物馆看到考古人员用GIS技术'
          + '对发掘现场进行数字化记录，更加坚定了专业选择。',
        icon: '🏛️',
        emoji: '🗿',
        importance: 83,
        city: '西安',
        province: '陕西省'
      },
      geometry: { type: 'Point', coordinates: [109.2785, 34.3848] }
    },
    {
      type: 'Feature',
      properties: {
        id: 12,
        name: '成都大熊猫基地',
        category: 'travel',
        categoryName: '旅行足迹',
        date: '2024-04-05',
        description: '清明假期成都之旅。除了看熊猫，还特地去看了都江堰——这座2000多年前的水利工程'
          + '完美诠释了古人"因势利导、顺应自然"的空间智慧，比任何GIS教科书上的案例都更生动。',
        icon: '🐼',
        emoji: '🎋',
        importance: 80,
        memory: '看了熊猫又看了都江堰，古人治水的空间智慧令人震撼',
        city: '成都',
        province: '四川省'
      },
      geometry: { type: 'Point', coordinates: [104.1030, 30.7330] }
    },

    // ================================================================
    // 🍜 美食打卡 (food)
    // ================================================================
    {
      type: 'Feature',
      properties: {
        id: 13,
        name: '学校后街烧烤摊',
        category: 'food',
        categoryName: '美食打卡',
        date: '2022-03',
        description: '大学城每个学生都懂的"深夜食堂"。老板是一对东北夫妇，烤串配冰啤酒是赶完DDL后的'
          + '最佳犒赏。这里的"空间可达性"极高——步行5分钟，价格亲民，24:00前都在营业。',
        icon: '🍢',
        emoji: '🍺',
        importance: 72,
        city: '大学城',
        province: '湖北省'
      },
      geometry: { type: 'Point', coordinates: [114.3550, 30.5360] }
    },
    {
      type: 'Feature',
      properties: {
        id: 14,
        name: '家乡早茶店',
        category: 'food',
        categoryName: '美食打卡',
        date: '2015-01',
        description: '从小吃到大的老字号。虾饺、烧卖、凤爪、肠粉——广东早茶的"四大天王"。'
          + '每次放假回家第一件事就是来这里喝早茶。在GIS术语里，这里是我的"高频访问POI"。',
        icon: '🥟',
        emoji: '🍵',
        importance: 78,
        memory: '虾饺的皮薄到能看到里面的虾仁，蘸一点红醋，是回家的味道',
        city: '家乡',
        province: '广东省'
      },
      geometry: { type: 'Point', coordinates: [113.2350, 23.1200] }
    },
    {
      type: 'Feature',
      properties: {
        id: 15,
        name: '武汉户部巷',
        category: 'food',
        categoryName: '美食打卡',
        date: '2022-09',
        description: '武汉"早餐之都"的代表。热干面、三鲜豆皮、糊汤粉——'
          + '每一样都是碳水炸弹但每一样都让人停不下来。周末经常和室友骑共享单车来"过早"。',
        icon: '🍜',
        emoji: '🥢',
        importance: 76,
        city: '武汉',
        province: '湖北省'
      },
      geometry: { type: 'Point', coordinates: [114.2985, 30.5486] }
    },

    // ================================================================
    // ❤️ 特别记忆 (memory)
    // ================================================================
    {
      type: 'Feature',
      properties: {
        id: 16,
        name: '第一次参加GIS竞赛',
        category: 'memory',
        categoryName: '特别记忆',
        date: '2024-06-10',
        description: '和两个队友奋战两个月，用WebGIS技术做了一个"城市内涝风险预警系统"。'
          + '虽然只拿了二等奖，但在答辩时评委说"你们的空间分析思路很清晰"——'
          + '那一刻觉得所有的熬夜都值得。这是专业能力第一次得到外部认可。',
        icon: '🏆',
        emoji: '🥈',
        importance: 95,
        memory: '"你们的空间分析思路很清晰"——评委的这句话我记到现在',
        city: '大学城',
        province: '湖北省'
      },
      geometry: { type: 'Point', coordinates: [114.3630, 30.5440] }
    },
    {
      type: 'Feature',
      properties: {
        id: 17,
        name: '毕业设计答辩教室',
        category: 'memory',
        categoryName: '特别记忆',
        date: '2025-05-20',
        description: '毕设题目是"基于WebGIS的个人空间记忆可视化平台"——没错，'
          + '就是你现在看到的这个作品集。站在讲台上展示自己四年所学凝结成的作品，'
          + '当老师说出"这就是我想看到的GIS工程实践"时，眼眶有点热。',
        icon: '🎯',
        emoji: '🎖️',
        importance: 100,
        memory: '"这就是我想看到的GIS工程实践"——老师的话是最好的毕业礼物',
        city: '大学城',
        province: '湖北省'
      },
      geometry: { type: 'Point', coordinates: [114.3650, 30.5390] }
    }
  ]
};

/**
 * 分类配置
 * color: 分类主色
 * icon: 分类图标
 * name: 中文名
 */
const categoryConfig = {
  all:       { name: '全部地点', color: '#4f6ef7', icon: '📍', bg: '#eef2ff' },
  education: { name: '教育经历', color: '#3b82f6', icon: '🎓', bg: '#eff6ff' },
  life:      { name: '日常生活', color: '#ef4444', icon: '🏠', bg: '#fef2f2' },
  travel:    { name: '旅行足迹', color: '#10b981', icon: '✈️', bg: '#ecfdf5' },
  food:      { name: '美食打卡', color: '#f59e0b', icon: '🍜', bg: '#fffbeb' },
  memory:    { name: '特别记忆', color: '#8b5cf6', icon: '❤️', bg: '#f5f3ff' }
};

/**
 * 模式配置
 */
const modeConfig = {
  explore:  { name: '探索模式', icon: '🔍', desc: '自由浏览所有地点' },
  timeline: { name: '时光模式', icon: '⏱️', desc: '按时间顺序查看轨迹' },
  thematic: { name: '专题模式', icon: '📊', desc: '加载行政区GDP专题图' },
  editor:   { name: '编辑模式', icon: '✏️', desc: '添加/修改/删除标注点' }
};

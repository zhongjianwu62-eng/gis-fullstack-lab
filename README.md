# 地理空间智能 — 实验项目

GIS 全栈开发环境搭建与 AI 辅助编程实践。

## 项目结构

```
地理空间智能1/
├── gis-vue-app/                  # Vue 3 + Leaflet 地图前端
│   ├── src/
│   │   ├── components/
│   │   │   └── LeafletMap.vue    # AI 生成的 Leaflet 地图组件
│   │   ├── App.vue               # 主应用组件
│   │   ├── main.ts               # Vue 入口
│   │   ├── style.css             # 全局样式
│   │   └── env.d.ts              # TypeScript 声明
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── .venv/                        # Python 虚拟环境（不入库）
├── .gitignore
├── README.md
├── 第01讲-开发环境搭建.md
├── 第01讲-代码附录.md
├── 第02讲-代码附录.md
├── 实验报告_GIS全栈开发环境搭建.md
├── 实验步骤_AI辅助编程练习.md
└── 工具版本用途对照表.md
```

## 技术栈

| 类别 | 工具 | 版本 |
|------|------|------|
| 前端运行时 | Node.js | v24.16.0 |
| 包管理器 | pnpm | 11.5.2 |
| 前端框架 | Vue 3 | 3.5.x |
| 构建工具 | Vite | 8.0.x |
| 地图库 | Leaflet | 1.9.4 |
| 类型检查 | TypeScript | 6.0.x |
| 后端语言 | Python | 3.13.2 |
| 空间分析 | geopandas | 1.1.3 |

## 快速启动

```bash
# 前端项目
cd gis-vue-app
pnpm install
pnpm dev
# 浏览器访问 http://localhost:5173/

# Python 虚拟环境
python -m venv .venv
.venv\Scripts\activate
pip install geopandas shapely fiona pyproj
```

## 实验列表

- **实验一**：GIS 全栈开发环境搭建
- **实验二**：AI 辅助编程（Leaflet 地图组件 + Prompt 优化）
- **实验三**：Git 版本控制与 GitHub 协作

## 贡献者

- **ZHONG** — GIS 全栈开发学习者

## 仓库地址

[https://github.com/zhongjianwu62-eng/gis-fullstack-lab](https://github.com/zhongjianwu62-eng/gis-fullstack-lab)

# 地理空间智能 — GIS 全栈开发实验项目

> 🏫 地理空间智能课程 · 上机实验  
> 📐 三层全栈架构：前端展示层 + Python 数据处理层 + Java 后端服务层

---

## 📂 项目目录结构

```
地理空间智能1/
│
├── gis-vue-app/                  # 🖥️ 前端展示层 (Vue 3 + Leaflet)
│   ├── src/
│   │   ├── components/
│   │   │   └── LeafletMap.vue    # AI 生成的 Leaflet 地图组件
│   │   ├── data/
│   │   │   └── cities.ts         # 中国城市坐标数据
│   │   ├── App.vue               # 主应用组件
│   │   ├── main.ts               # Vue 入口
│   │   ├── style.css             # 全局样式
│   │   └── env.d.ts              # TypeScript 声明
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── python-data/                  # 🐍 数据处理层 (Python)
│   ├── data_processor.py         # GeoJSON 读写、坐标转换、空间运算
│   └── requirements.txt          # Python 依赖清单
│
├── java-backend/                 # ☕ 后端服务层 (Java · Spring Boot)
│   ├── pom.xml                   # Maven 构建配置
│   └── src/main/java/com/gis/
│       └── GisApplication.java   # Spring Boot 入口
│
├── check_env.bat                 # 🔧 环境自检脚本 (Windows)
├── check_env.sh                  # 🔧 环境自检脚本 (Unix / Git Bash)
├── .gitignore                    # Git 忽略规则
├── README.md                     # 项目说明（本文件）
│
├── 📝 实验文档
│   ├── 实验报告_GIS全栈开发环境搭建.md
│   ├── 实验步骤_AI辅助编程练习.md
│   ├── 实验步骤_Git版本控制与GitHub协作.md
│   ├── 工具版本用途对照表.md
│   └── 上机实验01_开发环境与AI辅助编程.docx
│
├── 📖 讲义附录
│   ├── 第01讲-开发环境搭建.md
│   ├── 第01讲-代码附录.md
│   └── 第02讲-代码附录.md
│
└── .venv/                        # Python 虚拟环境（不入库）
```

---

## 🏗️ 三层架构与 GIS 工程职责分工

| 层级 | 技术栈 | 在 GIS 工程中的角色 |
|:----:|--------|---------------------|
| **前端展示层** | Vue 3 + Leaflet + TypeScript + Vite | **地图可视化与用户交互**：渲染瓦片底图、展示空间要素（点/线/面）、处理用户操作（缩放/拖拽/点击查询）、实现标注管理、城市快跳等 GIS UI 功能 |
| **数据处理层** | Python + GeoPandas + Shapely + Fiona | **空间数据 ETL 与分析**：读取 Shapefile/GeoJSON 等矢量数据、坐标系转换（WGS84↔GCJ02↔BD09）、缓冲区分析/叠加分析、空间数据清洗与格式转换、为前后端提供预处理后的 GeoJSON |
| **后端服务层** | Java · Spring Boot + JTS | **空间数据持久化与服务发布**：通过 RESTful API 对外提供空间查询接口（属性查图/空间查图）、结合 JTS 实现空间拓扑运算、管理空间数据库（PostGIS）、负责用户认证与日志 |

### 🔄 数据流向

```
[浏览器] ←→ [前端展示层 (Vue + Leaflet)]
                 ↕ HTTP / GeoJSON
           [后端服务层 (Spring Boot)]
                 ↕ 数据读写
           [空间数据库 (PostGIS)]
                 ↕ 预处理数据
           [数据处理层 (Python)]
```

---

## 🔧 技术栈版本

| 类别 | 工具 | 版本 | 用途 |
|------|------|------|------|
| 前端运行时 | Node.js | v24.16.0 | JavaScript/TypeScript 运行时 |
| 包管理器 | pnpm | 11.5.2 | 前端依赖管理 |
| 前端框架 | Vue 3 | 3.5.x | 组件化 UI 框架 |
| 构建工具 | Vite | 8.0.x | 前端项目构建与 HMR |
| 地图库 | Leaflet | 1.9.4 | 前端地图渲染引擎 |
| 类型检查 | TypeScript | 6.0.x | 静态类型检查 |
| 后端语言 | Python | 3.13.2 | 空间数据分析脚本 |
| 空间分析 | GeoPandas | 1.1.3 | 矢量空间数据处理 |
| 后端语言 | Java | 1.8.0 | 后端服务开发 |
| 后端框架 | Spring Boot | 3.4.0 | RESTful API 框架 |
| 空间算法 | JTS | 1.19.0 | Java 空间拓扑运算库 |
| 版本控制 | Git | 2.54.0 | 代码版本管理 |

---

## 🚀 快速启动

### 环境自检（一键）

```bash
# Windows 双击或在终端运行
check_env.bat

# Unix / Git Bash
bash check_env.sh
```

### 前端项目

```bash
cd gis-vue-app
pnpm install
pnpm dev
# 浏览器访问 http://localhost:5173/
```

### Python 环境

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Unix
pip install -r python-data/requirements.txt
```

### Java 后端

```bash
cd java-backend
mvnw spring-boot:run            # 需要配置 Maven Wrapper
```

---

## 📋 实验列表

| 实验 | 内容 | 对应文档 |
|:----:|------|----------|
| **实验一** | 开发环境搭建 + 三层目录骨架 + 环境自检脚本 | [实验报告_GIS全栈开发环境搭建.md](实验报告_GIS全栈开发环境搭建.md) |
| **实验二** | AI 辅助编程（Leaflet 地图组件 + Prompt 优化） | [实验步骤_AI辅助编程练习.md](实验步骤_AI辅助编程练习.md) |
| **实验三** | Git 版本控制与 GitHub 协作 | [实验步骤_Git版本控制与GitHub协作.md](实验步骤_Git版本控制与GitHub协作.md) |

---

## 👤 贡献者

- **ZHONG** — [zhongjianwu62-eng](https://github.com/zhongjianwu62-eng)
- 仓库地址：[gis-fullstack-lab](https://github.com/zhongjianwu62-eng/gis-fullstack-lab)

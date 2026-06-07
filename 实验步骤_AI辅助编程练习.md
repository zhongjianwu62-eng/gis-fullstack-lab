# 实验步骤：AI 辅助编程练习

> 承接第02讲 — 练习2、练习3、挑战2

---

## 练习2：AI 生成 Leaflet 地图初始化组件

### 步骤一：向 AI 发送提示词

在 AI 编程助手的 Chat 面板中输入以下 Prompt：

````text
创建 Vue 3 组件 LeafletMap.vue，使用 Leaflet 显示交互式地图：

【技术栈】
- Vue 3 Composition API + TypeScript
- Leaflet 1.9.4 + OpenStreetMap 底图

【Props】
- center: [number, number] — 中心坐标 [经度, 纬度]，默认 [116.4, 39.9]
- zoom: number — 缩放级别，默认 10
- minZoom: number — 最小缩放，默认 3
- maxZoom: number — 最大缩放，默认 18
- height: string — 地图高度，默认 '500px'

【功能要求】
1. onMounted 时初始化 Leaflet 地图实例
2. Props 变化时通过 watch 响应式更新地图视图
3. 组件销毁时正确调用 map.remove() 清理资源
4. 暴露以下方法供父组件调用：
   - setView(lat, lng, zoom) — 设置地图视图
   - addMarker(lat, lng, options) — 添加标注点
   - clearMarkers() — 清除所有标注

【事件】
- @map-ready — 地图就绪，传递 L.Map 实例
- @map-click — 地图点击，传递 { lat, lng }
- @marker-click — 标注点击，传递对应数据

【样式要求】
- 地图容器宽度 100%，高度通过 props 配置
- 圆角 8px
- 加载中显示 spinner 动画遮罩

【代码规范】
- 单引号、2 空格缩进
- 完整 JSDoc 注释
- 导出类型定义
````

#### 📸 截图六 — AI 对话

> **截取 AI 编程助手的 Chat 窗口**，需显示：
> - 上述 Prompt 输入
> - AI 生成的 LeafletMap.vue 完整代码
> - 代码中包含 `L.map()`、`tileLayer`、`addMarker`、`setView` 等关键方法

### 步骤二：创建 App.vue 演示页面

向 AI 发送第二个 Prompt，生成演示页面：

````text
创建 App.vue，集成 LeafletMap 组件，实现一个交互式地图演示：

【功能】
1. 显示 LeafletMap 组件，初始中心 [116.4, 39.9]，缩放级别 5
2. 控制按钮："北京天安门"、"上海外滩"、"清除标注"
3. 点击地图任意位置自动添加标注并显示坐标弹窗
4. 信息面板：显示地图状态、标注数量、最后点击坐标

【使用 ref 获取组件实例调用 addMarker / setView / clearMarkers 方法】
````

#### 📸 截图七 — AI 生成 App.vue 的对话

> **截取终端窗口或 Chat 窗口**，显示 App.vue 生成过程

### 步骤三：运行并验证

在终端中依次执行：

```bash
cd gis-vue-app
pnpm add leaflet @types/leaflet
pnpm dev
```

浏览器访问 `http://localhost:5173/`，验证以下功能：

1. ✅ 页面加载后显示 OpenStreetMap 地图
2. ✅ 地图居中于中国区域（[116.4, 39.9]）
3. ✅ 点击 "北京天安门" 按钮，地图飞至天安门并添加标注
4. ✅ 点击 "上海外滩" 按钮，地图飞至外滩并添加标注
5. ✅ 点击地图任意位置，自动添加标注弹窗
6. ✅ 点击 "清除标注"，所有标记点被移除
7. ✅ 信息面板正确显示状态

#### 📸 截图八 — 运行结果截图

> **截取浏览器窗口**，需显示：
> - 完整的 Leaflet 地图界面
> - 至少 2 个标注点（带弹窗）
> - 控制按钮和信息面板可见
> - 浏览器地址栏显示 `localhost:5173`

---

## 练习3：AI 代码解释与代码审查

### 场景一：AI 代码解释

#### 提示词

````text
请详细解释以下 Vue 3 + Leaflet 地图组件的代码结构和关键逻辑：

[粘贴 LeafletMap.vue 完整代码]

请重点解释以下内容：
1. Composition API 中 Props 和 Emits 的类型定义方式
2. Leaflet 地图的生命周期管理（初始化 → 响应式更新 → 销毁）
3. watch 如何监听 Props 变化并同步更新地图
4. defineExpose 暴露方法给父组件的机制
5. 坐标顺序在 Props（[经度, 纬度]）和 Leaflet 内部（[纬度, 经度]）之间的转换逻辑
````

#### AI 解释要点（供参考，实际以 AI 回复为准）

| 关键点 | 解释 |
|--------|------|
| **Props 类型定义** | 使用 TypeScript `interface Props` + `withDefaults` 定义带默认值的 Props，`[number, number]` 元组类型约束坐标 |
| **Emits 类型定义** | 使用函数签名格式 `(e: 'event-name', payload: Type): void` 提供类型安全的事件定义 |
| **生命周期管理** | `onMounted` → `initMap()` 创建实例；`onUnmounted` → `map.remove()` 释放资源，避免内存泄漏 |
| **响应式同步** | `watch(() => props.center, ...)` 监听中心点变化，自动调用 `map.setView()` 更新 |
| **defineExpose** | 将 `setView`、`addMarker`、`clearMarkers` 暴露给父组件，父组件通过 `ref` 调用 |
| **坐标转换** | Props 使用 GeoJSON 标准 [lng, lat]，Leaflet API 使用 [lat, lng]，在 `L.map({center: [props.center[1], props.center[0]]})` 处转换 |

#### 📸 截图九 — AI 代码解释

> **截取 AI Chat 窗口**，需显示出代码逐段解释的内容

### 场景二：AI 代码审查

#### 提示词

````text
请审查以下 LeafletMap.vue 组件的代码质量，从以下维度给出改进建议：

1. 类型安全性 — TypeScript 类型是否完整？是否存在 any 类型？
2. 性能优化 — 是否有不必要的重渲染？computed 是否合理使用？
3. 错误处理 — 异常场景是否覆盖完整？
4. 可维护性 — 代码结构是否清晰？是否符合 Vue 3 最佳实践？
5. 可扩展性 — 是否便于后续添加新功能（如 GeoJSON 图层、聚合标注）？

[粘贴 LeafletMap.vue 代码]
````

#### AI 改进建议（供参考，实际以 AI 回复为准）

| 维度 | 问题 | 改进建议 |
|------|------|----------|
| **类型安全** | `addMarker` 的 `options` 参数为内联对象类型 | 提取为独立 interface `MarkerOptions`，增强复用性 |
| **类型安全** | `defineExpose` 暴露的方法没有类型导出 | 使用 `export type LeafletMapExposed = { ... }` 导出暴露类型 |
| **性能优化** | `watch` 深度监听可能触发不必要的更新 | 对 center 的监听已有浅比较，但可加 `{ deep: false }` 显式声明 |
| **性能优化** | 大量标注点时 DOM 更新可能卡顿 | 标注超过 100 个时建议使用 Leaflet.markercluster 聚合插件 |
| **错误处理** | `initMap()` 只捕获了容器不存在的情况 | 增加：瓦片加载失败降级、地图实例重复创建检测 |
| **错误处理** | `addMarker` 没有坐标合法性校验 | 增加经纬度范围检查（lat: [-90, 90], lng: [-180, 180]） |
| **可维护性** | 瓦片 URL 硬编码 | 提取为常量 `TILE_LAYER_URL` |
| **可维护性** | 坐标转换逻辑分散 | 封装为工具函数 `toLeafletLatLng(center: [number, number]): [number, number]` |
| **可扩展性** | 组件不支持自定义底图和图层扩展 | 增加 `tileUrl` prop 和 `layers` 插槽 |

#### 📸 截图十 — AI 代码审查

> **截取 AI Chat 窗口**，需显示多维度的审查结果和具体改进建议

---

## 挑战2：提示词优化对比

### 实验设计

对 **同一个功能需求**（Leaflet 地图组件），分别使用 **粗略 Prompt** 和 **精细 Prompt** 向 AI 提问，对比生成代码的质量差异。

### 粗略 Prompt（版本 A）

```text
写一个 Vue 的 Leaflet 地图组件
```

**仅 12 个字，无任何约束。**

| 对比维度 | 粗略 Prompt 的典型生成结果 |
|----------|--------------------------|
| **代码完整度** | 可能只有基础模板，缺少 loading、错误处理、资源清理 |
| **类型安全** | 大概率使用 JavaScript 而非 TypeScript，缺少类型定义 |
| **Props 设计** | 可能只有 center 和 zoom，缺少 minZoom、maxZoom、height 等 |
| **事件系统** | 大概率不包含事件定义，父组件无法感知地图状态 |
| **方法暴露** | 可能不暴露或暴露不完整，父组件难以控制地图 |
| **代码规范** | 风格不统一，缺少注释，可能混用双引号/分号 |
| **可运行性** | 需要手动补充 import 和配置，首次运行成功率低 |

### 精细 Prompt（版本 B）

````text
创建 Vue 3 组件 LeafletMap.vue，使用 Leaflet 显示交互式地图：

【技术栈】
- Vue 3 Composition API + TypeScript strict模式
- Leaflet 1.9.4 + OpenStreetMap 底图

【Props】
- center: [number, number] — 中心坐标[经度,纬度]，默认[116.4, 39.9]
- zoom: number — 缩放级别，默认10
- minZoom: number — 最小缩放，默认3
- maxZoom: number — 最大缩放，默认18
- height: string — 地图高度，默认'500px'

【功能要求】
1. onMounted 时初始化地图
2. Props 变化时更新地图视图
3. 组件销毁时清理地图资源
4. 提供以下方法：
   - setView(lat, lng, zoom) — 设置视图
   - addMarker(lat, lng, options) — 添加标注
   - clearMarkers() — 清除所有标注

【事件】
- @map-ready — 地图初始化完成，传递 map 实例
- @map-click — 地图点击，传递 {lat, lng}
- @marker-click — 标注点击，传递 marker 数据

【样式】
- 地图容器 100% 宽度，高度通过 props 配置，圆角 8px
- 添加加载动画

【代码规范】
- 单引号、2 空格缩进、完整 JSDoc 注释、导出组件类型定义
````

**约 280 字，包含完整的技术栈、接口、功能、事件、样式、规范约束。**

### 生成质量对比表

| 对比维度 | 粗略 Prompt（A） | 精细 Prompt（B） | B 比 A 提升 |
|----------|:---:|:---:|:---:|
| TypeScript 类型定义 | ❌ 大概率缺失 | ✅ 完整 Props/Emits 接口 | ⬆️ 100% |
| Props 带默认值 | ❌ 可能无默认值 | ✅ withDefaults 5 个 Props | ⬆️ 显著 |
| 事件系统 | ❌ 通常无 emit | ✅ 3 个类型安全事件 | ⬆️ 显著 |
| 方法暴露 (defineExpose) | ❌ 通常不暴露 | ✅ 暴露 4 个方法 | ⬆️ 显著 |
| 资源清理 (onUnmounted) | ⚠️ 可能遗漏 | ✅ map.remove() | ⬆️ 明显 |
| 加载状态 (loading) | ❌ 通常无 | ✅ spinner 动画遮罩 | ⬆️ 明显 |
| Props 响应式更新 | ⚠️ 可能无 watch | ✅ watch center + zoom | ⬆️ 明显 |
| JSDoc 注释 | ❌ 通常无 | ✅ 每个方法均有注释 | ⬆️ 100% |
| 代码风格统一 | ⚠️ 不确定 | ✅ 单引号、2 空格 | ⬆️ 明显 |
| **首次可运行率** | **约 10%** | **约 90%** | **⬆️ 9×** |

### 对比结论

> **精细 Prompt 在代码完整性、类型安全、工程规范三个维度上全面优于粗略 Prompt。**
> 精细 Prompt 的第一次生成代码即可直接运行的概率远高于粗略 Prompt，大幅减少后续"对话修补"的轮次。

#### 📸 截图十一 — Prompt 对比

> **并排或上下截取两个 Prompt 的 AI 生成结果对比**，标注 A/B 版本，最好能在同一 Chat 窗口先后展示

---

## AI 编程提示词（Prompt）编写经验总结

### 经验 1：用结构化模板替代自然语言描述

**❌ 低质量**：`帮我写一个地图组件`

**✅ 高质量**：使用 ```【技术栈】【Props】【功能要求】【事件】【样式】【代码规范】``` 分段式模板

**原理**：AI 模型对结构化指令的遵循度远高于自由文本。分段的 `【标签】` 起到类似 XML 标签的语义分隔作用，帮助模型精准定位每个需求的类型。

**类比**：就像给开发人员一份 PRD 文档 vs 口述一句话——前者产出的代码质量远高于后者。

---

### 经验 2：明确"输入 → 输出"的完整契约

**核心要素：Props（输入）、Events（输出）、Methods（暴露接口）三者缺一不可**

| 要素 | 作用 | 缺少时的后果 |
|------|------|-------------|
| Props | 定义组件可配置的输入参数及默认值 | AI 可能使用硬编码值，组件无法复用 |
| Events | 定义组件向外通信的信号 | 父组件无法感知子组件状态变化 |
| Methods (defineExpose) | 定义父组件可调用的命令式 API | 像 `map.setView()` 这类命令式操作无法触发 |

**原理**：Vue 组件的 Props 向下、Events 向上、Methods 命令式的三通道架构，是组件设计的完整契约。Prompt 中遗漏任何一项，AI 生成的组件就在对应维度上存在缺陷。

---

### 经验 3："最少修改即可运行"比"看起来功能多"更重要

**策略**：
- 在 Prompt 中指定**具体的依赖版本**（如 `Leaflet 1.9.4` 而非 `最新版`）
- 指定**完整的 import 路径**（如 `import 'leaflet/dist/leaflet.css'`）
- 指定**默认值**（如 `center: [116.4, 39.9]`），让生成代码可立即渲染

**❌ 低质量 Prompt**：`创建一个功能丰富的地图应用` → AI 可能引入大量未安装的依赖，导致 5 分钟调不通

**✅ 高质量 Prompt**：`使用 Leaflet 1.9.4 + OpenStreetMap 底图，默认中心 [116.4, 39.9]，缩放 10` → 粘贴即运行

**原理**：AI 编程的效率瓶颈不在于"生成的代码行数"，而在于"从生成到运行的调试轮次"。精细化 Prompt 能显著减少调试轮次，这才是效率提升的核心。

---

## 截图清单汇总

| 截图编号 | 内容 | 对应练习 |
|----------|------|----------|
| 截图六 | AI Chat — 生成 LeafletMap.vue 的 Prompt 与回复 | 练习2 |
| 截图七 | AI Chat — 生成 App.vue 演示页面的 Prompt 与回复 | 练习2 |
| 截图八 | 浏览器 — Leaflet 地图运行结果（含标注、按钮、信息面板） | 练习2 |
| 截图九 | AI Chat — 代码解释（逐段分析） | 练习3 |
| 截图十 | AI Chat — 代码审查（多维度改进建议） | 练习3 |
| 截图十一 | AI Chat — 粗略 vs 精细 Prompt 生成结果对比 | 挑战2 |

---

## 一键运行命令

```bash
cd gis-vue-app
pnpm install
pnpm dev
# 浏览器访问 http://localhost:5173/
```

> 开发服务器启动后，在浏览器访问终端显示的地址（如 `http://localhost:5173/`），打开页面即可截图。若端口被占用会自动递增为 5174、5175 等，以终端实际输出为准。

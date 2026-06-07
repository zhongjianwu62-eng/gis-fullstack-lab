# 实验一 GIS全栈开发环境搭建 实验报告

---

## 一、实验目的

1. 搭建 GIS 全栈开发所需的前端、后端、空间分析三大运行环境
2. 掌握 Node.js、Python、Java 三套工具链的安装与版本管理
3. 能够独立完成 Vite + Vue3 项目初始化及 Python 空间库的配置

---

## 二、实验环境

- 操作系统：Windows 11 Home
- 网络环境：国内网络（配置淘宝镜像加速）

---

## 三、实验步骤与截图指引

---

### 步骤一：安装 Node.js + pnpm 并配置淘宝镜像（前端运行环境）

#### 操作步骤

1. **确认 Node.js 版本**：打开终端，输入 `node --version`，确认已安装 Node.js（本机已有 v24.16.0，符合 v22+ 要求）

2. **安装 pnpm**：在终端中执行以下命令，通过 npm 全局安装 pnpm
   ```
   npm install -g pnpm
   ```

3. **配置淘宝镜像**：执行以下命令，将 pnpm 的注册源切换为淘宝 npm 镜像，加速国内下载
   ```
   pnpm config set registry https://registry.npmmirror.com
   ```

4. **验证安装**：依次执行以下三条命令，确认版本与镜像配置正确
   ```
   node --version
   pnpm --version
   pnpm config get registry
   ```

#### 📸 截图一

> **截取终端窗口**，需同时显示以下三行输出：
> - `v24.16.0`（Node.js 版本）
> - `11.5.2`（pnpm 版本）
> - `https://registry.npmmirror.com`（淘宝镜像地址）

---

### 步骤二：使用 Vite 初始化 Vue3 项目并启动

#### 操作步骤

1. **创建项目**：在目标目录下执行
   ```
   pnpm create vite gis-vue-app -- --template vue
   ```

2. **进入项目目录**：
   ```
   cd gis-vue-app
   ```

3. **安装依赖**：
   ```
   pnpm install
   ```

4. **启动开发服务器**：
   ```
   pnpm dev
   ```
   启动后会看到 `VITE vX.X.X ready in XXX ms` 和本地访问地址 `http://localhost:5173/`

#### 📸 截图二

> **截取终端窗口**，需显示出：
> - `VITE v8.0.16` 及 `ready in XXX ms` 字样
> - `Local: http://localhost:5173/` 地址
> - 无报错信息

---

### 步骤三：Python 虚拟环境创建与空间库安装（后端空间分析环境）

#### 操作步骤

1. **确认 Python 版本**：执行 `python --version`，确认 Python 已安装（本机 v3.13.2）

2. **创建虚拟环境**：在项目根目录下执行
   ```
   python -m venv .venv
   ```
   执行后会在当前目录生成 `.venv` 文件夹

3. **激活虚拟环境并安装依赖**：
   ```
   .venv\Scripts\activate
   pip install geopandas shapely fiona pyproj
   ```
   > Windows 下激活脚本位于 `.venv\Scripts\activate`，macOS/Linux 则为 `source .venv/bin/activate`

4. **验证空间库导入**：执行以下 Python 脚本，逐个导入并打印版本号
   ```python
   python -c "import geopandas; print('geopandas', geopandas.__version__); import shapely; print('shapely', shapely.__version__); import fiona; print('fiona', fiona.__version__); import pyproj; print('pyproj', pyproj.__version__); import pandas; print('pandas', pandas.__version__); import numpy; print('numpy', numpy.__version__)"
   ```

#### 📸 截图三

> **截取终端窗口**，需显示六个库的名称和版本号：
> - `geopandas 1.1.3`
> - `shapely 2.1.2`
> - `fiona 1.10.1`
> - `pyproj 3.7.2`
> - `pandas 3.0.3`
> - `numpy 2.4.6`

---

### 步骤四：安装 JDK 21 + Maven（Java 后端构建环境）

#### 操作步骤

1. **安装 JDK 21**：通过 Windows 包管理器 winget 一键安装 Eclipse Temurin 发行版
   ```
   winget install EclipseAdoptium.Temurin.21.JDK
   ```
   > 若系统无 winget，可前往 [Adoptium 官网](https://adoptium.net/) 手动下载 MSI 安装包

2. **安装 Maven**：
   - 从 Apache 官网下载 Maven 3.9.9 二进制包：`apache-maven-3.9.9-bin.zip`
   - 解压至 `C:\Users\<用户名>\devtools\apache-maven-3.9.9\`
   - 配置 `JAVA_HOME` 和 `MAVEN_HOME` 环境变量：
     ```
     setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
     setx MAVEN_HOME "C:\Users\ZHONG\devtools\apache-maven-3.9.9"
     ```
   - 将 `%JAVA_HOME%\bin` 和 `%MAVEN_HOME%\bin` 添加到系统 PATH 环境变量

3. **验证 JDK 21**：重启终端后执行
   ```
   java -version
   ```

4. **验证 Maven**：执行
   ```
   mvn -v
   ```

#### 📸 截图四 — Java 版本

> **截取终端窗口**，显示 `java -version` 命令输出：
> - `openjdk version "21.0.11" 2026-04-21 LTS`
> - `Temurin-21.0.11+10`

#### 📸 截图五 — Maven 版本

> **截取终端窗口**，显示 `mvn -v` 命令输出：
> - `Apache Maven 3.9.9`
> - `Java version: 21.0.11, vendor: Eclipse Adoptium`

---

### 步骤五：整理工具—版本—用途对照表

#### 操作步骤

根据以上安装结果，整理一份完整的对照表（如下表所示），放入实验报告中。

#### 📋 表1：GIS全栈开发环境工具对照表

| 类别 | 工具 | 版本 | 用途 |
|------|------|------|------|
| 前端运行时 | Node.js | v24.16.0 | JavaScript 运行时，前端构建基础 |
| 包管理器 | pnpm | 11.5.2 | 快速、节省磁盘的依赖管理工具 |
| npm 镜像 | npmmirror（淘宝） | — | 加速国内 npm 包下载 |
| 前端构建工具 | Vite | v8.0.16 | 下一代前端构建，支持 Vue3 HMR |
| 前端框架 | Vue 3 | — | GIS 可视化前端界面 |
| 后端语言 | Python | 3.13.2 | GIS 空间数据处理与分析 |
| 虚拟环境 | venv | 内置 | 隔离项目 Python 依赖 |
| 空间数据处理 | geopandas | 1.1.3 | 地理空间数据读写与操作 |
| 几何运算 | shapely | 2.1.2 | 几何对象创建与空间关系分析 |
| 矢量数据读写 | fiona | 1.10.1 | 矢量地理数据格式 IO |
| 坐标投影转换 | pyproj | 3.7.2 | 坐标系定义与投影变换 |
| 数据分析 | pandas | 3.0.3 | 表格数据操作 |
| 数值计算 | numpy | 2.4.6 | 高性能多维数组运算 |
| Java 运行时 | JDK 21 (Temurin) | 21.0.11 LTS | Java 后端服务编译与运行 |
| 构建工具 | Maven | 3.9.9 | Java 项目依赖管理与构建 |
| 类型检查 | TypeScript | Vite 附带 | 前端代码类型安全支持 |

---

## 四、实验结果

经过以上步骤，本机成功完成 GIS 全栈开发环境搭建，具体成果：

1. **前端环境**：Node.js v24 + pnpm + Vite Vue3 项目启动正常，可通过 `http://localhost:5173/` 访问
2. **空间分析环境**：Python 虚拟环境 `.venv` 中 geopandas 等 6 个核心空间库导入无报错
3. **Java 后端环境**：JDK 21 + Maven 3.9 就绪，`java -version` 和 `mvn -v` 均显示 JDK 21
4. **对照表**：完整列出 16 个核心工具的版本与用途

---

## 五、实验总结

通过本次实验，掌握了 GIS 全栈开发三套工具链的安装与配置方法：

- **Node.js 生态**：pnpm 相比 npm 在磁盘占用和安装速度上有显著优势；淘宝镜像对国内环境至关重要
- **Python 空间分析栈**：geopandas 强依赖 shapely、fiona、pyproj 等底层 C 库，使用虚拟环境可以避免系统级冲突
- **Java 构建工具链**：JDK 21 LTS 是当前企业级首选；Maven 的 JAVA_HOME 配置必须指向正确版本，否则版本冲突会导致编译失败

> **经验教训**：当系统存在多个 Java 版本时（如本机原有 JDK 8），需确保 `JAVA_HOME` 指向目标版本，否则 Maven 会使用错误的 JDK 版本。

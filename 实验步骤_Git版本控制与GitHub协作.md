# 实验步骤：Git 版本控制与 GitHub 协作

> 承接第03讲 — 练习1、挑战1

---

## 步骤一：配置 Git 身份与初始化仓库（练习1）

### 操作步骤

1. **配置 Git 全局身份**：
   ```bash
   git config --global user.name "ZHONG"
   git config --global user.email "zhong@example.com"
   ```

2. **设置默认分支名为 main**：
   ```bash
   git config --global init.defaultBranch main
   ```
   > 从 Git 2.28+ 开始支持，替代传统的 `master` 命名

3. **验证配置**：
   ```bash
   git config --global user.name
   git config --global user.email
   git config --global init.defaultBranch
   ```

4. **初始化仓库**：
   ```bash
   cd "实验项目目录"
   git init
   ```

#### 📸 截图十二 — Git 配置与仓库初始化

> **截取终端窗口**，需同时显示：
> - `git config` 三条配置的输出（user.name、user.email、init.defaultBranch）
> - `git init` 成功信息

---

## 步骤二：编写 .gitignore 与 README.md

### .gitignore 关键规则

```gitignore
# 依赖目录
node_modules/
# 构建产物
dist/
# Python 虚拟环境
.venv/
# IDE 配置
.vscode/
.idea/
# 临时文件
~$*.docx
*.tmp
```

### README.md 结构

包含：项目简介、目录结构、技术栈表格、快速启动命令、实验列表

#### 📸 截图十三 — .gitignore 与 README.md

> **截取 VS Code 编辑器窗口**，左侧文件树显示 `.gitignore` 和 `README.md` 文件位置

---

## 步骤三：完成至少 3 次规范提交

### 提交规范（Conventional Commits）

采用 `type: 简短描述` 格式，正文用中文说明改动要点。

| 提交 | 类型 | 标题 | 包含文件 |
|------|------|------|----------|
| **第1次** | `docs` | 初始化项目文档结构 | .gitignore, README.md, 讲义×3, 实验报告×2 |
| **第2次** | `feat` | 搭建 Vue 3 + Vite + TypeScript 前端项目骨架 | package.json, tsconfig.json, vite.config.ts, main.ts 等 9 个文件 |
| **第3次** | `feat` | 添加 AI 辅助生成的 Leaflet 地图组件 | LeafletMap.vue, App.vue |
| **第4次** | `chore` | 添加项目静态资源文件 | favicon.svg, icons.svg, hero.png 等 |

### 操作命令

```bash
# 第1次提交
git add .gitignore README.md "实验报告_GIS全栈开发环境搭建.md" ...
git commit -m "docs: 初始化项目文档结构

添加 .gitignore、README.md、讲义附录与实验报告模板"

# 第2次提交
git add gis-vue-app/package.json gis-vue-app/tsconfig.json ...
git commit -m "feat: 搭建 Vue 3 + Vite + TypeScript 前端项目骨架

使用 pnpm + Vite 8.x 创建项目，集成 Vue 3 Composition API"

# 第3次提交
git add gis-vue-app/src/components/LeafletMap.vue gis-vue-app/src/App.vue
git commit -m "feat: 添加 AI 辅助生成的 Leaflet 地图组件

集成 Leaflet 1.9.4 + 高德地图瓦片，支持交互式地图演示"
```

#### 📸 截图十四 — 3 次提交记录

> **截取终端窗口**，执行 `git log --oneline` 后显示至少 3 次提交记录

---

## 步骤四：创建 Feature 分支并合并

### 操作步骤

1. **创建并切换到 feature 分支**：
   ```bash
   git checkout -b feature/china-cities
   ```

2. **在 feature 分支上开发**：
   - 新建 `src/data/cities.ts`：15 个中国城市坐标数据 + 查找函数
   - 修改 `App.vue`：添加城市下拉快跳功能（jumpToCity）

3. **在 feature 分支提交**：
   ```bash
   git add src/data/cities.ts src/App.vue
   git commit -m "feat: 添加中国城市坐标数据与快跳功能"
   ```

4. **切回 main 并合并（使用 --no-ff 保留分支轨迹）**：
   ```bash
   git checkout main
   git merge feature/china-cities --no-ff -m "merge: 合并 feature/china-cities — 城市快跳功能"
   ```
   > `--no-ff` 确保即使可以快进合并，也创建一个 merge commit，保留分支历史

5. **查看分支图**：
   ```bash
   git log --graph --oneline --all --decorate
   ```

   输出应类似：
   ```
   *   dcf82ba (HEAD -> main) merge: 合并 feature/china-cities
   |\
   | * b5a1edd (feature/china-cities) feat: 添加中国城市坐标数据
   |/
   * e932e61 feat: 添加 AI 辅助生成的 Leaflet 地图组件
   * 95043fd feat: 搭建 Vue 3 + Vite 前端项目骨架
   * cf53d2a docs: 初始化项目文档结构
   ```

#### 📸 截图十五 — git log --graph 分支图

> **截取终端窗口**，执行 `git log --graph --oneline --all --decorate` 显示完整分支合并图

---

## 步骤五：GitHub 远程仓库与 PR 流程（挑战1）

### 5.1 在 GitHub 创建远程仓库

1. 打开 [github.com](https://github.com)，登录你的账号
2. 点击右上角 **+** → **New repository**
3. 填写：
   - Repository name: `gis-fullstack-lab`
   - Description: `GIS 全栈开发实验项目`
   - 选择 **Public**（或 Private）
   - **不要**勾选 "Add a README file"（本地已有）
   - **不要**勾选 ".gitignore"（本地已有）
4. 点击 **Create repository**

#### 📸 截图十六 — GitHub 创建仓库页面

> **截取浏览器 GitHub 页面**，显示仓库名称、描述、创建按钮

### 5.2 推送本地仓库到 GitHub

```bash
# 添加远程仓库（替换为你的 GitHub 用户名）
git remote add origin https://github.com/你的用户名/gis-fullstack-lab.git

# 推送所有分支到远程
git push -u origin main

# 推送 feature 分支
git push -u origin feature/china-cities
```

#### 📸 截图十七 — git push 成功

> **截取终端窗口**，显示 `git push` 成功输出（含 `branch 'main' set up to track 'origin/main'`）

### 5.3 发起 Pull Request 并自我评审

1. 在 GitHub 仓库页面，点击 **Pull requests** 标签
2. 点击 **New pull request**
3. 设置：
   - **base**: `main`
   - **compare**: `feature/china-cities`
4. 填写 PR 标题：`feat: 中国城市坐标数据与快跳功能`
5. 填写 PR 描述（包含功能说明、改动文件、测试方式）
6. 点击 **Create pull request**
7. 在 PR 页面检查 **Files changed** 标签，进行自我 Code Review
8. 确认无误后点击 **Merge pull request** → **Confirm merge**

#### 📸 截图十八 — GitHub Pull Request

> **截取浏览器 GitHub PR 页面**，需显示：
> - PR 标题和描述
> - Files changed 标签（文件差异）
> - Merge 按钮

### 5.4 拉取远程更新

```bash
git checkout main
git pull origin main
```

#### 📸 截图十九 — git pull 同步

> **截取终端窗口**，显示 `git pull` 成功同步

---

## 步骤六：验证完整 Git 历史

执行以下命令，确认完整的提交历史：

```bash
git log --graph --all --decorate --format="%h %d %s (%an, %ar)"
```

预期输出展示完整的 **Feature 分支 → PR → 合并** 全流程轨迹。

---

## 提交信息规范总结

本实验采用 **Conventional Commits** 规范：

| 前缀 | 用途 | 本实验示例 |
|------|------|-----------|
| `docs:` | 文档变更 | `docs: 初始化项目文档结构` |
| `feat:` | 新功能 | `feat: 搭建 Vue 3 + Vite 前端项目` |
| `chore:` | 杂项/资源 | `chore: 添加项目静态资源文件` |
| `merge:` | 合并提交 | `merge: 合并 feature/china-cities` |

**提交信息结构**：
```
<type>: <简短标题>

<详细说明（可选）>
- 要点 1
- 要点 2
```

---

## GitHub 操作命令速查

```bash
# 添加远程仓库
git remote add origin <url>

# 查看远程仓库
git remote -v

# 推送分支
git push -u origin main
git push -u origin feature/china-cities

# 拉取更新
git pull origin main

# 删除远程分支（PR 合并后清理）
git push origin --delete feature/china-cities

# 删除本地分支
git branch -d feature/china-cities
```

---

## 截图清单汇总

| 截图编号 | 内容 | 步骤 |
|----------|------|:--:|
| **十二** | git config 配置 + git init | 步骤一 |
| **十三** | .gitignore + README.md 编辑窗口 | 步骤二 |
| **十四** | git log --oneline 显示 3+ 次提交 | 步骤三 |
| **十五** | git log --graph --oneline --all 分支图 | 步骤四 |
| **十六** | GitHub 创建仓库页面 | 步骤五 |
| **十七** | git push 终端输出 | 步骤五 |
| **十八** | GitHub PR 页面（含 Files changed） | 步骤五 |
| **十九** | git pull 同步 | 步骤五 |

---

## ⚠️ 注意事项

1. **GitHub 用户名替换**：所有 `<url>` 中的 `你的用户名` 需替换为实际 GitHub 用户名
2. **邮箱隐私**：截图前确认 `git config user.email` 是否脱敏
3. **网络问题**：国内 push/pull 可能较慢，可配置代理或使用 SSH 方式
4. **--no-ff 合并**：实验要求保留分支轨迹，必须使用 `--no-ff` 而非默认的 fast-forward

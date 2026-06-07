# 实验步骤：Docker 容器化部署（加分项）

> 对应第03讲-练习2 + 挑战2 · 得分项 (5) · 满分 15 分（加分项）

---

## 前置条件：安装 Docker Desktop

> ⚠️ 如果尚未安装，请先完成此步骤

1. 访问 [docker.com](https://www.docker.com/products/docker-desktop/) 下载 Docker Desktop for Windows
2. 安装完成后重启电脑
3. 打开 Docker Desktop，等待右下角鲸鱼图标变为稳定状态（不再显示 "starting"）
4. 验证安装：
   ```bash
   docker --version
   docker ps
   ```

---

## 子任务 ①：拉取并运行 PostGIS 容器（+8分）

### 操作命令（在终端逐步执行）

```bash
# 1. 拉取 PostGIS 镜像（PostgreSQL 17 + PostGIS 3.5）
docker pull postgis/postgis:17-3.5

# 2. 运行 PostGIS 容器
docker run -d \
  --name gis-postgis \
  -e POSTGRES_USER=gis \
  -e POSTGRES_PASSWORD=gis2024 \
  -e POSTGRES_DB=gis_lab \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgis/postgis:17-3.5

# 3. 查看容器状态（STATUS 应为 "Up"）
docker ps

# 4. 进入容器，用 psql 连接验证
docker exec -it gis-postgis psql -U gis -d gis_lab

# ─── 在 psql 中执行以下 SQL ───
-- 启用 PostGIS 扩展
CREATE EXTENSION IF NOT EXISTS postgis;

-- 查看 PostGIS 版本
SELECT PostGIS_Version();

-- 测试空间查询：计算北京到上海的球面距离（米）
SELECT
  ST_Distance(
    ST_SetSRID(ST_MakePoint(116.4074, 39.9042), 4326)::geography,
    ST_SetSRID(ST_MakePoint(121.4737, 31.2304), 4326)::geography
  ) AS distance_meters;

-- 退出 psql
\q
```

### 预期输出

```
docker pull ...
→ Status: Downloaded newer image for postgis/postgis:17-3.5

docker run ...
→ 容器 ID（64位十六进制）

docker ps
→ CONTAINER ID | IMAGE                    | STATUS    | PORTS
  a1b2c3d4e5f6 | postgis/postgis:17-3.5  | Up 10s    | 0.0.0.0:5432->5432/tcp

psql 内：
  postgis_version → 3.5 USE_GEOS=1 USE_PROJ=1 ...
  distance_meters → 1068470.5  (约 1068 km)
```

#### 📸 截图 D — PostGIS 容器运行 + psql 连接验证

> **截取终端窗口**，需同时显示：
> - `docker ps` 输出（容器 STATUS 为 Up）
> - `psql` 执行 `SELECT PostGIS_Version();` 的输出
> - 空间距离查询结果

---

## 子任务 ②：编写 docker-compose.yml 编排服务（+7分）

### 文件：`docker-compose.yml`

```yaml
version: "3.9"

services:
  postgis:
    image: postgis/postgis:17-3.5
    container_name: gis-postgis
    restart: unless-stopped
    environment:
      POSTGRES_USER: gis
      POSTGRES_PASSWORD: gis2024
      POSTGRES_DB: gis_lab
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./docker/init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gis -d gis_lab"]
      interval: 10s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: gis-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@gis.com
      PGADMIN_DEFAULT_PASSWORD: admin2024
    ports:
      - "8080:80"
    depends_on:
      postgis:
        condition: service_healthy

volumes:
  pgdata:
  pgadmin_data:
```

### 操作命令

```bash
# 1. 先停掉之前 docker run 启动的容器（如果有）
docker stop gis-postgis && docker rm gis-postgis

# 2. 用 docker-compose 一键启动
docker-compose up -d

# 3. 查看两个容器都在运行
docker-compose ps

# 4. 查看日志（确认无报错）
docker-compose logs postgis
```

### 预期输出

```
docker-compose up -d
→ Creating network "地理空间智能1_default"
→ Creating gis-postgis ... done
→ Creating gis-pgadmin ... done

docker-compose ps
→ NAME           SERVICE    STATUS
  gis-postgis    postgis    Up (healthy)
  gis-pgadmin    pgadmin    Up 30s
```

#### 📸 截图 E — docker-compose 启动

> **截取终端窗口**，需显示：
> - `docker-compose up -d` 执行过程
> - `docker-compose ps` 显示两个服务状态

### pgAdmin 连接验证

1. 浏览器打开 `http://localhost:8080`
2. 登录：`admin@gis.com` / `admin2024`
3. 添加服务器：
   - **Name**：`GIS Lab PostGIS`
   - **Host**：`postgis`（容器名，docker-compose 内部 DNS）
   - **Port**：`5432`
   - **Username**：`gis`
   - **Password**：`gis2024`
4. 展开数据库树 → `gis_lab` → 找到 `cities` 表 → 右键 **View/Edit Data**

#### 📸 截图 F — pgAdmin 管理界面

> **截取浏览器窗口**，显示 pgAdmin 连接成功，能看到 `spatial_ref_sys` 表或 `cities` 表

---

## 子任务 ③：容器化对 GIS 开发环境一致性的价值

### 核心理念

| 传统方式 | 容器化方式 |
|----------|-----------|
| 每人手动装 PostgreSQL + PostGIS，版本各异 | `docker pull` 统一镜像版本 |
| "我电脑上能跑" → 换人跑不了 | `docker-compose up` 一键复现 |
| 环境冲突（多个项目用不同版本 PostGIS） | 容器隔离，互不影响 |
| 新人搭建环境半天起步 | 3 分钟拉镜像启动 |

### GIS 开发的特殊需求

1. **空间扩展版本一致性**：PostGIS 版本不同可能导致 `ST_*` 函数输出差异，Docker 镜像锁定版本号（如 `17-3.5`），全团队统一
2. **数据可复现**：初始化 SQL 脚本放进 `docker-entrypoint-initdb.d`，每次启动自动建表+插数据
3. **环境即代码**：`docker-compose.yml` 纳入 Git，环境变更可追溯、可审查
4. **依赖链编排**：`depends_on` + `healthcheck` 确保 PostGIS 就绪后 pgAdmin 才启动，避免连接失败
5. **跨平台**：Windows / macOS / Linux 统一运行，消除操作系统差异

### 本实验的容器化实践

```
gis-vue-app/         ← 前端（浏览器端，无需容器）
    │ HTTP API
    ▼
java-backend/        ← 后端（未来可容器化）
    │ JDBC
    ▼
🐳 postgis 容器      ← 空间数据库（已容器化）
    │
🐳 pgadmin 容器      ← 可视化管理（已容器化）
```

---

## 截图清单

| 截图 | 内容 | 对应得分 |
|:----:|------|:--:|
| **D** | `docker ps` + psql 连接验证 + PostGIS 版本 + 空间查询 | ① +8分 |
| **E** | `docker-compose up -d` + `docker-compose ps`（两个服务） | ② +7分 |
| **F** | 浏览器 pgAdmin 界面（连接成功，能看到空间表） | ② 验证 |

---

## 常用命令速查

```bash
# 启动所有服务
docker-compose up -d

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f postgis

# 进入数据库
docker exec -it gis-postgis psql -U gis -d gis_lab

# 停止所有服务
docker-compose down

# 停止并删除数据卷（重置数据库）
docker-compose down -v

# 重新构建（配置变更后）
docker-compose up -d --build
```

---

## ⚠️ 注意事项

1. **端口冲突**：确保 5432（PostgreSQL）和 8080（pgAdmin）端口未被占用
2. **Docker Desktop 启动**：Windows 下需先启动 Docker Desktop，任务栏鲸鱼图标稳定后再执行命令
3. **国内网络**：拉取镜像可能较慢，可配置镜像加速器（阿里云 / 中科大）
4. **数据持久化**：`docker-compose down` 不会删除 volume，数据保留；`down -v` 会清空数据
5. **首次启动**：pgAdmin 启动较慢（30-60秒），等待 healthy 状态后再访问

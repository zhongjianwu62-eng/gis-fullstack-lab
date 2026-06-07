-- ==============================================
--  GIS 实验 — PostGIS 空间数据库初始化
--  启用 PostGIS 扩展 + 创建示例空间表
-- ==============================================

-- 1. 启用 PostGIS 扩展
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 2. 创建空间参考系统确认
SELECT 'PostGIS 扩展已就绪' AS status;

-- 3. 示例：城市点位表
CREATE TABLE IF NOT EXISTS cities (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(64)  NOT NULL,
    province    VARCHAR(64),
    population  INTEGER,
    geom        GEOMETRY(Point, 4326)  -- WGS84 坐标
);

-- 4. 创建空间索引
CREATE INDEX IF NOT EXISTS idx_cities_geom
    ON cities USING GIST (geom);

-- 5. 插入示例数据（中国主要城市）
INSERT INTO cities (name, province, population, geom) VALUES
    ('北京',   '北京市',   21893095, ST_SetSRID(ST_MakePoint(116.4074, 39.9042), 4326)),
    ('上海',   '上海市',   24870895, ST_SetSRID(ST_MakePoint(121.4737, 31.2304), 4326)),
    ('广州',   '广东省',   18676605, ST_SetSRID(ST_MakePoint(113.2644, 23.1291), 4326)),
    ('深圳',   '广东省',   17560061, ST_SetSRID(ST_MakePoint(114.0579, 22.5431), 4326)),
    ('武汉',   '湖北省',   12326518, ST_SetSRID(ST_MakePoint(114.3054, 30.5931), 4326)),
    ('成都',   '四川省',   20937757, ST_SetSRID(ST_MakePoint(104.0657, 30.6598), 4326)),
    ('西安',   '陕西省',   12952907, ST_SetSRID(ST_MakePoint(108.9402, 34.3416), 4326)),
    ('南京',   '江苏省',    9314685, ST_SetSRID(ST_MakePoint(118.7969, 32.0603), 4326)),
    ('杭州',   '浙江省',   11936010, ST_SetSRID(ST_MakePoint(120.1551, 30.2741), 4326)),
    ('重庆',   '重庆市',   32054159, ST_SetSRID(ST_MakePoint(106.5516, 29.5630), 4326))
ON CONFLICT DO NOTHING;

-- 6. 验证
SELECT name, province, ST_AsText(geom) AS wkt FROM cities;

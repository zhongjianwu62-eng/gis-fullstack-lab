"""
GIS 数据处理层 —— Python 空间数据分析模块
职责：空间数据读取、坐标转换、几何运算、GeoJSON 序列化
"""
import json
from pathlib import Path


def load_geojson(filepath: str) -> dict:
    """加载 GeoJSON 文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_geojson(data: dict, filepath: str) -> None:
    """保存为 GeoJSON 文件"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def bbox_to_geojson(west: float, south: float, east: float, north: float) -> dict:
    """将边界框转换为 GeoJSON Polygon"""
    return {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [west, south],
                    [east, south],
                    [east, north],
                    [west, north],
                    [west, south]
                ]]
            },
            "properties": {"name": "bounding-box"}
        }]
    }


if __name__ == "__main__":
    print("GIS 数据处理层 (Python) 已就绪")
    print(f"工作目录: {Path(__file__).parent}")

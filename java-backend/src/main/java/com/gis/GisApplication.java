package com.gis;

/**
 * GIS 后端服务 —— Spring Boot 入口
 * 职责：空间数据 API、地图服务接口、GeoJSON 响应序列化
 */
public class GisApplication {

    public static void main(String[] args) {
        System.out.println("GIS 后端服务层 (Java) 已就绪");
        System.out.println("框架: Spring Boot 3.4 + JTS 空间拓扑");
        System.out.println("职责: RESTful API / 空间查询 / 数据持久化");
    }
}

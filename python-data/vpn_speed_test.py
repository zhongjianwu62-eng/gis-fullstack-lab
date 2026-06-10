"""
VPN / 网络速度诊断工具
测试各目标服务器的下载速度，诊断瓶颈所在
"""
import time
import sys
import urllib.request
import urllib.error
import ssl
import socket
import io
from concurrent.futures import ThreadPoolExecutor, as_completed

# 强制 UTF-8 输出，解决 Windows GBK 编码问题
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ── 测试目标配置 ──
# 每个目标：(标签, URL, 预期用途)
TARGETS = [
    # ── 微软 CDN（WSL 更新来源）──
    (
        "微软 WSL CDN",
        "https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi",
        "WSL 内核更新 (约 17MB)",
    ),
    (
        "微软官网",
        "https://www.microsoft.com/favicon.ico",
        "微软主页连通性",
    ),
    # ── Docker 相关 ──
    (
        "Docker Hub",
        "https://hub.docker.com/favicon.ico",
        "Docker 镜像仓库",
    ),
    (
        "GitHub",
        "https://github.com/favicon.ico",
        "GitHub 代码托管",
    ),
    # ── 国内常用站点（对照组）──
    (
        "百度",
        "https://www.baidu.com/favicon.ico",
        "国内 CDN 参考速度",
    ),
    (
        "阿里云",
        "https://www.aliyun.com/favicon.ico",
        "国内云服务商",
    ),
    (
        "清华 TUNA 镜像站",
        "https://mirrors.tuna.tsinghua.edu.cn/favicon.ico",
        "高校镜像站",
    ),
    # ── 国际站点 ──
    (
        "Google",
        "https://www.google.com/favicon.ico",
        "国际网站（需 VPN）",
    ),
    (
        "Cloudflare",
        "https://speed.cloudflare.com/__down?bytes=1048576",
        "Cloudflare 测速 (1MB)",
    ),
]

# ── DNS 解析测试 ──
DNS_TARGETS = [
    ("wslstorestorage.blob.core.windows.net", "WSL CDN"),
    ("hub.docker.com", "Docker Hub"),
    ("registry-1.docker.io", "Docker Registry"),
    ("github.com", "GitHub"),
    ("www.baidu.com", "百度"),
    ("www.google.com", "Google"),
]


def resolve_dns(hostname: str) -> tuple[str, str, float]:
    """解析 DNS，返回 (主机名, IP, 耗时)"""
    start = time.perf_counter()
    try:
        ip = socket.getaddrinfo(hostname, 443, socket.AF_INET, socket.SOCK_STREAM)[0][4][0]
        elapsed = (time.perf_counter() - start) * 1000
        return (hostname, ip, elapsed)
    except socket.gaierror as e:
        elapsed = (time.perf_counter() - start) * 1000
        return (hostname, f"解析失败: {e}", elapsed)


def ping_test(hostname: str, port: int = 443, timeout: float = 5.0) -> tuple[str, float]:
    """TCP 连通性测试，返回 (主机名, TCP 握手耗时 ms)"""
    start = time.perf_counter()
    try:
        sock = socket.create_connection((hostname, port), timeout=timeout)
        sock.close()
        elapsed = (time.perf_counter() - start) * 1000
        return (hostname, elapsed)
    except (socket.timeout, OSError) as e:
        return (hostname, f"超时/不可达 ({e})")


def download_speed_test(url: str, timeout: float = 30.0, max_bytes: int = 5 * 1024 * 1024) -> dict:
    """测试单文件下载速度，返回详细结果"""
    ctx = ssl.create_default_context()
    result = {
        "url": url,
        "success": False,
        "speed_kbps": 0.0,
        "bytes_downloaded": 0,
        "time_elapsed": 0.0,
        "error": "",
        "first_byte_ms": 0.0,
    }

    start = time.perf_counter()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req, timeout=timeout, context=ctx)

        # TTFB（首字节时间）
        result["first_byte_ms"] = (time.perf_counter() - start) * 1000

        total = 0
        chunk_start = time.perf_counter()
        while total < max_bytes:
            chunk = resp.read(65536)  # 64KB 块
            if not chunk:
                break
            total += len(chunk)
            if time.perf_counter() - start > timeout:
                break

        elapsed = time.perf_counter() - start
        result["success"] = True
        result["bytes_downloaded"] = total
        result["time_elapsed"] = elapsed
        result["speed_kbps"] = (total / 1024) / elapsed if elapsed > 0 else 0
        resp.close()

    except urllib.error.URLError as e:
        result["error"] = str(e.reason) if hasattr(e, "reason") else str(e)
    except Exception as e:
        result["error"] = str(e)

    return result


def format_speed(kbps: float) -> str:
    """格式化速度显示"""
    if kbps < 10:
        return f"{kbps:.1f} KB/s [WARN] 极慢"
    elif kbps < 100:
        return f"{kbps:.1f} KB/s [SLOW] 慢"
    elif kbps < 500:
        return f"{kbps:.1f} KB/s [OK] 一般"
    elif kbps < 2000:
        return f"{kbps:.1f} KB/s ({kbps/1024:.1f} MB/s) [FAST] 良好"
    else:
        return f"{kbps:.1f} KB/s ({kbps/1024:.1f} MB/s) [VFAST] 优秀"


def analyze(label: str, result: dict, purpose: str) -> list[str]:
    """分析单个站点的测试结果，返回分析文本列表"""
    lines = []
    lines.append(f"\n{'─'*60}")
    lines.append(f"  [SITE] {label}")
    lines.append(f"     用途: {purpose}")
    lines.append(f"     URL : {result['url'][:80]}...")

    if result["success"]:
        ttfb = result["first_byte_ms"]
        speed = result["speed_kbps"]
        size = result["bytes_downloaded"]
        elapsed = result["time_elapsed"]

        lines.append(f"     [OK] 连接成功")
        lines.append(f"     首字节延迟 (TTFB): {ttfb:.0f} ms")
        lines.append(f"     下载量: {size / 1024:.1f} KB")
        lines.append(f"     耗时: {elapsed:.1f} 秒")
        lines.append(f"     下载速度: {format_speed(speed)}")

        # 诊断
        if ttfb > 3000:
            lines.append(f"     [WARN] 首字节延迟 >3秒，服务器响应极慢或网络拥塞")
        if speed < 50:
            lines.append(f"     [SLOW] 速度 <50 KB/s，无法正常使用（下载 WSL 更新需 6 分钟以上）")
        elif speed < 200:
            lines.append(f"     [OK] 速度 <200 KB/s，勉强可用但体验差")
    else:
        lines.append(f"     [FAIL] 连接失败: {result['error']}")
        if "timed out" in result["error"].lower():
            lines.append(f"     [SLOW] 超时 → 可能被防火墙阻断或 VPN 未覆盖此流量")
        elif "getaddrinfo" in result["error"].lower() or "nodename" in result["error"].lower():
            lines.append(f"     [SLOW] DNS 解析失败 → DNS 服务器无法解析该域名")

    return lines


def main():
    print("=" * 60)
    print("   [NET] VPN / 网络速度诊断工具")
    print("   " + time.strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 60)

    # ── 第 1 步：DNS 解析测试 ──
    print("\n\n[STEP] 第 1 步：DNS 解析测试")
    print("-" * 40)
    with ThreadPoolExecutor(max_workers=8) as ex:
        futures = {ex.submit(resolve_dns, host): host for host, _ in DNS_TARGETS}
        for f in as_completed(futures):
            host, result, elapsed_ms = f.result()
            icon = "[OK]" if "失败" not in str(result) else "[FAIL]"
            print(f"  {icon} {host:45s} → {str(result):20s} ({elapsed_ms:.0f}ms)")

    # ── 第 2 步：TCP 连通性（Ping） ──
    print("\n\n[STEP] 第 2 步：TCP 连通性测试 (443 端口)")
    print("-" * 40)
    ping_hosts = [h for h, _ in DNS_TARGETS]
    with ThreadPoolExecutor(max_workers=8) as ex:
        futures = {ex.submit(ping_test, host): host for host in ping_hosts}
        for f in as_completed(futures):
            host, result = f.result()
            if isinstance(result, float):
                icon = "[OK]" if result < 1000 else "[WARN]"
                print(f"  {icon} {host:45s} → TCP 握手 {result:.0f}ms")
            else:
                print(f"  [FAIL] {host:45s} → {result}")

    # ── 第 3 步：下载速度测试 ──
    print("\n\n[STEP] 第 3 步：下载速度测试（并发）")
    print("-" * 40)

    all_analyses = []
    with ThreadPoolExecutor(max_workers=5) as ex:
        futures = {
            ex.submit(download_speed_test, url): (label, url, purpose)
            for label, url, purpose in TARGETS
        }
        for f in as_completed(futures):
            label, url, purpose = futures[f]
            try:
                result = f.result()
            except Exception as e:
                result = {
                    "url": url,
                    "success": False,
                    "error": str(e),
                    "speed_kbps": 0,
                    "bytes_downloaded": 0,
                    "time_elapsed": 0,
                    "first_byte_ms": 0,
                }
            analyses = analyze(label, result, purpose)
            all_analyses.extend(analyses)
            print("\n".join(analyses))

    # ── 第 4 步：综合诊断 ──
    print("\n\n" + "=" * 60)
    print("   [RPT] 综合诊断报告")
    print("=" * 60)

    # 重新获取结果用于诊断
    print("\n  正在生成诊断报告...\n")
    results = {}
    with ThreadPoolExecutor(max_workers=5) as ex:
        futures = {
            ex.submit(download_speed_test, url): label
            for label, url, _ in TARGETS
        }
        for f in as_completed(futures):
            label = futures[f]
            try:
                results[label] = f.result()
            except Exception:
                results[label] = {"success": False, "speed_kbps": 0, "error": "unknown"}

    domestic_fast = any(
        results.get(t, {}).get("speed_kbps", 0) > 500
        for t in ["百度", "阿里云"]
    )
    international_slow = all(
        results.get(t, {}).get("speed_kbps", 0) < 100
        for t in ["微软 WSL CDN", "Docker Hub", "GitHub", "Google"]
    )
    microsoft_speed = results.get("微软 WSL CDN", {}).get("speed_kbps", 0)
    docker_speed = results.get("Docker Hub", {}).get("speed_kbps", 0)
    tsinghua_fast = results.get("清华 TUNA 镜像站", {}).get("speed_kbps", 0) > 500

    print("   [DIAG] 分析结论：")
    print()

    if domestic_fast and international_slow:
        print("   [WARN] 典型症状：国内站点快、国际站点慢")
        print("   原因：你的网络到国际出口带宽受限，或 GFW 对某些")
        print("         境外 CDN (微软 Azure / Docker Hub) 限速。")
        print("   VPN 的加密隧道可能本身也走了拥挤的国际出口。")
        print()
        print("   [TIP] 建议：")
        print("   ① 换一个 VPN 节点（日本/新加坡通常比香港快）")
        print("   ② 使用国内镜像源替代：")
        print("      - Docker Hub → 阿里云容器镜像加速器")
        print("      - WSL 更新 → 手动下载 MSI 后用浏览器 VPN 代理")
        print("      - GitHub → 镜像站或 gitee 导入")
        print("   ③ 尝试使用 v2ray / Clash 等支持分流策略的工具")

    if microsoft_speed < 50:
        print(f"   [SLOW] 微软 CDN 速度仅 {microsoft_speed:.1f} KB/s")
        print("   → 这就是 WSL 更新一直卡住的原因！")
        print("   → 微软 Azure Blob Storage 在国内被严重限速")
        print("   → 建议：浏览器单独下载 MSI + VPN 代理，或找国内网盘分流")

    if docker_speed < 100:
        print(f"   [OK] Docker Hub 速度仅 {docker_speed:.1f} KB/s")
        print("   → 拉取 PostGIS 镜像可能非常慢")
        print("   → 建议配置阿里云 Docker 镜像加速器：")
        print("     Docker Desktop → Settings → Docker Engine →")
        print("     添加 registry-mirrors: [\"https://<your-id>.mirror.aliyuncs.com\"]")

    if tsinghua_fast:
        print("   [OK] 清华 TUNA 镜像站速度正常")
        print("   → 国内高校镜像 CDN 可用，建议尽量使用国内源")

    print()
    print("   [STEP] 速度汇总对比：")
    print(f"   {'目标':<25s} {'速度':>15s} {'状态':>10s}")
    print("   " + "-" * 52)
    for label, url, _ in TARGETS:
        r = results.get(label, {})
        speed = r.get("speed_kbps", 0)
        ok = "[OK]" if r.get("success") else "[FAIL]"
        print(f"   {label:<25s} {format_speed(speed):>15s} {ok:>10s}")

    print()
    print("=" * 60)
    print("   诊断完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()

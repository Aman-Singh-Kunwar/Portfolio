/**
 * Lightweight Prometheus-Compatible Metrics Exporter
 * Tracks HTTP requests, latencies, status codes, and Node.js process telemetry
 */

class MetricsRegistry {
  constructor() {
    this.requestsTotal = new Map();
    this.requestDurationBuckets = [10, 50, 100, 250, 500, 1000, 2500, 5000];
    this.durationHistogram = new Map();
  }

  recordRequest(method, path, status, durationMs) {
    const key = `${method}_${status}`;
    this.requestsTotal.set(key, (this.requestsTotal.get(key) || 0) + 1);

    for (const bucket of this.requestDurationBuckets) {
      if (durationMs <= bucket) {
        const bucketKey = `${method}_le_${bucket}`;
        this.durationHistogram.set(bucketKey, (this.durationHistogram.get(bucketKey) || 0) + 1);
      }
    }
  }

  toPrometheusFormat() {
    const memory = process.memoryUsage();
    const uptime = process.uptime();
    const lines = [];

    lines.push("# HELP process_uptime_seconds Total seconds the process has been active.");
    lines.push("# TYPE process_uptime_seconds gauge");
    lines.push(`process_uptime_seconds ${uptime.toFixed(2)}`);

    lines.push("# HELP process_heap_bytes Memory heap usage in bytes.");
    lines.push("# TYPE process_heap_bytes gauge");
    lines.push(`process_heap_bytes ${memory.heapUsed}`);

    lines.push("# HELP process_heap_total_bytes Total allocated memory heap in bytes.");
    lines.push("# TYPE process_heap_total_bytes gauge");
    lines.push(`process_heap_total_bytes ${memory.heapTotal}`);

    lines.push("# HELP http_requests_total Total number of HTTP requests processed.");
    lines.push("# TYPE http_requests_total counter");
    for (const [key, count] of this.requestsTotal.entries()) {
      const [method, status] = key.split("_");
      lines.push(`http_requests_total{method="${method}",status="${status}"} ${count}`);
    }

    return lines.join("\n") + "\n";
  }
}

export const metrics = new MetricsRegistry();

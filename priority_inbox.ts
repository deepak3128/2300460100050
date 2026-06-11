import { Log, configureLogger } from "./logging_middleware/src/index";
import * as dotenv from "dotenv";
dotenv.config();

const AUTH_TOKEN = process.env.AUTH_TOKEN || "";
const NOTIFICATIONS_URL = "http://4.224.186.213/evaluation-service/notifications";
const TOP_N = 10;

configureLogger(AUTH_TOKEN);

type NotificationType = "Placement" | "Result" | "Event";
interface Notification { ID: string; Type: NotificationType; Message: string; Timestamp: string; }
const WEIGHT: Record<NotificationType, number> = { Placement: 3, Result: 2, Event: 1 };
function score(n: Notification): number { return WEIGHT[n.Type] * 1e12 + new Date(n.Timestamp).getTime(); }

class MinHeap {
  private heap: Array<{ notification: Notification; score: number }> = [];
  private capacity: number;
  constructor(capacity: number) { this.capacity = capacity; }
  private parent(i: number) { return Math.floor((i - 1) / 2); }
  private left(i: number) { return 2 * i + 1; }
  private right(i: number) { return 2 * i + 2; }
  private swap(i: number, j: number) { [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]; }
  private bubbleUp(i: number) { while (i > 0) { const p = this.parent(i); if (this.heap[p].score <= this.heap[i].score) break; this.swap(p, i); i = p; } }
  private siftDown(i: number) { const n = this.heap.length; while (true) { let s = i; const l = this.left(i), r = this.right(i); if (l < n && this.heap[l].score < this.heap[s].score) s = l; if (r < n && this.heap[r].score < this.heap[s].score) s = r; if (s === i) break; this.swap(i, s); i = s; } }
  push(notification: Notification) { const sc = score(notification); if (this.heap.length < this.capacity) { this.heap.push({ notification, score: sc }); this.bubbleUp(this.heap.length - 1); } else if (sc > this.heap[0].score) { this.heap[0] = { notification, score: sc }; this.siftDown(0); } }
  getTopN(): Notification[] { return [...this.heap].sort((a, b) => b.score - a.score).map((h) => h.notification); }
}

async function main() {
  await Log("backend", "info", "service", `Starting priority inbox fetch: top=${TOP_N}`);
  const res = await fetch(NOTIFICATIONS_URL, { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const notifications: Notification[] = data.notifications || [];
  await Log("backend", "info", "service", `Fetched ${notifications.length} notifications`);
  const heap = new MinHeap(TOP_N);
  for (const n of notifications) heap.push(n);
  const top = heap.getTopN();
  console.log(`\n${"=".repeat(55)}\n  TOP ${TOP_N} PRIORITY NOTIFICATIONS\n${"=".repeat(55)}\n`);
  top.forEach((n, i) => {
    const e = n.Type === "Placement" ? "ðŸ’¼" : n.Type === "Result" ? "ðŸ…" : "ðŸ“…";
    console.log(`  #${String(i+1).padStart(2,"0")}  ${e} [${n.Type}] ${n.Message}`);
    console.log(`        Time: ${n.Timestamp}  Score: ${score(n).toFixed(0)}\n`);
  });
  await Log("backend", "info", "service", "Priority inbox output complete");
}

main().catch(async (err) => { await Log("backend", "fatal", "service", `Crashed: ${err.message}`); process.exit(1); });
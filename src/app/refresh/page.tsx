"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  RefreshCw,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface WorkflowRun {
  id: number;
  status: string;
  conclusion: string | null;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
  event: string;
}

interface RefreshStatus {
  running: boolean;
  runs: WorkflowRun[];
  error?: string;
}

type Stage = "refresh" | "discover" | "score" | "screenshot" | "";

export default function RefreshPage() {
  const [status, setStatus] = useState<RefreshStatus | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [stage, setStage] = useState<Stage>("");
  const [company, setCompany] = useState("");
  const [dryRun, setDryRun] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/refresh");
      const data = await res.json();
      setStatus(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchStatus();
    // Poll every 15s while a run is active
    pollRef.current = setInterval(fetchStatus, 15000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchStatus]);

  const startRefresh = async () => {
    setDispatching(true);
    setMessage(null);

    const body: Record<string, unknown> = {};
    if (stage) body.stage = stage;
    if (company.trim()) body.company = company.trim();
    if (dryRun) body.dryRun = true;

    try {
      const res = await fetch("/api/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message ?? "Workflow dispatched." });
        // Refresh status after a short delay for GHA to register
        setTimeout(fetchStatus, 3000);
      } else {
        setMessage({ type: "error", text: data.error ?? "Failed to dispatch." });
      }
    } catch (err) {
      setMessage({ type: "error", text: `Connection error: ${(err as Error).message}` });
    } finally {
      setDispatching(false);
    }
  };

  const statusColor = (run: WorkflowRun) => {
    if (run.status === "in_progress" || run.status === "queued") return "#f59e0b";
    if (run.conclusion === "success") return "var(--score-high, #22c55e)";
    if (run.conclusion === "failure") return "var(--score-low, #ef4444)";
    return "var(--md-sys-color-on-surface-variant, #888)";
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--md-sys-color-background)" }}
    >
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--md-sys-color-primary)" }}
          >
            Pipeline
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--md-sys-color-on-surface)", letterSpacing: "-0.02em" }}
          >
            Research Refresh
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            Refresh company data, discover new platforms, re-score, and capture screenshots via GitHub Actions.
          </p>
        </div>

        {/* Controls */}
        <div
          className="rounded-xl px-5 py-5 mb-6"
          style={{
            background: "#ffffff",
            border: "1px solid var(--md-sys-color-outline)",
            boxShadow: "var(--elevation-1)",
          }}
        >
          <div className="grid sm:grid-cols-3 gap-4 mb-5">
            <div>
              <label
                className="text-xs font-semibold block mb-1.5"
                style={{ color: "var(--md-sys-color-on-surface-variant)" }}
              >
                Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as Stage)}
                disabled={dispatching}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "var(--md-sys-color-surface-container)",
                  border: "1px solid var(--md-sys-color-outline)",
                  color: "var(--md-sys-color-on-surface)",
                }}
              >
                <option value="">All stages</option>
                <option value="refresh">1. Refresh existing</option>
                <option value="discover">2. Discover new</option>
                <option value="score">3. Re-score</option>
                <option value="screenshot">4. Screenshots</option>
              </select>
            </div>

            <div>
              <label
                className="text-xs font-semibold block mb-1.5"
                style={{ color: "var(--md-sys-color-on-surface-variant)" }}
              >
                Company (optional)
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={dispatching}
                placeholder="e.g. crewai"
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "var(--md-sys-color-surface-container)",
                  border: "1px solid var(--md-sys-color-outline)",
                  color: "var(--md-sys-color-on-surface)",
                }}
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  disabled={dispatching}
                  className="rounded"
                />
                <span className="text-sm" style={{ color: "var(--md-sys-color-on-surface)" }}>
                  Dry run
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={startRefresh}
            disabled={dispatching || status?.running}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: dispatching || status?.running ? "var(--md-sys-color-outline)" : "var(--md-sys-color-primary)",
              color: "#ffffff",
              cursor: dispatching || status?.running ? "not-allowed" : "pointer",
              boxShadow: dispatching || status?.running ? "none" : "var(--elevation-2)",
            }}
          >
            {dispatching ? (
              <>
                <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                Dispatching...
              </>
            ) : status?.running ? (
              <>
                <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                Pipeline Running...
              </>
            ) : (
              <>
                <Play style={{ width: 16, height: 16 }} />
                Run Refresh
              </>
            )}
          </button>
        </div>

        {/* Message banner */}
        {message && (
          <div
            className="rounded-xl px-5 py-4 mb-6 flex items-center gap-3"
            style={{
              background: message.type === "success" ? "var(--score-high-bg, #f0fdf4)" : "var(--score-low-bg, #fef2f2)",
              border: `1px solid ${message.type === "success" ? "var(--score-high-border, #bbf7d0)" : "var(--score-low-border, #fecaca)"}`,
            }}
          >
            {message.type === "success" ? (
              <CheckCircle2 style={{ width: 20, height: 20, color: "var(--score-high, #22c55e)" }} />
            ) : (
              <XCircle style={{ width: 20, height: 20, color: "var(--score-low, #ef4444)" }} />
            )}
            <span className="text-sm font-medium" style={{ color: "var(--md-sys-color-on-surface)" }}>
              {message.text}
            </span>
          </div>
        )}

        {/* Recent workflow runs */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "#ffffff",
            border: "1px solid var(--md-sys-color-outline)",
            boxShadow: "var(--elevation-1)",
          }}
        >
          <div
            className="px-5 py-3 flex items-center gap-2"
            style={{ borderBottom: "1px solid var(--md-sys-color-outline)" }}
          >
            <Terminal style={{ width: 14, height: 14, color: "var(--md-sys-color-on-surface-variant)" }} />
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
              Recent Runs
            </span>
            <button
              onClick={fetchStatus}
              className="ml-auto p-1 rounded hover:bg-gray-100 transition-colors"
              title="Refresh status"
            >
              <RefreshCw style={{ width: 14, height: 14, color: "var(--md-sys-color-on-surface-variant)" }} />
            </button>
          </div>

          {status?.error && !status.runs?.length && (
            <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
              {status.error}
            </div>
          )}

          {status?.runs?.length ? (
            <div className="divide-y" style={{ borderColor: "var(--md-sys-color-outline)" }}>
              {status.runs.map((run) => (
                <div key={run.id} className="px-5 py-3 flex items-center gap-4">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: statusColor(run) }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: "var(--md-sys-color-on-surface)" }}>
                      {run.status === "in_progress" ? "Running" : run.status === "queued" ? "Queued" : run.conclusion ?? run.status}
                    </div>
                    <div className="text-xs" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
                      <Clock style={{ width: 10, height: 10, display: "inline", marginRight: 4 }} />
                      {new Date(run.createdAt).toLocaleString()}
                      <span className="ml-2 opacity-60">({run.event})</span>
                    </div>
                  </div>
                  <a
                    href={run.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ color: "var(--md-sys-color-primary)" }}
                  >
                    View <ExternalLink style={{ width: 12, height: 12 }} />
                  </a>
                </div>
              ))}
            </div>
          ) : !status?.error ? (
            <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--md-sys-color-on-surface-variant)" }}>
              No recent runs found. Click &quot;Run Refresh&quot; to start.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

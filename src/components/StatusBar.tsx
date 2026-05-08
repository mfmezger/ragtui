import type { DoctorReport, SourcesReport, StatReport } from "../ragcli/schemas";
import { formatCount } from "../ui/format";

interface StatusBarProps {
  doctor: DoctorReport | null;
  stat: StatReport | null;
  sources: SourcesReport | null;
  loading: boolean;
  storeName?: string;
}

export function StatusBar({ doctor, stat, sources, loading, storeName }: StatusBarProps) {
  const ollama = doctor === null ? "unknown" : doctor.ollama_reachable ? "ok" : "offline";
  const sourceCount = sources?.total_sources ?? stat?.stats.unique_sources ?? 0;
  const chunkCount = stat?.stats.total_chunks ?? 0;
  const model = doctor?.chat_model ?? "unknown";
  const store = storeName ?? "default";

  return (
    <box borderStyle="rounded" style={{ height: 3, border: true, paddingLeft: 1, paddingRight: 1 }}>
      <text fg={doctor?.ollama_reachable === false ? "#ff6b6b" : "#9ece6a"}>
        ragtui │ store: {store} │ ollama: {ollama} │ model: {model} │ sources: {formatCount(sourceCount)} │ chunks:{" "}
        {formatCount(chunkCount)}{loading ? " │ loading…" : ""}
      </text>
    </box>
  );
}

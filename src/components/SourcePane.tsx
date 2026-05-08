import type { IndexedSource } from "../ragcli/schemas";
import type { FocusArea } from "../types";
import { formatCount, shortPath } from "../ui/format";

interface SourcePaneProps {
  sources: IndexedSource[];
  cursor: number;
  selected: ReadonlySet<string>;
  focus: FocusArea;
}

export function SourcePane({ sources, cursor, selected, focus }: SourcePaneProps) {
  const windowSize = 20;
  const start = Math.max(0, Math.min(cursor - 8, Math.max(0, sources.length - windowSize)));
  const visibleSources = sources.slice(start, start + windowSize);

  return (
    <box title="Sources" borderStyle="rounded" style={{ border: true, flexGrow: 1, flexShrink: 1, width: "36%", padding: 1, flexDirection: "column" }}>
      <text fg={focus === "sources" ? "#7aa2f7" : "#6b7280"}>
        {focus === "sources" ? "focused" : "tab to focus"} │ Space toggles │ r refresh
      </text>
      <text fg="#6b7280">{selected.size === 0 ? "No source selected: querying whole store" : `${selected.size} selected`}</text>
      {sources.length > windowSize ? <text fg="#6b7280">showing {start + 1}-{Math.min(start + windowSize, sources.length)} of {sources.length}</text> : null}
      <scrollbox focused={focus === "sources"} style={{ flexGrow: 1, marginTop: 1 }}>
        {sources.length === 0 ? (
          <text fg="#e0af68">No indexed sources. Use ragcli index first.</text>
        ) : (
          visibleSources.map((source, visibleIndex) => {
            const index = start + visibleIndex;
            const isCursor = index === cursor;
            const isSelected = selected.has(source.source_path);
            const marker = isSelected ? "[x]" : "[ ]";
            const pointer = isCursor ? "›" : " ";
            const fg = isCursor ? "#c0caf5" : isSelected ? "#9ece6a" : "#a9b1d6";
            return (
              <box key={source.source_path} style={{ flexDirection: "column", marginBottom: 1 }}>
                <text fg={fg}>
                  {pointer} {marker} {shortPath(source.source_path, 42)}
                </text>
                <text fg="#6b7280">
                  {"    "}{source.format} │ chunks {formatCount(source.chunks)} │ ~{formatCount(source.estimated_tokens)} tokens
                  {source.page_count > 0 ? ` │ ${formatCount(source.page_count)} pages` : ""}
                </text>
              </box>
            );
          })
        )}
      </scrollbox>
    </box>
  );
}

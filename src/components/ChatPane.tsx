import type { ChatMessage } from "../types";
import { firstLines, shortPath } from "../ui/format";

interface ChatPaneProps {
  messages: ChatMessage[];
  busy: boolean;
  warning: string | null;
}

export function ChatPane({ messages, busy, warning }: ChatPaneProps) {
  return (
    <box title="Chat" borderStyle="rounded" style={{ border: true, flexGrow: 1, flexShrink: 1, padding: 1, flexDirection: "column" }}>
      {warning === null ? null : <text fg="#e0af68">⚠ {warning}</text>}
      <scrollbox style={{ flexGrow: 1 }}>
        {messages.length === 0 ? (
          <box style={{ flexDirection: "column" }}>
            <text fg="#a9b1d6">Ask a question about your indexed sources.</text>
            <text fg="#6b7280">V1 uses ragcli query --json and renders the final answer when ready.</text>
          </box>
        ) : (
          messages.map((message) => <ChatBubble key={message.id} message={message} />)
        )}
        {busy ? <text fg="#7dcfff">ragcli is thinking…</text> : null}
      </scrollbox>
    </box>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const title = isUser ? "You" : message.role === "assistant" ? "Assistant" : "System";
  const fg = isUser ? "#7aa2f7" : message.role === "assistant" ? "#9ece6a" : "#e0af68";

  return (
    <box style={{ flexDirection: "column", marginBottom: 1 }}>
      <text fg={fg}>{title}</text>
      <text>{firstLines(message.content, 24)}</text>
      {message.citations === undefined || message.citations.length === 0 ? null : (
        <box style={{ flexDirection: "column", marginTop: 1 }}>
          <text fg="#bb9af7">Citations</text>
          {message.citations.slice(0, 6).map((citation, index) => (
            <text key={`${citation.source}-${citation.chunkIndex}-${index}`} fg="#6b7280">
              [{index + 1}] {shortPath(citation.source, 64)} chunk {citation.chunkIndex}
              {citation.page > 0 ? ` page ${citation.page}` : ""}
              {citation.score === null ? "" : ` score ${citation.score.toFixed(3)}`}
            </text>
          ))}
        </box>
      )}
    </box>
  );
}

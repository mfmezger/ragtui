import { useKeyboard, useRenderer } from "@opentui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RagcliClient } from "../ragcli/client";
import type { DoctorReport, IndexedSource, SourcesReport, StatReport } from "../ragcli/schemas";
import type { AppOptions, ChatMessage, FocusArea } from "../types";
import { messageId } from "../ui/format";
import { ChatPane } from "./ChatPane";
import { Composer } from "./Composer";
import { SourcePane } from "./SourcePane";
import { StatusBar } from "./StatusBar";

interface AppProps {
  options: AppOptions;
}

export function App({ options }: AppProps) {
  const renderer = useRenderer();
  const client = useMemo(
    () =>
      new RagcliClient(
        options.storeName === undefined
          ? { executable: options.ragcliPath }
          : { executable: options.ragcliPath, storeName: options.storeName },
      ),
    [options.ragcliPath, options.storeName],
  );

  const [doctor, setDoctor] = useState<DoctorReport | null>(null);
  const [stat, setStat] = useState<StatReport | null>(null);
  const [sourcesReport, setSourcesReport] = useState<SourcesReport | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedSources, setSelectedSources] = useState<ReadonlySet<string>>(() => new Set());
  const [sourceCursor, setSourceCursor] = useState(0);
  const [focus, setFocus] = useState<FocusArea>("composer");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sources = sourcesReport?.sources ?? [];

  const pushSystem = useCallback((content: string) => {
    setMessages((current) => [...current, { id: messageId("system"), role: "system", content, createdAt: Date.now() }]);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextDoctor, nextStat, nextSources] = await Promise.all([client.doctor(), client.stat(), client.sources()]);
      setDoctor(nextDoctor);
      setStat(nextStat);
      setSourcesReport(nextSources);
      setSourceCursor((cursor) => clamp(cursor, 0, Math.max(0, nextSources.sources.length - 1)));
      setSelectedSources((selected) => {
        const available = new Set(nextSources.sources.map((source) => source.source_path));
        return new Set([...selected].filter((sourcePath) => available.has(sourcePath)));
      });
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : String(refreshError);
      setError(message);
      pushSystem(message);
    } finally {
      setLoading(false);
    }
  }, [client, pushSystem]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggleCurrentSource = useCallback(() => {
    const source = sources[sourceCursor];
    if (source === undefined) {
      return;
    }
    setSelectedSources((current) => {
      const next = new Set(current);
      if (next.has(source.source_path)) {
        next.delete(source.source_path);
      } else {
        next.add(source.source_path);
      }
      return next;
    });
  }, [sourceCursor, sources]);

  const submitQuestion = useCallback(
    async (rawQuestion: string) => {
      const question = rawQuestion.trim();
      if (question === "" || busy) {
        return;
      }

      setDraft("");
      setBusy(true);
      setError(null);
      const selected = [...selectedSources];
      const sentSources = selected.slice(0, 1);
      setMessages((current) => [...current, { id: messageId("user"), role: "user", content: question, createdAt: Date.now() }]);

      try {
        const report = await client.query({ question, sourcePaths: sentSources });
        setMessages((current) => [
          ...current,
          {
            id: messageId("assistant"),
            role: "assistant",
            content: report.answer ?? "No answer was returned.",
            createdAt: Date.now(),
            citations: report.hits.map((hit) => ({
              source: hit.source,
              page: hit.page,
              chunkIndex: hit.chunk_index,
              score: hit.score ?? null,
            })),
          },
        ]);
      } catch (queryError) {
        const message = queryError instanceof Error ? queryError.message : String(queryError);
        setError(message);
        pushSystem(message);
      } finally {
        setBusy(false);
      }
    },
    [busy, client, pushSystem, selectedSources],
  );

  useKeyboard((key) => {
    if (key.name === "c" && key.ctrl) {
      renderer.destroy();
      return;
    }
    if (key.name === "escape") {
      renderer.destroy();
      return;
    }
    if (key.name === "tab") {
      setFocus((current) => (current === "sources" ? "composer" : "sources"));
      key.preventDefault();
      return;
    }
    if (focus !== "sources") {
      return;
    }
    if (key.name === "up") {
      setSourceCursor((cursor) => clamp(cursor - 1, 0, Math.max(0, sources.length - 1)));
      key.preventDefault();
      return;
    }
    if (key.name === "down") {
      setSourceCursor((cursor) => clamp(cursor + 1, 0, Math.max(0, sources.length - 1)));
      key.preventDefault();
      return;
    }
    if (key.name === "space") {
      toggleCurrentSource();
      key.preventDefault();
      return;
    }
    if (key.name === "r") {
      void refresh();
      return;
    }
    if (key.name === "c") {
      setMessages([]);
    }
  });

  const multiSourceWarning =
    selectedSources.size > 1
      ? "ragcli v0.2 only supports one --source; V1 will query the first selected source until multi-source support lands."
      : error;

  return (
    <box style={{ width: "100%", height: "100%", flexDirection: "column", backgroundColor: "#111827" }}>
      <StatusBar
        doctor={doctor}
        stat={stat}
        sources={sourcesReport}
        loading={loading || busy}
        {...(options.storeName === undefined ? {} : { storeName: options.storeName })}
      />
      <box style={{ flexGrow: 1, flexDirection: "row" }}>
        <SourcePane sources={sources} cursor={sourceCursor} selected={selectedSources} focus={focus} />
        <ChatPane messages={messages} busy={busy} warning={multiSourceWarning} />
      </box>
      <Composer value={draft} focus={focus} busy={busy} onChange={setDraft} onSubmit={submitQuestion} />
    </box>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

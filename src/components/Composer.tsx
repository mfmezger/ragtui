import type { SubmitEvent } from "@opentui/core";
import type { FocusArea } from "../types";

interface ComposerProps {
  value: string;
  focus: FocusArea;
  busy: boolean;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export function Composer({ value, focus, busy, onChange, onSubmit }: ComposerProps) {
  const handleSubmit = (submitted: string | SubmitEvent) => {
    onSubmit(typeof submitted === "string" ? submitted : value);
  };

  return (
    <box title="Ask" borderStyle="rounded" style={{ height: 4, border: true, paddingLeft: 1, paddingRight: 1 }}>
      <input
        focused={focus === "composer" && !busy}
        value={value}
        placeholder={busy ? "Waiting for ragcli…" : "Type a question and press Enter"}
        onInput={onChange}
        onSubmit={handleSubmit}
      />
    </box>
  );
}

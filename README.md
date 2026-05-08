# ragtui

OpenTUI interface for [`ragcli`](https://github.com/mfmezger/ragcli).

This is a V1 TUI that treats `ragcli` as a subprocess backend. It can:

- load health with `ragcli doctor --json`
- load store stats with `ragcli stat --json`
- load indexed sources with `ragcli sources --json`
- select sources in the TUI
- ask questions with `ragcli query ... --json`
- show final answers and citations

## Requirements

- [Bun](https://bun.sh/)
- `ragcli` on `PATH`, or pass `--ragcli <path>`
- Ollama/models configured for `ragcli`

OpenTUI is currently Bun-first, so this project is intended to run with Bun.

## Install

```bash
bun install
```

## Run

```bash
bun run src/main.tsx
```

Use a local `ragcli` checkout binary:

```bash
bun run src/main.tsx --ragcli ../ragcli/target/debug/ragcli
```

Use a named store:

```bash
bun run src/main.tsx --name work
```

## Keys

| Key | Action |
| --- | --- |
| `Tab` | switch focus between sources and composer |
| `Up` / `Down` | move source cursor when sources are focused |
| `Space` | toggle source selection when sources are focused |
| `r` | refresh doctor/stat/sources when sources are focused |
| `c` | clear chat when sources are focused |
| `Enter` | send message when composer is focused |
| `Esc` / `Ctrl+C` | exit |

## V1 limitation

`ragcli` currently supports only one `--source` filter. `ragtui` allows multi-selection in the UI, but sends only the first selected source to `ragcli` until repeated `--source` support lands.

See [`RAGCLI_TUI_REQUIREMENTS.md`](./RAGCLI_TUI_REQUIREMENTS.md) for the requested backend improvements.

## Development

```bash
bun test
bun run check
```

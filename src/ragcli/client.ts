import { z } from "zod";
import {
  DoctorReportSchema,
  QueryReportSchema,
  SourcesReportSchema,
  StatReportSchema,
  type DoctorReport,
  type QueryReport,
  type SourcesReport,
  type StatReport,
} from "./schemas";

export interface RagcliClientOptions {
  executable?: string;
  storeName?: string;
  timeoutMs?: number;
}

export interface QueryOptions {
  question: string;
  sourcePaths: string[];
  mode?: "naive" | "hybrid" | "agentic" | "local" | "global" | "mix";
}

interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

const DEFAULT_TIMEOUT_MS = 300_000;

export class RagcliError extends Error {
  readonly args: string[];
  readonly exitCode: number | null;
  readonly stderr: string;

  constructor(message: string, options: { args: string[]; exitCode?: number | null; stderr?: string }) {
    super(message);
    this.name = "RagcliError";
    this.args = options.args;
    this.exitCode = options.exitCode ?? null;
    this.stderr = options.stderr ?? "";
  }
}

export class RagcliClient {
  readonly executable: string;
  readonly storeName: string | undefined;
  readonly timeoutMs: number;

  constructor(options: RagcliClientOptions = {}) {
    this.executable = options.executable ?? "ragcli";
    this.storeName = options.storeName;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async doctor(signal?: AbortSignal): Promise<DoctorReport> {
    return this.runJson(["doctor", "--json"], DoctorReportSchema, signal);
  }

  async stat(signal?: AbortSignal): Promise<StatReport> {
    return this.runJson(["stat", "--json"], StatReportSchema, signal);
  }

  async sources(signal?: AbortSignal): Promise<SourcesReport> {
    return this.runJson(["sources", "--json"], SourcesReportSchema, signal);
  }

  async query(options: QueryOptions, signal?: AbortSignal): Promise<QueryReport> {
    const args = ["query", options.question, "--json", "--mode", options.mode ?? "hybrid"];

    // ragcli v0.2 supports one --source. ragtui keeps multi-selection state, but
    // intentionally sends only the first selected source until ragcli adds repeated
    // --source support. The UI warns when multiple sources are selected.
    const firstSource = options.sourcePaths[0];
    if (firstSource !== undefined) {
      args.push("--source", firstSource);
    }

    return this.runJson(args, QueryReportSchema, signal);
  }

  private async runJson<T>(args: string[], schema: z.ZodType<T>, signal?: AbortSignal): Promise<T> {
    const result = await this.run(args, signal);
    if (result.exitCode !== 0) {
      throw new RagcliError(commandFailureMessage(args, result), {
        args: this.buildArgs(args),
        exitCode: result.exitCode,
        stderr: result.stderr,
      });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(result.stdout);
    } catch (error) {
      throw new RagcliError(`ragcli returned invalid JSON for ${args[0] ?? "command"}: ${String(error)}`, {
        args: this.buildArgs(args),
        exitCode: result.exitCode,
        stderr: result.stderr,
      });
    }

    const validation = schema.safeParse(parsed);
    if (!validation.success) {
      throw new RagcliError(`ragcli JSON shape was unexpected: ${validation.error.message}`, {
        args: this.buildArgs(args),
        exitCode: result.exitCode,
        stderr: result.stderr,
      });
    }

    return validation.data;
  }

  private async run(args: string[], signal?: AbortSignal): Promise<CommandResult> {
    const fullArgs = this.buildArgs(args);
    const timeout = AbortSignal.timeout(this.timeoutMs);
    const combinedSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;

    let proc: { stdout: ReadableStream<Uint8Array>; stderr: ReadableStream<Uint8Array>; exited: Promise<number> };
    try {
      proc = Bun.spawn(fullArgs, {
        stdout: "pipe",
        stderr: "pipe",
        signal: combinedSignal,
      });
    } catch (error) {
      throw new RagcliError(`failed to start ragcli: ${String(error)}`, {
        args: fullArgs,
        exitCode: null,
      });
    }

    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);

    return { exitCode, stdout, stderr };
  }

  private buildArgs(args: string[]): string[] {
    return this.storeName === undefined
      ? buildRagcliArgs({ executable: this.executable, args })
      : buildRagcliArgs({ executable: this.executable, storeName: this.storeName, args });
  }
}

export function buildRagcliArgs(options: { executable: string; storeName?: string; args: string[] }): string[] {
  const command = [options.executable];
  if (options.storeName !== undefined && options.storeName.trim() !== "") {
    command.push("--name", options.storeName);
  }
  command.push(...options.args);
  return command;
}

function commandFailureMessage(args: string[], result: CommandResult): string {
  const command = args[0] ?? "command";
  const detail = result.stderr.trim() || result.stdout.trim() || `exit code ${result.exitCode}`;
  return `ragcli ${command} failed: ${detail}`;
}

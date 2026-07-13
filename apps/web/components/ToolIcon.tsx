import type { ToolDefinition } from "@/lib/tools";

export function ToolIcon({ tool, compact = false }: { tool: ToolDefinition; compact?: boolean }) {
  const Icon = tool.icon;
  return <span className={`tool-icon ${compact ? "compact" : ""} accent-${tool.accent}`} aria-hidden="true">
    <Icon />
  </span>;
}

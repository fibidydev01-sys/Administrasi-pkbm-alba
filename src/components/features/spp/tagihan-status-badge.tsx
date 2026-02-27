import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TAGIHAN_STATUS_CONFIG } from "@/constants/spp-config";
import type { TagihanStatus } from "@/types/spp";

interface TagihanStatusBadgeProps {
  status: TagihanStatus;
  className?: string;
}

export function TagihanStatusBadge({ status, className }: TagihanStatusBadgeProps) {
  const config = TAGIHAN_STATUS_CONFIG[status];
  const Icon = config.icon;

  // Map custom variants ke className manual karena Badge belum punya warning/success
  const variantClass: Record<string, string> = {
    warning: "border-yellow-200 bg-yellow-50 text-yellow-800 hover:bg-yellow-50",
    success: "border-green-200 bg-green-50 text-green-800 hover:bg-green-50",
  };

  const isCustom = config.variant === "warning" || config.variant === "success";

  if (isCustom) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
          variantClass[config.variant],
          className
        )}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  }

  return (
    <Badge
      variant={config.variant as "default" | "destructive" | "outline" | "secondary"}
      className={cn("gap-1", className)}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

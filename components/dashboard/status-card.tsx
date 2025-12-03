import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatusCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  description?: ReactNode;
  status?: "normal" | "warning" | "critical" | "active" | "inactive" | "loading";
  variant?: "default" | "destructive";
  trend?: "up" | "down" | "stable";
}

export default function StatusCard({
  title,
  value,
  icon,
  description,
  status = "normal",
  variant = "default",
  trend,
}: StatusCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "active":
        return "text-green-600 bg-green-50";
      case "inactive":
        return "text-gray-600 bg-gray-50";
      case "loading":
        return "text-gray-400 animate-pulse";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const getCardStyle = () => {
    if (variant === "destructive") {
      return status === "active" 
        ? "border-red-200 bg-red-50 hover:bg-red-100" 
        : "border-gray-200";
    }
    return "border-gray-200 hover:bg-gray-50";
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return "↗️";
      case "down":
        return "↘️";
      case "stable":
        return "→";
      default:
        return null;
    }
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", getCardStyle())}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", getStatusColor())}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {trend && (
            <span className="text-sm text-gray-500">{getTrendIcon()}</span>
          )}
        </div>
        {description && (
          <div className="mt-2">
            {typeof description === 'string' ? (
              <p className="text-xs text-gray-500">{description}</p>
            ) : (
              description
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
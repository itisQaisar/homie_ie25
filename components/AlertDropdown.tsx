import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { Alert } from "@/app/page";

interface AlertDropdownProps {
  alerts: Alert[];
  onAlertClick: (alertId: string) => void;
}

export function AlertDropdown({ alerts, onAlertClick }: AlertDropdownProps) {
  const unseenCount = alerts.filter((a) => !a.seen).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-orange-300 text-orange-600 hover:bg-orange-50 relative"
        >
          <Bell className="w-4 h-4" />
          {unseenCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unseenCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto"
      >
        {alerts.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">No alerts</div>
        ) : (
          <>
            {alerts.map((alert) => (
              <DropdownMenuItem
                key={alert.id}
                onClick={() => onAlertClick(alert.id)}
                className={`p-3 cursor-pointer ${
                  !alert.seen ? "bg-orange-50" : ""
                }`}
              >
                <div className="flex items-start gap-2 w-full">
                  {!alert.seen && (
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{alert.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

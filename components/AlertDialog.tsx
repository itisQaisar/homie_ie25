import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Bell } from "lucide-react";
import type { Alert } from "@/app/page";

interface AlertDialogProps {
  alert: Alert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlertDialog({ alert, open, onOpenChange }: AlertDialogProps) {
  if (!alert) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            Alert
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2">{alert.title}</h3>
            <p className="text-sm text-gray-600">{alert.message}</p>
          </div>
          <div className="text-xs text-gray-500">
            {new Date(alert.createdAt).toLocaleString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

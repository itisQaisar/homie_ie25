// EditHouseDialog.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { House } from "@/app/page";

interface EditHouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  house: House;
  onUpdateName: (newName: string) => void;
}

export function EditHouseDialog({
  open,
  onOpenChange,
  house,
  onUpdateName,
}: EditHouseDialogProps) {
  const [houseName, setHouseName] = useState(house.name);

  // Sync internal state when the house prop changes
  useEffect(() => {
    setHouseName(house.name);
  }, [house.name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (houseName.trim() && houseName.trim() !== house.name) {
      onUpdateName(houseName.trim());
    } else {
      onOpenChange(false); // Close if no change was made
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Edit Household</DialogTitle>
          <DialogDescription>
            Change the display name of your household.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="houseName">Household Name</Label>
            <Input
              id="houseName"
              placeholder="e.g., The Cozy Crew"
              value={houseName}
              onChange={(e) => setHouseName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!houseName.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

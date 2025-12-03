// ./EditTaskDialog.tsx (NEW FILE)
"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Member, Task } from "@/app/page"; // Assuming you have these types

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task; // The existing task data
  members: Member[];
  onUpdate: (updates: Partial<Task>) => void;
}

export function EditTaskDialog({
  open,
  onOpenChange,
  task,
  members,
  onUpdate,
}: EditTaskDialogProps) {
  // Initialize state with current task values
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo);

  // Format the Date object to YYYY-MM-DD string for input[type="date"]
  const [deadline, setDeadline] = useState(
    new Date(task.deadline).toISOString().substring(0, 10)
  );

  // When the task prop changes (shouldn't happen if dialog is managed correctly,
  // but good for robustness), update internal state.
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setAssignedTo(task.assignedTo);
    setDeadline(new Date(task.deadline).toISOString().substring(0, 10));
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim() && deadline) {
      const updates: Partial<Task> = {
        title: title.trim(),
        description: description?.trim() || "",
        assignedTo: assignedTo,
        // Convert YYYY-MM-DD string back to a Date object
        deadline: new Date(deadline),
      };

      onUpdate(updates);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Edit Task: {task.title}</DialogTitle>
          <DialogDescription>
            Make changes to the task details, assignee, or deadline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Task Name</Label>
            <Input
              id="title"
              placeholder="Clean the kitchen"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Wipe counters and mop floor."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo} required>
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
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
              disabled={!title.trim() || !deadline}
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

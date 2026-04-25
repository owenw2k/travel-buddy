"use client";

/**
 * Modal dialog for adding a new legend category.
 */

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

/** Default color for new legend categories. */
const DEFAULT_COLOR = "#16a34a";

/**
 * A button that opens a dialog for creating a new legend category.
 *
 * The dialog collects a name and color from the user and calls `addLegend`
 * on the Zustand store. State is reset on close so the form is fresh each
 * time it opens. The Add button is disabled until the name field is non-empty.
 *
 * @returns A trigger button + dialog for adding a legend category.
 */
export const AddLegendModal = (): ReactElement => {
  const { addLegend } = useMapStore();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);

  const handleSave = () => {
    if (name.trim()) {
      addLegend({ name: name.trim(), color });
      setName("");
      setColor(DEFAULT_COLOR);
      setIsOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName("");
      setColor(DEFAULT_COLOR);
    }
    setIsOpen(open);
  };

  return (
    <>
      <Button
        size="sm"
        className="w-full"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <Plus className="h-4 w-4" />
        Add category
      </Button>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add legend category</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="legend-name">Name</Label>
              <Input
                id="legend-name"
                placeholder="e.g. Camped, Roadtripped..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim()) {
                    handleSave();
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="legend-color">Color</Label>
              <input
                id="legend-color"
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                }}
                className="h-9 w-full cursor-pointer rounded-md border border-input bg-background"
                aria-label="Pick a color"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                handleOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

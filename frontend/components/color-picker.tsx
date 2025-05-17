"use client";

import type React from "react";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-2">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-2"
            style={{ backgroundColor: color }}
            aria-label="Pick a color"
          />
        </PopoverTrigger>
        <Input
          type="text"
          value={color}
          onChange={handleColorChange}
          className="w-28"
          maxLength={7}
        />
      </div>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="font-medium">Color Picker</div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
          <Input
            type="color"
            value={color}
            onChange={handleColorChange}
            className="w-full h-32 p-1 cursor-pointer"
          />
          <div className="grid grid-cols-8 gap-1">
            {[
              "#FF0000",
              "#FF7F00",
              "#FFFF00",
              "#00FF00",
              "#0000FF",
              "#4B0082",
              "#9400D3",
              "#000000",
              "#FF69B4",
              "#00FFFF",
              "#FF00FF",
              "#1E90FF",
              "#32CD32",
              "#FFD700",
              "#A52A2A",
              "#FFFFFF",
            ].map((presetColor) => (
              <Button
                key={presetColor}
                variant="outline"
                className="w-6 h-6 p-0 rounded-sm"
                style={{ backgroundColor: presetColor }}
                onClick={() => {
                  onChange(presetColor);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

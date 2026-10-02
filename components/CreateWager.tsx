"use client";

import { PopupProps } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useActionState, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { createWager } from "@/app/actions/wager";
import { toast } from "react-toastify";
import { formatAmount } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
} from "./ui/select";

const categories = [
  "football",
  "tennis",
  "politics",
  "basketball",
  "entertainment",
  "boxing",
  "gaming",
  "others",
];

export default function CreateWager({
  open,
  onOpenChange,
  onSuccess,
  availableBalance,
}: PopupProps & { availableBalance: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [state, formAction, isPending] = useActionState(createWager, null);
  const [lastProcessedMessage, setLastProcessedMessage] = useState<
    string | null
  >(null);

  useEffect(() => {
    (async () => {
      if (state?.error) {
        setIsVisible(true);
      }

      if (state?.message && state.message !== lastProcessedMessage) {
        // Mark as processed
        setLastProcessedMessage(state.message);

        // Refresh background data
        await onSuccess();

        // Close dialog box
        onOpenChange(false);

        // Notify user
        toast.success(state.message);
      }
    })();
  }, [state, onOpenChange, onSuccess, lastProcessedMessage]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-secondary-background border-2 border-black rounded-base px-5 py-8 w-11/12 md:max-w-105 max-h-[82vh] overflow-y-scroll gap-0 font-sans no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold mb-4 mt-4.5 text-center">
            Create Wager
          </DialogTitle>
        </DialogHeader>

        {/* Invalid input warning */}
        {state?.error && isVisible && (
          <div className="flex text-red-600 text-sm mb-4 bg-red-200 px-3 py-4 rounded-sm justify-between items-center transition-all">
            <span className="text-base font-semibold">{state.error}</span>
            <X
              className="h-5 w-5 cursor-pointer"
              onClick={() => setIsVisible(false)}
            />
          </div>
        )}

        <form action={formAction} className="space-y-5">
          {/* Title input */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-lg ml-0.5 font-semibold">
              Title
            </Label>
            <Input
              type="text"
              id="title"
              name="title"
              placeholder="Enter wager title"
              required
            />
          </div>

          {/* Stake input */}
          <div className="space-y-1.5">
            <Label htmlFor="stake" className="text-lg ml-0.5 font-semibold">
              Stake
            </Label>
            <Input
              type="number"
              id="stake"
              name="stake"
              placeholder="Enter stake amount"
              min={1}
              required
              step={0.01}
            />
          </div>

          {/* Available Balance */}
          <div className="rounded-base md:text-lg shadow-neo border-2 border-black p-4 flex justify-between items-center">
            <p className="font-semibold">Available Balance</p>
            <p className="font-bold font-display tracking-wider text-primary text-lg md:text-xl">
              {formatAmount(availableBalance) || "$0.00"}
            </p>
          </div>

          {/* Category select */}
          <Select name="category" required>
            <SelectTrigger className="w-full dark:text-gray-800 text-[17px]">
              <SelectValue placeholder="Select wager category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="font-bold text-sm text-gray-400 dark:text-gray-500">
                  Categories
                </SelectLabel>

                {categories.map((category, index) => (
                  <SelectItem
                    key={index}
                    value={category.toUpperCase()}
                    className="text-lg font-medium"
                  >
                    {category.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Conditions input */}
          <div className="space-y-1.5">
            <Label
              htmlFor="conditions"
              className="text-lg ml-0.5 font-semibold"
            >
              Conditions
            </Label>
            <Textarea
              id="conditions"
              name="conditions"
              placeholder="Enter wager conditions"
              required
            />
          </div>

          {/* Create Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full text-xl py-6 font-semibold"
          >
            {isPending ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

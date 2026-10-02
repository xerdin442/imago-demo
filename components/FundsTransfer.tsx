"use client";

import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useActionState, useEffect, useState } from "react";
import { processFundsTransfer } from "@/app/actions/transfer";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { PopupProps } from "@/lib/types";
import { toast } from "react-toastify";

export default function FundsTransfer({
  open,
  onOpenChange,
  onSuccess,
}: PopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [state, formAction, isPending] = useActionState(
    processFundsTransfer,
    null
  );
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
      <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-secondary-background border-2 border-black rounded-base px-5 py-8 w-11/12 md:max-w-105 gap-0 font-sans">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold mb-4 mt-3 text-center">
            Transfer
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
          {/* Username input */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-lg ml-0.5 font-semibold">
              Username
            </Label>
            <Input
              type="text"
              name="username"
              required
              placeholder="Enter recipient username"
            />
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-lg ml-0.5 font-semibold">
              Amount
            </Label>
            <Input
              type="number"
              name="amount"
              placeholder="Enter amount"
              required
              min={0}
            />
          </div>

          {/* Complete Transfer Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 text-xl py-6 font-semibold"
          >
            {isPending ? "Processing..." : "Complete Transfer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

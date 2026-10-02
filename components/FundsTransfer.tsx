"use client";

import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useActionState, useEffect, useState } from "react";
import { processFundsTransfer } from "@/app/actions/transfer";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { isApiError, PopupProps } from "@/lib/types";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

export default function FundsTransfer({ open, onOpenChange }: PopupProps) {
  const queryClient = useQueryClient();
  const [isVisible, setIsVisible] = useState(false);
  const [state, formAction, isPending] = useActionState(
    processFundsTransfer,
    null,
  );
  const [lastProcessedMessage, setLastProcessedMessage] = useState<
    string | null
  >(null);

  const errorMessage = isApiError(state) ? state.error : null;
  const successMessage = state && !isApiError(state) ? state.message : null;

  useEffect(() => {
    (async () => {
      if (errorMessage) {
        setIsVisible(true);
      }

      if (successMessage && successMessage !== lastProcessedMessage) {
        // Mark as processed
        setLastProcessedMessage(successMessage);

        // Refresh affected data
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.transactions() }),
          queryClient.invalidateQueries({ queryKey: queryKeys.profile() }),
        ]);

        // Close dialog box
        onOpenChange(false);

        // Notify user
        toast.success(successMessage);
      }
    })();
  }, [
    errorMessage,
    successMessage,
    onOpenChange,
    queryClient,
    lastProcessedMessage,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-secondary-background border-2 border-black rounded-base px-5 py-8 w-11/12 md:max-w-105 gap-0 font-sans">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold mb-4 mt-3 text-center">
            Transfer
          </DialogTitle>
        </DialogHeader>

        {/* Invalid input warning */}
        {errorMessage && isVisible && (
          <div className="flex text-red-600 text-sm mb-4 bg-red-200 px-3 py-4 rounded-sm justify-between items-center transition-all">
            <span className="text-base font-semibold">{errorMessage}</span>
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
              id="username"
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
              id="amount"
              name="amount"
              placeholder="Enter amount"
              required
              min={0}
              step={0.01}
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

"use client";

import { PopupProps, Wager } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { exploreWagers } from "@/app/actions/wager";

export default function WagerSearch({ open, onOpenChange }: PopupProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<Wager | null>(null);

  const handleSearch = async () => {
    if (!inviteCode.trim()) {
      setErrorMsg("Please enter an invite code.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSearchResult(null);

    try {
      const result = await exploreWagers(inviteCode);

      if ("error" in result) {
        setErrorMsg(result.error);
      } else if ("id" in result) {
        setSearchResult(result);
      }

      return;
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-secondary-background border-2 border-black rounded-base px-5 pt-8 pb-6 w-11/12 md:max-w-102.5 gap-0 font-sans">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold mb-5 mt-3 text-center">
            Explore Wagers
          </DialogTitle>
        </DialogHeader>

        {/* Invalid input warning */}
        {errorMsg && (
          <div className="flex text-red-600 text-sm mb-4 bg-red-200 px-3 py-4 rounded-sm justify-between items-center transition-all">
            <span className="text-base font-semibold">{errorMsg}</span>
            <X
              className="h-5 w-5 cursor-pointer"
              onClick={() => setErrorMsg(null)}
            />
          </div>
        )}

        {/* Search Bar */}
        <div className="flex items-center justify-center space-x-1.5 md:space-x-2 mt-2 mb-4">
          <Input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Enter wager invite code"
          />
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className={`text-lg py-5.75 ${
              isLoading ? "font-medium" : "font-semibold"
            }`}
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

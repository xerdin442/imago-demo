"use client";

import { PopupProps, User, Wager } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { exploreWagers, handleJoinWager } from "@/app/actions/wager";
import Image from "next/image";
import { getProfile } from "@/app/actions/profile";
import { formatAmount, formatUsername } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function WagerSearch({ open, onOpenChange }: PopupProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isJoinLoading, setIsJoinLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<Wager | null>(null);
  const [wagerCreator, setWagerCreator] = useState<User | null>(null);
  const router = useRouter();

  const handleSearch = async () => {
    if (!inviteCode.trim()) {
      setErrorMsg("Please enter an invite code.");
      return;
    }

    setIsSearchLoading(true);
    setErrorMsg(null);
    setSearchResult(null);
    setWagerCreator(null);

    try {
      const result = await exploreWagers(inviteCode);

      if ("error" in result) {
        setErrorMsg(result.error);
      } else if ("id" in result) {
        const creator = await getProfile(result.playerOne);

        setSearchResult(result);
        setWagerCreator(creator);
      }

      return;
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsSearchLoading(false);
    }
  };

  const processJoinWager = async (wagerId: number) => {
    try {
      setIsJoinLoading(true);

      const message = await handleJoinWager(wagerId);
      if (message) {
        setErrorMsg(message);
        setIsJoinLoading(false);
        return;
      }

      router.refresh();
      onOpenChange(false);

      setSearchResult(null);
      setInviteCode("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsJoinLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-secondary-background border-2 border-black rounded-base px-5 pt-8 pb-6 w-11/12 md:max-w-110 gap-0 font-sans">
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
            disabled={isSearchLoading}
            className={`text-lg py-5.75 ${
              isSearchLoading ? "font-medium" : "font-semibold"
            }`}
          >
            {isSearchLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Search Result */}
        {searchResult && wagerCreator && (
          <div className="bg-background p-4 pt-6 rounded-base shadow-neo border-2 border-black w-full mx-auto">
            {/* Header */}
            <div className="border-b border-gray-700 pb-3 mb-3">
              <div className="flex items-start justify-between md:mb-1">
                {/* Title */}
                <h3 className="md:text-lg font-semibold mr-2 text-left truncate">
                  {searchResult.title}
                </h3>

                {/* Category */}
                <span className="px-2.5 mr-1 md:px-4 py-1.5 text-xs bg-green-100 text-green-500 font-bold border-2 border-black rounded-base shadow-neo">
                  {searchResult.category}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="flex items-center justify-between mb-4 mx-0.5 md:mx-1.5">
              <div className="flex items-center space-x-1.5 min-w-0">
                {/* Creator Profile Image */}
                <Image
                  src={wagerCreator.profileImage}
                  alt="Wager Creator"
                  width={38}
                  height={38}
                  unoptimized
                  className="rounded-full shrink-0 border-2 border-black"
                />

                {/* Username */}
                <span className="font-medium text-sm md:text-[17px]">
                  {formatUsername(wagerCreator.username)}
                </span>
              </div>

              {/* Stake */}
              <span className="text-lg md:text-xl font-bold">
                {formatAmount(searchResult.amount)}
              </span>
            </div>

            {/* Join Button */}
            <Button
              onClick={() => processJoinWager(searchResult.id)}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-600 text-white text-[17px] py-4.5 font-semibold"
            >
              {isJoinLoading ? "Joining..." : "Join Wager"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

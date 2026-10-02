"use client";

import { PopupProps, Wager } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { exploreWagers, handleJoinWager } from "@/app/actions/wager";
import Image from "next/image";
import { getProfile } from "@/app/actions/profile";
import { formatAmount } from "@/lib/utils";
import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

export default function WagerSearch({ open, onOpenChange }: PopupProps) {
  const queryClient = useQueryClient();
  const [inviteCode, setInviteCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<Wager | null>(null);

  const searchMutation = useMutation({
    mutationFn: (code: string) => exploreWagers(code),
    onSuccess: (result) => {
      if ("error" in result) {
        setErrorMsg(result.error);
        setSearchResult(null);
      } else {
        setSearchResult(result);
      }
    },
    onError: () => setErrorMsg("Something went wrong. Please try again."),
  });

  const creatorQuery = useQuery({
    queryKey: queryKeys.profile(searchResult?.playerOne),
    queryFn: () => getProfile(searchResult!.playerOne),
    enabled: !!searchResult,
  });

  const joinMutation = useMutation({
    mutationFn: (wagerId: number) => handleJoinWager(wagerId),
    onSuccess: async (response) => {
      if (response.error) {
        setErrorMsg(response.error);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.wagers() });

      onOpenChange(false);
      toast.success(response.message || "Successfully joined wager!");

      setSearchResult(null);
      setInviteCode("");
    },
    onError: () => toast.error("Failed to join wager. Please try again"),
  });

  const handleSearch = () => {
    if (!inviteCode.trim()) {
      setErrorMsg("Please enter an invite code.");
      return;
    }

    setErrorMsg(null);
    setSearchResult(null);
    searchMutation.mutate(inviteCode);
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
            disabled={searchMutation.isPending}
            className={`text-lg py-5.75 ${
              searchMutation.isPending ? "font-medium" : "font-semibold"
            }`}
          >
            {searchMutation.isPending ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Search Result */}
        {searchResult && creatorQuery.data && (
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
                  src={creatorQuery.data.profileImage}
                  alt="Wager Creator"
                  width={38}
                  height={38}
                  className="rounded-full shrink-0 border-2 border-black"
                />

                {/* Username */}
                <span className="font-medium text-sm md:text-[17px]">
                  {`@${creatorQuery.data.username}`}
                </span>
              </div>

              {/* Stake */}
              <span className="text-lg md:text-xl font-bold">
                {formatAmount(searchResult.amount)}
              </span>
            </div>

            {/* Join Button */}
            <Button
              onClick={() => joinMutation.mutate(searchResult.id)}
              disabled={joinMutation.isPending}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-600 text-white text-[17px] py-4.5 font-semibold"
            >
              {joinMutation.isPending ? "Joining..." : "Join Wager"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

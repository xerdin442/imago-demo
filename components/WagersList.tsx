"use client";

import { Check, Copy } from "lucide-react";
import { cn, formatAmount, formatUsername } from "@/lib/utils";
import { Button } from "./ui/button";
import { getProfile, User } from "@/app/actions/profile";
import { handleWagerClaim, Wager } from "@/app/actions/wager";
import Image from "next/image";
import { useEffect, useState } from "react";

interface WagerListProps {
  wagers: Wager[];
  currentUserId: number;
}

interface WagerActionsProps {
  wager: Wager;
  currentUserId: number;
}

interface WagerUserProps {
  userId?: number;
  isWinner: boolean;
  fallbackName?: string;
  reverse?: boolean;
}

export default function WagerList({ wagers, currentUserId }: WagerListProps) {
  return (
    <ul className="w-full space-y-3.5 font-sans">
      {wagers.map((wager) => {
        const isP1Winner =
          wager.winner === wager.playerOne && wager.status === "SETTLED";
        const isP2Winner =
          wager.winner === wager.playerTwo && wager.status === "SETTLED";

        return (
          <li
            key={wager.id}
            className="bg-secondary-background border-2 border-black p-4 md:pt-5 rounded-base shadow-neo w-full"
          >
            {/* Header */}
            <div className="border-b border-gray-700 pb-3 mb-3">
              <div className="flex items-center justify-between">
                {/* Title */}
                <h3 className="text-[17px] md:text-xl font-semibold truncate">
                  {wager.title}
                </h3>

                {/* Category */}
                <div className="px-2.5 mr-1 md:px-4 py-1.5 text-xs bg-green-100 text-green-500 font-bold border-2 border-black rounded-base shadow-neo">
                  {wager.category}
                </div>
              </div>
            </div>

            {/* Matchup */}
            <div className="flex items-center justify-between mb-4 px-2">
              {/* Player One */}
              <WagerUser userId={wager.playerOne} isWinner={isP1Winner} />

              <span className="text-gray-500 dark:text-gray-400 font-bold italic shrink-0 mx-2">
                VS
              </span>

              {/* Player Two */}
              <WagerUser
                userId={wager.playerTwo}
                isWinner={isP2Winner}
                fallbackName="PLAYER 2"
                reverse={true}
              />
            </div>

            <div className="bg-gray-800 border-2 border-black p-3 rounded-base flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {/* Status */}
                <span className="text-xs md:text-sm font-bold uppercase text-blue-400">
                  {wager.status}
                </span>

                {/* Invite Code */}
                {wager.status === "PENDING" && (
                  <div className="flex items-center justify-center space-x-1.5 bg-blue-100 border border-black p-2 rounded-sm">
                    <code className="font-mono font-bold text-blue-700 text-xs">
                      {wager.inviteCode}
                    </code>

                    <CopyButton code={wager.inviteCode} />
                  </div>
                )}
              </div>

              {/* Stake */}
              <span className="md:text-lg font-black text-white">
                {formatAmount(wager.amount)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-5 mt-4">
              <WagerActions wager={wager} currentUserId={currentUserId} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function WagerUser({
  userId,
  isWinner,
  fallbackName = "PLAYER",
  reverse = false,
}: WagerUserProps) {
  const [user, setUser] = useState<User | null>(null);
  const defaultImage =
    "https://media.istockphoto.com/id/1393750072/vector/flat-white-icon-man-for-web-design-silhouette-flat-illustration-vector-illustration-stock.jpg?s=612x612&w=0&k=20&c=s9hO4SpyvrDIfELozPpiB_WtzQV9KhoMUP9R9gVohoU=";

  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      try {
        const data = await getProfile(userId);
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch wager user details", err);
      }
    };

    fetchUser();
  }, [userId]);

  return (
    <div
      className={cn(
        "flex items-center space-x-2 min-w-0",
        reverse && "flex-row-reverse space-x-reverse text-right"
      )}
    >
      <Image
        src={user?.profileImage || defaultImage}
        width={38}
        height={38}
        className={cn(
          "w-9.5 h-9.5 rounded-full shrink-0 border-2",
          isWinner ? "border-green-600" : "border-black"
        )}
        alt="User Profile"
      />
      <span
        className={cn(
          "text-base font-bold truncate",
          isWinner ? "text-green-600" : "text-black dark:text-white"
        )}
      >
        {user ? formatUsername(user.username) : fallbackName}
      </span>
    </div>
  );
}

function WagerActions({ wager, currentUserId }: WagerActionsProps) {
  const [wagerClaim, setWagerClaim] = useState(false);

  const processWagerAction = (action?: "accept" | "contest") => {
    try {
      setWagerClaim(true);
      handleWagerClaim(wager.id, action);
    } catch (error) {
      console.error(error);
    } finally {
      setWagerClaim(false);
    }
  };

  if (wager.status === "PENDING") {
    return (
      <>
        <Button className="bg-blue-700 dark:bg-blue-700 text-white text-[17px] py-4.5 font-semibold">
          Update
        </Button>
        <Button
          variant="destructive"
          className="text-white text-[17px] py-4.5 font-semibold dark:bg-red-700"
        >
          Delete
        </Button>
      </>
    );
  }

  if (wager.status === "ACTIVE") {
    if (!wager.winner) {
      return (
        <Button
          onClick={() => processWagerAction()}
          className="bg-green-600 dark:bg-green-600 text-white text-[17px] py-4.5 font-semibold"
        >
          {wagerClaim ? "Claiming..." : "Claim win!"}
        </Button>
      );
    }

    if (wager.winner !== currentUserId) {
      return (
        <>
          <Button
            onClick={() => processWagerAction("accept")}
            className="bg-blue-700 dark:bg-blue-700 text-white text-[17px] py-4.5 font-semibold"
          >
            {wagerClaim ? "Accepting..." : "Accept"}
          </Button>
          <Button
            onClick={() => processWagerAction("contest")}
            variant="destructive"
            className="text-[17px] py-4.5 font-semibold dark:bg-red-700"
          >
            {wagerClaim ? "Contesting..." : "Contest"}
          </Button>
        </>
      );
    }

    return (
      <Button
        disabled
        className="bg-green-600 dark:bg-green-600 text-white text-[17px] py-4.5 font-semibold"
      >
        Awaiting confirmation...
      </Button>
    );
  }

  if (wager.status === "DISPUTE") {
    return (
      <Button
        variant="destructive"
        className="text-white text-[17px] py-4.5 font-semibold dark:bg-red-700"
      >
        Go to chat
      </Button>
    );
  }

  return null;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      className="w-8 h-7 -mt-0.75 flex items-center justify-center transition-all active:scale-95"
    >
      {copied ? (
        <Check
          strokeWidth={2.5}
          className="size-5.5 animate-in zoom-in duration-200"
        />
      ) : (
        <Copy strokeWidth={2.5} className="size-4.5" />
      )}
    </Button>
  );
}

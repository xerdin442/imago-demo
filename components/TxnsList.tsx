"use client";

import { Transaction } from "@/lib/types";
import { cn, formatAmount, formatDate } from "@/lib/utils";
import { MoveDownLeft, MoveUpRight } from "lucide-react";
import Image from "next/image";

interface TxnsListProps {
  txns: Transaction[];
}

export default function TxnsList({ txns }: TxnsListProps) {
  return (
    <ul className="space-y-3.5 font-sans">
      {txns.map((tx) => {
        const isDeposit = tx.type === "DEPOSIT";

        const amountColor = isDeposit ? "text-green-600" : "text-destructive dark:text-pink-800";
        const iconBgColor = isDeposit ? "bg-green-200" : "bg-red-200";
        const iconColor = isDeposit ? "text-green-700" : "text-red-700";
        const statusColor =
          tx.status === "SUCCESS" ? "text-green-500" : "text-amber-500";

        const txIdentifier = tx.txIdentifier
          ? `${tx.txIdentifier.slice(0, 7)}****${tx.txIdentifier.slice(-7)}`
          : "Pending...";

        const chainLogoSrc = `${tx.chain.toLowerCase()}-logo.png`;

        return (
          <li
            key={tx.id}
            className="flex items-center justify-between bg-secondary-background border-2 border-black px-3 md:px-4 py-4 rounded-base shadow-neo"
          >
            {/* LHS */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="relative shrink-0">
                {/* Txn Type Icon */}
                <div
                  className={cn(
                    "p-2 rounded-full border-2 border-black",
                    iconBgColor,
                    iconColor
                  )}
                >
                  {isDeposit ? (
                    <MoveDownLeft size={24} strokeWidth={2.5} />
                  ) : (
                    <MoveUpRight size={24} strokeWidth={2.5} />
                  )}
                </div>

                {/* Chain Image */}
                <Image
                  src={chainLogoSrc}
                  alt={`${tx.chain} Logo`}
                  width={20}
                  height={20}
                  unoptimized
                  className="absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full border-2 border-black bg-white"
                />
              </div>

              <div className="flex flex-col">
                {/* Identifier (Hash or Signature) */}
                <p className="font-bold text-sm md:text-base font-mono">
                  {txIdentifier}
                </p>

                {/* Date */}
                <span className="text-xs text-muted-foreground">
                  {formatDate(new Date(tx.createdAt))}
                </span>
              </div>
            </div>

            {/* RHS */}
            <div className="flex flex-col items-end">
              {/* Amount */}
              <p
                className={cn(
                  "font-display text-lg md:text-xl font-bold tracking-wider",
                  amountColor
                )}
              >
                {isDeposit ? "+" : "-"}
                {formatAmount(tx.amount)}
              </p>

              {/* Status */}
              <p
                className={cn(
                  "text-[10px] md:text-sm font-black uppercase",
                  statusColor
                )}
              >
                {tx.status}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

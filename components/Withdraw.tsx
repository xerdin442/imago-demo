"use client";

import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Network, PopupProps, TransactionInfo } from "@/lib/types";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { processTransaction } from "@/app/actions/transaction";
import { ChainNamespace } from "@reown/appkit/networks";
import NetworkSelect from "./NetworkSelect";

export default function Withdraw({
  open,
  onOpenChange,
  onSuccess,
}: PopupProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [chainNamespace, setChainNameSpace] = useState<ChainNamespace>();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawalInfo, setWithdrawalInfo] = useState<TransactionInfo>({});

  const confirmWithdrawal = async () => {};

  const handleWithdrawalForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);

    const network = data.get("network") as unknown as Network;
    setChainNameSpace(network === "BASE" ? "eip155" : "solana");

    const txInfo: TransactionInfo = {
      chain: network,
      amount: Number(data.get("amount") as string),
      address: data.get("recipient") as string,
    };
    setWithdrawalInfo(txInfo);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-secondary-background border-2 border-black rounded-base px-5 py-8 w-11/12 md:max-w-102.5 gap-0 font-sans">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold mb-4 mt-3 text-center">
            Transfer
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

        <form onSubmit={() => {}} className="space-y-5">
          {/* Recipient input */}
          <div className="space-y-1.5">
            <Label htmlFor="recipient" className="text-lg ml-0.5 font-semibold">
              Recipient Address
            </Label>
            <Input
              type="text"
              name="recipient"
              placeholder="Enter wallet address or domain name"
              required
            />
          </div>

          {/* Network select */}
          <div className="space-y-1.5">
            <Label className="text-lg ml-0.5 font-semibold">Network</Label>
            <NetworkSelect disabled={false} namespace={chainNamespace} />
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
              min={1}
              required
            />
          </div>

          {/* Available Balance */}
          <div className="rounded-base md:text-lg shadow-neo border-2 border-black p-4 flex justify-between items-center">
            <p className="font-semibold">Available Balance</p>
            <p className="font-bold font-display tracking-wider text-primary">
              $0.00
            </p>
          </div>

          {/* Proceed Button */}
          <Button
            type="submit"
            // disabled={isPending}
            className="w-full mt-2 text-xl py-6 font-semibold"
          >
            {/* {isPending ? "Processing..." : "Complete Transfer"} */}
            Proceed
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

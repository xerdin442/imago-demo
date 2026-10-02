"use client";

import { MoveLeft, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Network, PopupProps, TransactionInfo } from "@/lib/types";
import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { processTransaction } from "@/app/actions/transaction";
import NetworkSelect from "./NetworkSelect";
import { formatAmount } from "@/lib/utils";
import Image from "next/image";
import { toast } from "react-toastify";

interface ConfirmWithdrawProps extends PopupProps {
  data: TransactionInfo;
  onReturn: (message?: string) => void;
  onComplete: () => void;
}

export default function Withdraw({
  open,
  onOpenChange,
  onSuccess,
  availableBalance,
}: PopupProps & { availableBalance: number }) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [withdrawalInfo, setWithdrawalInfo] = useState<TransactionInfo>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleWithdrawalForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const withdrawalAmount = Number(data.get("amount") as string);
    if (withdrawalAmount > availableBalance) {
      setErrorMsg("Insufficient balance");
      return;
    }

    const txInfo: TransactionInfo = {
      chain: data.get("network") as unknown as Network,
      amount: withdrawalAmount,
      address: data.get("recipient") as string,
    };
    setWithdrawalInfo(txInfo);

    onOpenChange(false);
    setIsConfirmOpen(true);
  };

  const returnToWithdrawalForm = (message?: string) => {
    if (message) setErrorMsg(message);
    onOpenChange(true);
    setIsConfirmOpen(false);
  };

  const resetFormState = () => {
    setErrorMsg(null);
    setWithdrawalInfo({});
    setIsConfirmOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-secondary-background border-2 border-black rounded-base px-5 py-8 w-11/12 md:max-w-105 max-h-[82vh] overflow-y-scroll gap-0 font-sans no-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold mb-4 mt-3 text-center">
              Withdraw
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

          <form onSubmit={handleWithdrawalForm} className="space-y-5">
            {/* Recipient input */}
            <div className="space-y-1.5">
              <Label
                htmlFor="recipient"
                className="text-lg ml-0.5 font-semibold"
              >
                Recipient Address
              </Label>
              <Input
                type="text"
                name="recipient"
                defaultValue={withdrawalInfo.address}
                placeholder="Enter wallet address or domain name"
                required
              />
            </div>

            {/* Network select */}
            <div className="space-y-1.5">
              <Label className="text-lg ml-0.5 font-semibold">Network</Label>
              <NetworkSelect
                disabled={false}
                selectedNetwork={withdrawalInfo.chain}
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
                defaultValue={withdrawalInfo.amount}
                min={1}
                required
              />
            </div>

            {/* Available Balance */}
            <div className="rounded-base md:text-lg shadow-neo border-2 border-black p-4 flex justify-between items-center">
              <p className="font-semibold">Available Balance</p>
              <p className="font-bold font-display tracking-wider text-primary text-lg md:text-xl">
                {formatAmount(availableBalance) || "$0.00"}
              </p>
            </div>

            {/* Proceed Button */}
            <Button
              type="submit"
              className="w-full mt-2 text-xl py-6 font-semibold"
            >
              Proceed
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmWithdraw
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onSuccess={onSuccess}
        data={withdrawalInfo}
        onReturn={returnToWithdrawalForm}
        onComplete={resetFormState}
      />
    </>
  );
}

function ConfirmWithdraw({
  open,
  onOpenChange,
  onSuccess,
  data,
  onReturn,
  onComplete,
}: ConfirmWithdrawProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const confirmWithdrawal = async () => {
    setIsConfirming(true);

    try {
      // Initiate withdrawal
      const response = await processTransaction(data, "withdraw");
      if (response && "error" in response) {
        onReturn(response.error);
        return;
      }

      // Refresh background data
      await onSuccess();

      // Reset withdrawal form state
      onComplete();

      // Close dialog box
      onOpenChange(false);

      // Notify user
      toast.success(
        `Your withdrawal of ${formatAmount(data.amount!)} is being processed`
      );
    } catch (error) {
      onReturn("An unknown error occured. Please try again");
      console.error(error);
    } finally {
      setIsConfirming(false);
    }
  };

  const formatRecipient = (recipient?: string): string => {
    if (recipient?.endsWith(".sol") || recipient?.endsWith(".eth")) {
      return recipient;
    }

    return `${recipient?.slice(0, 7)}***${recipient?.slice(-7)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-secondary-background border-2 border-black rounded-base px-5 py-8 w-11/12 md:max-w-105 gap-0 font-sans">
        {/* Return Button */}
        <button
          onClick={() => onReturn()}
          className="absolute left-5 top-5 cursor-pointer rounded-base opacity-75 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:pointer-events-none"
        >
          <MoveLeft strokeWidth={2.5} className="size-6.5" />
          <span className="sr-only">Back</span>
        </button>

        <DialogHeader>
          <DialogTitle className="text-3xl font-bold mb-6 mt-4.5 text-center">
            Confirm Details
          </DialogTitle>
        </DialogHeader>

        {/* Withdrawal Details */}
        <div className="text-left space-y-4 mb-6 px-4">
          {/* Recipient */}
          <div className="flex justify-between items-center text-lg">
            <p className="font-medium">Recipient:</p>
            <p className="font-semibold break-all">
              {formatRecipient(data.address)}
            </p>
          </div>

          {/* Network */}
          <div className="flex justify-between items-center text-lg">
            <p className="font-medium">Network:</p>
            <div className="flex items-center space-x-2">
              <Image
                src={`/${data.chain?.toLowerCase()}-logo.png`}
                alt="Network Logo"
                width={24}
                height={24}
                unoptimized
                className="w-6 h-6 rounded-full bg-white"
              />
              <span className="font-semibold">{data.chain}</span>
            </div>
          </div>

          {/* Amount */}
          <div className="flex justify-between items-center text-lg">
            <p className="font-medium">Amount:</p>
            <p className="font-semibold">{formatAmount(data.amount!)}</p>
          </div>
        </div>

        {/* Transaction Warning */}
        <div className="text-red-600 dark:text-red-700 bg-red-100 dark:bg-red-200 mb-4 px-3 py-2.5 rounded-base text-center">
          <span className="text-sm font-medium">
            By clicking &apos;Withdraw&apos;, you confirm that all the details
            are correct. Transactions on the blockchain are irreversible.
          </span>
        </div>

        {/* Confirm Button */}
        <Button
          onClick={confirmWithdrawal}
          disabled={isConfirming}
          className="w-full text-xl py-6 font-semibold"
        >
          {isConfirming ? "Processing..." : "Withdraw"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { DepositInfo, Network, PopupProps } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
  useDisconnect,
} from "@reown/appkit/react";
import { X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ToastContainer, toast } from "react-toastify";
import { processDeposit } from "@/app/actions/transaction";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
} from "./ui/select";
import Image from "next/image";
import { ChainNamespace } from "@reown/appkit/networks";
import { Eip1193Provider, ethers } from "ethers";
import { ERC20_ABI, getUsdcAddress } from "@/lib/utils";

export default function Deposit({ open, onOpenChange }: PopupProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [buttonText, setButtonText] = useState("Connect Wallet");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [chainNamespace, setChainNameSpace] = useState<ChainNamespace>();
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const { open: openAppkit } = useAppKit();
  const { isConnected, address, caipAddress } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider(chainNamespace || "eip155");
  const { disconnect } = useDisconnect();

  const disconnectWallet = async () => {
    try {
      if (isConnected) await disconnect({ namespace: chainNamespace });
    } catch (error) {
      toast.error("An error occured while switching networks");
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      await openAppkit({ namespace: chainNamespace });
    } catch (error) {
      toast.error("Wallet connection failed");
      console.error(error);
    }
  };

  const handleDpositForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const network = data.get("network") as unknown as Network;
    if (!network) {
      setErrorMsg("Please select a network");
      return;
    }
    setChainNameSpace(network === "BASE" ? "eip155" : "solana");

    if (!isConnected) {
      await connectWallet();
      setButtonText("Complete Deposit");

      return;
    }

    setButtonText("Processing...");
    setIsPending(true);

    if (!depositAmount || Number(depositAmount) <= 0) {
      setErrorMsg("Please enter a valid amount");
      setButtonText("Complete Deposit");
      setIsPending(false);

      return;
    }

    const usdcAddress = getUsdcAddress(caipAddress as string);
    const depositInfo: DepositInfo = {
      chain: network,
      amount: Number(depositAmount),
      depositor: data.get("address") as string,
    };

    if (network == "BASE") {
      // Initialize USDC contract instance
      const provider = new ethers.BrowserProvider(
        walletProvider as Eip1193Provider
      );
      const signer = await provider.getSigner();
      const usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, signer);

      // Check user's USDC balance
      const balance = await usdcContract.balanceOf(address);
      const decimals = await usdcContract.decimals();

      // Convert amount to smallest unit of USDC
      const transferAmount = ethers.parseUnits(
        depositAmount.toString(),
        decimals
      );

      // Verify that the user has sufficient balance
      if (balance < transferAmount) {
        setErrorMsg("Insufficient USDC balance");
        setButtonText("Complete Deposit");
        setIsPending(false);

        return;
      }

      // Initiate transfer of deposit amount from user wallet
      setButtonText("Sending...");
      const recipientAddress = process.env
        .NEXT_PUBLIC_BASE_PLATFORM_WALLET_ADDRESS as string;
      const tx = await usdcContract.transfer(recipientAddress, transferAmount);

      // Wait for transaction confirmation
      setButtonText("Confirming...");
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        // Process deposit info
        await processDeposit({ ...depositInfo, txIdentifier: tx.hash });
        // Refresh background data
        router.refresh();
        // Close dialog box
        onOpenChange(false);
        // Disconnect wallet
        await disconnectWallet();
        // Notify user
        toast.success(`Your deposit of ${depositAmount} is being processed.`);
      } else {
        toast.error("Deposit transaction failed!");
      }

      // Reset popup state
      setErrorMsg(null);
      setButtonText("Connect Wallet");
      setIsPending(false);

      return;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-secondary-background border-2 border-black rounded-base px-5 py-8 w-11/12 md:max-w-102.5 gap-0 font-sans">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold mb-4 mt-3 text-center">
              Deposit
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

          <form onSubmit={handleDpositForm} className="space-y-5">
            {/* Network select */}
            <div className="space-y-1.5">
              <Label className="text-lg ml-0.5 font-semibold">Network</Label>

              <Select name="network" required onValueChange={disconnectWallet}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="font-bold text-sm text-gray-400 dark:text-gray-500">
                      Networks
                    </SelectLabel>

                    <SelectItem value="BASE">
                      <div className="flex items-center space-x-2">
                        <Image
                          src="/base-logo.png"
                          alt="Base Logo"
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full border-2 border-black"
                        />
                        <span className="font-medium text-[17px]">BASE</span>
                      </div>
                    </SelectItem>

                    <SelectItem value="SOLANA">
                      <div className="flex items-center space-x-2">
                        <Image
                          src="/solana-logo.png"
                          alt="Solana Logo"
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full border-2 border-black"
                        />
                        <span className="font-medium text-[17px]">SOLANA</span>
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Amount input */}
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-lg ml-0.5 font-semibold">
                Amount
              </Label>
              <Input
                type="number"
                name="amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount"
                required
                min={1}
              />
            </div>

            {/* Connected Wallet Address */}
            {isConnected && address && (
              <div className="rounded-base text-sm md:text-base shadow-neo border-2 border-black p-4 flex justify-between items-center">
                <p className="font-semibold">Connected Wallet:</p>
                <p className="font-bold text-primary">{`${address.slice(
                  0,
                  7
                )}****${address.slice(-4)}`}</p>

                <Input
                  type="text"
                  name="address"
                  value={address}
                  className="hidden"
                />
              </div>
            )}

            {/* Action Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 text-xl py-6 font-semibold"
            >
              {buttonText}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ToastContainer autoClose={2500} theme={resolvedTheme} />
    </>
  );
}

"use client";

import { TransactionInfo, Network, PopupProps } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { processTransaction } from "@/app/actions/transaction";
import { ChainNamespace } from "@reown/appkit/networks";
import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import { parseUnits } from "viem";
import { ERC20_ABI, formatAmount, getUsdcAddress } from "@/lib/utils";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { Provider as SolanaProvider } from "@reown/appkit-adapter-solana";
import NetworkSelect from "./NetworkSelect";
import { wagmiAdapter } from "@/appkit/config";

export default function Deposit({ open, onOpenChange, onSuccess }: PopupProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [chainNamespace, setChainNameSpace] = useState<ChainNamespace>();
  const [txStatus, setTxStatus] = useState<
    "idle" | "processing" | "sending" | "confirming"
  >("idle");
  const [isPending, setIsPending] = useState(false);

  const { open: openAppkit } = useAppKit();
  const { isConnected, address, caipAddress } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider(chainNamespace || "eip155");

  const getButtonLabel = () => {
    if (!isConnected) {
      return isPending ? "Connecting..." : "Connect Wallet";
    }

    switch (txStatus) {
      case "processing":
        return "Processing...";
      case "sending":
        return "Sending...";
      case "confirming":
        return "Confirming...";
      default:
        return "Complete Deposit";
    }
  };

  const handleDpositForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const network = data.get("network") as unknown as Network;

    const selectedNamespace: ChainNamespace =
      network === "BASE" ? "eip155" : "solana";
    setChainNameSpace(selectedNamespace);

    // Initiate wallet connection if user is not connected
    setIsPending(true);
    if (!isConnected) {
      try {
        await openAppkit({
          namespace: selectedNamespace,
          view: "Connect",
        });
      } catch (error) {
        toast.error("Wallet connection error");
        console.error(error);
      } finally {
        setIsPending(false);
      }

      return;
    }

    setTxStatus("processing");

    if (!depositAmount || Number(depositAmount.trim()) <= 0) {
      setErrorMsg("Please enter a valid amount");
      setTxStatus("idle");
      setIsPending(false);

      return;
    }

    const usdcAddress = getUsdcAddress(caipAddress as string);
    const depositInfo: TransactionInfo = {
      chain: network,
      amount: Number(depositAmount),
      depositor: data.get("address") as string,
    };

    if (network == "BASE") {
      // Initialize Wagmi adapter
      const config = wagmiAdapter.wagmiConfig;

      try {
        // Fetch the user's USDC balance and token decimals
        const [balance, decimals] = await Promise.all([
          readContract(config, {
            address: usdcAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [address as `0x${string}`],
          }),

          readContract(config, {
            address: usdcAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "decimals",
          }),
        ]);

        // Convert deposit amount to smallest unit of USDC
        const transferAmount = parseUnits(depositAmount.toString(), decimals);

        // Verify that the user has sufficient balance
        if (balance < transferAmount) {
          setErrorMsg("Insufficient USDC balance");
          setTxStatus("idle");
          setIsPending(false);

          return;
        }

        // Initiate transfer of deposit amount from user wallet
        setTxStatus("sending");
        const platformAddress = process.env
          .NEXT_PUBLIC_BASE_PLATFORM_WALLET_ADDRESS! as `0x${string}`;

        const hash = await writeContract(config, {
          address: usdcAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [platformAddress, transferAmount],
        });

        // Wait for confirmation of transaction
        const receipt = await waitForTransactionReceipt(config, {
          hash,
          confirmations: 1,
        });

        if (receipt.status === "success") {
          // Process deposit info
          setTxStatus("confirming");
          await processTransaction(
            { ...depositInfo, txIdentifier: hash },
            "deposit"
          );
        } else {
          toast.error("Deposit transaction failed!");
        }
      } catch (error) {
        setErrorMsg("An unknown error occured. Please try again");
        setTxStatus("idle");
        setIsPending(false);

        console.error(error);
        return;
      }
    } else {
      const rpcUrl =
        process.env.WALLET_CONNECTION_MODE === "testnet"
          ? "https://api.devnet.solana.com"
          : "https://api.mainnet-beta.solana.com";

      try {
        // Initialize connection to network
        const connection = new Connection(rpcUrl, "confirmed");
        const provider = walletProvider as SolanaProvider;
        const senderPublicKey = new PublicKey(address as string);
        const platformPublicKey = new PublicKey(
          process.env.NEXT_PUBLIC_SOLANA_PLATFORM_WALLET_ADDRESS!
        );
        const usdcMintAddress = new PublicKey(usdcAddress);

        // Get Associated Token Accounts for the depositor and platform addresses
        const senderATA = await getAssociatedTokenAddress(
          usdcMintAddress,
          senderPublicKey
        );
        const platformATA = await getAssociatedTokenAddress(
          usdcMintAddress,
          platformPublicKey
        );

        // Verify that the user has sufficient balance
        const balance = await connection.getTokenAccountBalance(senderATA);
        if (balance.value.uiAmount! < Number(depositAmount)) {
          setErrorMsg("Insufficient USDC balance");
          setTxStatus("idle");
          setIsPending(false);

          return;
        }

        // Create transaction and configure transfer instruction
        const transaction = new Transaction().add(
          createTransferInstruction(
            senderATA,
            platformATA,
            senderPublicKey,
            Number(depositAmount) * Math.pow(10, balance.value.decimals),
            [],
            TOKEN_PROGRAM_ID
          )
        );

        // Retrieve latest blockhash from the network
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = senderPublicKey;

        // Initiate transfer of deposit amount from user wallet
        setTxStatus("sending");
        const signedTxn = await provider.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(
          signedTxn.serialize()
        );

        // Wait for confirmation of transaction
        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash,
            lastValidBlockHeight,
          },
          "confirmed"
        );

        if (!confirmation.value.err) {
          // Process deposit info
          setTxStatus("confirming");
          await processTransaction(
            { ...depositInfo, txIdentifier: signature },
            "deposit"
          );
        } else {
          toast.error("Deposit transaction failed!");
        }
      } catch (error) {
        setErrorMsg("An unknown error occured. Please try again");
        setTxStatus("idle");
        setIsPending(false);

        console.error(error);
        return;
      }
    };

    // Refresh background data
    await onSuccess();

    // Close dialog box
    onOpenChange(false);

    // Notify user
    toast.success(
      `Your deposit of ${formatAmount(
        parseFloat(depositAmount)
      )} is being processed.`
    );

    // Reset popup state
    setErrorMsg(null);
    setIsPending(false);
    setTxStatus("idle");
    setDepositAmount("");

    return;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-secondary-background border-2 border-black rounded-base px-5 py-8 w-11/12 md:max-w-102.5 gap-0 font-sans"
      >
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
            <NetworkSelect disabled={isPending} namespace={chainNamespace} />
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-lg ml-0.5 font-semibold">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              name="amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Enter amount"
              min={1}
              step={0.01}
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
            {getButtonLabel()}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

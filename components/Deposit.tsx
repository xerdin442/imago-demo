"use client";

import { TransactionInfo, Network, PopupProps, isApiError } from "@/lib/types";
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
import { toast } from "react-toastify";
import { processTransaction } from "@/app/actions/transaction";
import { ChainNamespace } from "@reown/appkit/networks";
import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
  getChainId,
  switchChain,
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
import { baseNetworks, wagmiAdapter } from "@/appkit/config";
import { env } from "@/lib/env";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

export default function Deposit({ open, onOpenChange }: PopupProps) {
  const queryClient = useQueryClient();
  const [depositAmount, setDepositAmount] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network>();
  const [txStatus, setTxStatus] = useState<
    "idle" | "processing" | "sending" | "confirming"
  >("idle");
  const [isConnecting, setIsConnecting] = useState(false);

  const chainNamespace: ChainNamespace | undefined = network
    ? network === "BASE"
      ? "eip155"
      : "solana"
    : undefined;

  const { open: openAppkit } = useAppKit();
  const { disconnect } = useDisconnect();
  const { isConnected, address, caipAddress } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider(chainNamespace || "eip155");

  const handleNetworkChange = async (value: Network) => {
    const nextNamespace: ChainNamespace =
      value === "BASE" ? "eip155" : "solana";

    if (isConnected && chainNamespace && chainNamespace !== nextNamespace) {
      try {
        await disconnect({ namespace: chainNamespace });
      } catch (error) {
        console.error(error);
      }
    }

    setNetwork(value);
  };

  const depositMutation = useMutation({
    mutationFn: async () => {
      if (!network) throw new Error("Please select a network");

      if (!depositAmount || Number(depositAmount.trim()) <= 0) {
        throw new Error("Please enter a valid amount");
      }

      const usdcAddress = getUsdcAddress(caipAddress as string);
      if (!usdcAddress) {
        throw new Error(
          "Unsupported network for the connected wallet. Please reconnect on the selected network.",
        );
      }

      const depositInfo: TransactionInfo = {
        chain: network,
        amount: Number(depositAmount),
        depositor: address,
      };

      setTxStatus("processing");

      if (network === "BASE") {
        const config = wagmiAdapter.wagmiConfig;
        const expectedChainId = Number(baseNetworks[0].id);

        const currentChainId = getChainId(config);
        if (currentChainId !== expectedChainId) {
          await switchChain(config, { chainId: expectedChainId });
        }

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

        const transferAmount = parseUnits(depositAmount.toString(), decimals);
        if (balance < transferAmount) {
          throw new Error("Insufficient USDC balance");
        }

        setTxStatus("sending");
        const hash = await writeContract(config, {
          address: usdcAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [
            env.basePlatformWalletAddress as `0x${string}`,
            transferAmount,
          ],
        });

        const receipt = await waitForTransactionReceipt(config, {
          hash,
          confirmations: 1,
        });

        if (receipt.status !== "success") {
          throw new Error("Deposit transaction failed!");
        }

        setTxStatus("confirming");
        const result = await processTransaction(
          { ...depositInfo, txIdentifier: hash },
          "deposit",
        );
        if (isApiError(result)) throw new Error(result.error);
      } else {
        const connection = new Connection(env.solanaRpcUrl, "confirmed");
        const provider = walletProvider as SolanaProvider;
        const senderPublicKey = new PublicKey(address as string);
        const platformPublicKey = new PublicKey(
          env.solanaPlatformWalletAddress,
        );
        const usdcMintAddress = new PublicKey(usdcAddress);

        const senderATA = await getAssociatedTokenAddress(
          usdcMintAddress,
          senderPublicKey,
        );
        const platformATA = await getAssociatedTokenAddress(
          usdcMintAddress,
          platformPublicKey,
        );

        const balance = await connection.getTokenAccountBalance(senderATA);
        if (balance.value.uiAmount! < Number(depositAmount)) {
          throw new Error("Insufficient USDC balance");
        }

        const transaction = new Transaction().add(
          createTransferInstruction(
            senderATA,
            platformATA,
            senderPublicKey,
            Number(depositAmount) * Math.pow(10, balance.value.decimals),
            [],
            TOKEN_PROGRAM_ID,
          ),
        );

        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = senderPublicKey;

        setTxStatus("sending");
        const signedTxn = await provider.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(
          signedTxn.serialize(),
        );

        const confirmation = await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          "confirmed",
        );

        if (confirmation.value.err) {
          throw new Error("Deposit transaction failed!");
        }

        setTxStatus("confirming");
        const result = await processTransaction(
          { ...depositInfo, txIdentifier: signature },
          "deposit",
        );
        if (isApiError(result)) throw new Error(result.error);
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile() }),
      ]);

      onOpenChange(false);

      toast.success(
        `Your deposit of ${formatAmount(
          parseFloat(depositAmount),
        )} is being processed.`,
      );

      if (chainNamespace) {
        try {
          await disconnect({ namespace: chainNamespace });
        } catch (error) {
          console.error(error);
        }
      }

      setErrorMsg(null);
      setDepositAmount("");
      setTxStatus("idle");
    },
    onError: (error: Error) => {
      setErrorMsg(
        error.message || "An unknown error occured. Please try again",
      );
      setTxStatus("idle");
      console.error(error);
    },
  });

  const isPending = isConnecting || depositMutation.isPending;

  const getButtonLabel = () => {
    if (!isConnected) {
      return isConnecting ? "Connecting..." : "Connect Wallet";
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

  const handleDepositForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!network) {
      setErrorMsg("Please select a network");
      return;
    }

    // Initiate wallet connection if user is not connected
    if (!isConnected) {
      setIsConnecting(true);

      try {
        await openAppkit({ namespace: chainNamespace, view: "Connect" });
      } catch (error) {
        toast.error("Wallet connection error");
        console.error(error);
      } finally {
        setIsConnecting(false);
      }

      return;
    }

    depositMutation.mutate();
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

        <form onSubmit={handleDepositForm} className="space-y-5">
          {/* Network select */}
          <div className="space-y-1.5">
            <Label className="text-lg ml-0.5 font-semibold">Network</Label>
            <NetworkSelect
              disabled={isPending}
              value={network}
              onValueChange={handleNetworkChange}
            />
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
                7,
              )}****${address.slice(-4)}`}</p>
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

"use client";

import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
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
import { toast } from "react-toastify";
import { Network } from "@/lib/types";

interface NetworkSelectProps {
  namespace?: ChainNamespace;
  disabled: boolean;
}

const networks: Network[] = ["BASE", "SOLANA"];

export default function NetworkSelect({
  namespace,
  disabled,
}: NetworkSelectProps) {
  const { isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  const disconnectWallet = async () => {
    try {
      if (isConnected) await disconnect({ namespace });
    } catch (error) {
      toast.error("An error occured while switching networks");
      console.error(error);
    }
  };

  return (
    <Select
      disabled={disabled}
      name="network"
      required
      onValueChange={disconnectWallet}
    >
      <SelectTrigger className="w-full dark:text-gray-800">
        <SelectValue placeholder="Select network" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="font-bold text-sm text-gray-400 dark:text-gray-500">
            Networks
          </SelectLabel>

          {networks.map((network) => (
            <SelectItem key={network} value={network}>
              <div className="flex items-center space-x-2">
                <Image
                  src={`/${network.toLowerCase()}-logo.png`}
                  alt={`${network} Logo`}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full border-2 border-black"
                />
                <span className="font-medium text-[17px]">{network}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

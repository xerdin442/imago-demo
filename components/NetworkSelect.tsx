"use client";

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
import { Network } from "@/lib/types";

interface NetworkSelectProps {
  disabled?: boolean;
  value?: Network;
  defaultValue?: Network;
  onValueChange?: (value: Network) => void;
}

const networks: Network[] = ["BASE", "SOLANA"];

export default function NetworkSelect({
  disabled,
  value,
  defaultValue,
  onValueChange,
}: NetworkSelectProps) {
  return (
    <Select
      disabled={disabled}
      name="network"
      required
      onValueChange={onValueChange as (value: string) => void}
      {...(value !== undefined ? { value } : { defaultValue })}
    >
      <SelectTrigger className="w-full dark:text-gray-800">
        <SelectValue placeholder="Select network" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel className="font-bold text-sm text-gray-400 dark:text-gray-500">
            Networks
          </SelectLabel>

          {networks.map((network, index) => (
            <SelectItem key={index} value={network}>
              <div className="flex items-center space-x-2">
                <Image
                  src={`/${network.toLowerCase()}-logo.png`}
                  alt={`${network} Logo`}
                  width={network === "SOLANA" ? 316 : 500}
                  height={network === "SOLANA" ? 316 : 500}
                  className="w-6 h-6 rounded-full border-2 border-black bg-white"
                />
                <span className="font-medium text-[1.0625rem]">{network}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

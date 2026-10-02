"use client";

import { useSearchParams } from "next/navigation";
import Navbar from "./Navbar";
import { useEffect, useRef, useState } from "react";
import { getProfile, handleSocialAuth, User } from "@/app/actions/profile";
import { useClientMounted } from "@/hooks/useClientMount";
import {
  ArrowLeftRight,
  Loader2,
  MoveDownLeft,
  MoveUpRight,
  PlusIcon,
  Search,
} from "lucide-react";
import { Button } from "./ui/button";
import { formatAmount } from "@/lib/utils";
import TxnsList from "./TxnsList";
import { getTransactions, Transaction } from "@/app/actions/transaction";

export default function Dashboard() {
  const mounted = useClientMounted();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | undefined>(undefined);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!mounted || hasFetched.current) return;

    const initializeDashboard = async () => {
      hasFetched.current = true;
      const socialAuth = searchParams.get("socialAuth");

      try {
        // Fetch user profile
        let userData;
        if (socialAuth) {
          userData = await handleSocialAuth(socialAuth);
        } else {
          userData = await getProfile();
        }

        if (!userData) {
          window.location.href = "/";
          return;
        }
        setUser(userData);

        // Fetch Transactions
        setTxLoading(true);
        const txData = await getTransactions();
        setTxns(txData);
      } catch (error) {
        console.error("Dashboard initialization failed", error);
      } finally {
        setTxLoading(false);
      }
    };

    initializeDashboard();
  }, [mounted, searchParams]);

  if (!mounted) return null;

  return (
    <>
      <Navbar user={user} />
      <section className="md:flex w-full font-sans">
        {/* LHS */}
        <div className="md:w-1/2 grow">
          {/* Wallet */}
          <div className="text-center pt-4 pb-8 md:py-8 px-4">
            <p className="font-display text-[52px] tracking-wider">
              {user ? formatAmount(user.balance) : "$0.00"}
            </p>

            {/* Action buttons */}
            <div className="mt-4 flex items-center justify-center space-x-10 lg:space-x-12">
              {/* Deposit Btn */}
              <div className="flex flex-col items-center justify-center space-y-1.5">
                <Button className="w-12.5 h-12">
                  <MoveDownLeft strokeWidth={2.5} className="size-6.5" />
                </Button>

                <p className="md:text-lg font-semibold">Deposit</p>
              </div>

              {/* Withdraw Btn */}
              <div className="flex flex-col items-center justify-center space-y-1.5">
                <Button className="w-12.5 h-12">
                  <MoveUpRight strokeWidth={2.5} className="size-6.5" />
                </Button>

                <p className="md:text-lg font-semibold">Withdraw</p>
              </div>

              {/* Transfer Btn */}
              <div className="flex flex-col items-center justify-center space-y-1.5">
                <Button className="w-12.5 h-12">
                  <ArrowLeftRight strokeWidth={2.5} className="size-7" />
                </Button>

                <p className="md:text-lg font-semibold">Transfer</p>
              </div>
            </div>
          </div>

          {/* Wagers */}
          <div className="mt-3 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3.5 md:px-2">
              <h3 className="text-3xl font-extrabold">Wagers</h3>

              <div className="flex items-center justify-center space-x-4">
                {/* Create Wager Btn */}
                <Button className="py-5.5">
                  <PlusIcon
                    size={30}
                    strokeWidth={2.5}
                    className="md:hidden size-6.25"
                  />

                  <span className="hidden md:block text-xl font-bold">
                    Create wager
                  </span>
                </Button>

                {/* Search Icon */}
                <Button className="w-12.5 h-11.5">
                  <Search strokeWidth={2.5} className="size-6"></Search>
                </Button>
              </div>
            </div>

            {/* List */}
            <div id="wagers-list"></div>
          </div>
        </div>

        {/* RHS */}
        <div className="md:w-1/2 px-4 grow mt-6 md:mt-0">
          <h3 className="text-3xl font-extrabold mb-3">Transactions</h3>

          {txLoading ? (
            <div className="w-full flex items-center justify-center pt-3">
              <Loader2
                size={32}
                strokeWidth={2.5}
                className="animate-spin text-gray-500"
              />
            </div>
          ) : txns.length < 1 ? (
            <p className="text-center text-gray-400 font-semibold md:text-lg pt-2">
              No transactions yet...
            </p>
          ) : (
            <TxnsList txns={txns} />
          )}
        </div>
      </section>
    </>
  );
}

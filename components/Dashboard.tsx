"use client";

import { useSearchParams } from "next/navigation";
import Navbar from "./Navbar";
import { useEffect, useRef, useState } from "react";
import { getProfile, handleSocialAuth, User } from "@/app/actions/profile";
import { useClientMounted } from "@/hooks/useClientMount";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | undefined>(undefined);
  const mounted = useClientMounted();

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!mounted || hasFetched.current) return;

    const initUser = async () => {
      hasFetched.current = true;
      const socialAuth = searchParams.get("socialAuth");

      try {
        let userData;
        if (socialAuth) {
          userData = await handleSocialAuth(socialAuth);
        } else {
          userData = await getProfile();
        }
        setUser(userData);
      } catch (err) {
        console.error("Failed to load user", err);
      }
    };

    initUser();
  }, [mounted, searchParams]);

  if (!mounted) return null;

  return (
    <>
      <Navbar user={user} />
    </>
  );
}

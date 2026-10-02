"use client";

import { useSearchParams } from "next/navigation";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import { getProfile, handleSocialAuth, User } from "@/app/actions/profile";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    const initUser = async () => {
      const socialAuth = searchParams.get("socialAuth");

      let userData;
      if (socialAuth) {
        userData = await handleSocialAuth(socialAuth);
      } else {
        userData = await getProfile();
      }
      setUser(userData);
    };

    initUser();
  }, [searchParams]);

  return (
    <>
      <Navbar user={user} />
    </>
  );
}

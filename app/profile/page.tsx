"use client";

import { useSession } from "next-auth/react";
import Loading from "@app/loading";
import Profile from "@components/profile/Profile";

const ProfilePage = () => {
  
  const { data: sessionData, status: authStatus } = useSession();

  if(authStatus === "loading"){
    return <Loading />;
  };

  return <Profile User={sessionData?.user as UserSessionData} authStatus={authStatus as "authenticated" | "unauthenticated" } />;
};

export default ProfilePage;
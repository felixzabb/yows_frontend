"use client";

import { useSession } from "next-auth/react";
import Loading from "@app/loading";
import SavedScrapes from "@components/user/SavedScrapers";

const SavedScrapesPage = () => {

  const { data: sessionData, status: authStatus } =  useSession();

  if(authStatus === "loading"){
    return <Loading />;
  };

  return <SavedScrapes User={sessionData?.user as UserSessionData} authStatus={authStatus as "authenticated" | "unauthenticated"} />
};

export default SavedScrapesPage;
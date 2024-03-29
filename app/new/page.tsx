"use client";

import { useSession } from "next-auth/react";
import Loading from "@app/loading";
import ScraperForm from "@components/scraper/ScraperForm";

const CreateNewScraperPage = () => {

  const { data: sessionData, status: authStatus } = useSession();

  if(authStatus === "loading"){ return <Loading />; };

  return <ScraperForm User={sessionData?.user as UserSessionData} authStatus={authStatus as "authenticated" | "unauthenticated"} />;
};

export default CreateNewScraperPage;
"use client";

import { useSession } from "next-auth/react";
import Loading from "@app/loading";
import WSForm from "@components/scraping/WSForm";


const NewScraperPage = () => {

  const { data: sessionData, status: authStatus } = useSession();

  if(authStatus === "loading"){
    return <Loading />;
  };

  return <WSForm User={sessionData?.user} authStatus={authStatus} />;
};

export default NewScraperPage;
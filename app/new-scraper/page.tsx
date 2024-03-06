"use client";

import { useSession } from "next-auth/react";
import Loading from "@app/loading";
import WSForm from "@components/scraping/WSForm";


const NewScraperPage = () => {

  const { data: theSession, status: authStatus } = useSession();

  return (
    <>
      {
        authStatus === "loading" ? 
          (
            <Loading />
          ) 
          : 
          (
            <WSForm User={theSession?.user} authStatus={authStatus} />
          )
      
      }
    </>
  );
};

export default NewScraperPage;
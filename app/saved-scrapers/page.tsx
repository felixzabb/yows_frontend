"use client";

import { useSession } from "next-auth/react";
import Loading from "@app/loading";
import SavedScrapes from "@components/user/SavedScrapes";



const SavedScrapesPage = () => {

  const { data: theSession, status: authStatus } =  useSession();

  return (
    <>
      {
        authStatus !== "loading" ? 
          (
            <SavedScrapes User={theSession?.user} authStatus={authStatus}/>
          ) 
          : 
          ( 
            <Loading />
          )
      }
    </>
  );
};

export default SavedScrapesPage;
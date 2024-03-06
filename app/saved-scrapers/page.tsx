"use client";

import { useSession } from "next-auth/react";
import Loading from "@app/loading";
import SavedScrapes from "@components/user/SavedScrapes";



const SavedScrapesPage = () => {

  const { data: theSession, status: AuthStatus } =  useSession();

  return (
    <>
      {
        theSession?.user !== undefined ? 
          (
            <SavedScrapes User={theSession?.user} AuthStatus={AuthStatus}/>
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
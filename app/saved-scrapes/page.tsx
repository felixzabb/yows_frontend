"use client";

import { useSession } from "next-auth/react";
import Loading from "@app/loading";
import SavedScrapes from "@components/SavedScrapes";



const SavedScrapesPage = () => {

  const { data: theSession } =  useSession();

  return (
    <>
      {
        theSession?.user !== undefined ? 
          (
            <SavedScrapes User={theSession?.user} />
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
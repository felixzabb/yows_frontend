"use client";

import { useSession } from "next-auth/react";
import Loading from "@app/loading";
import WSForm from "@components/WSForm";


const NewScraperPage = () => {

  const { data: theSession } = useSession();

  return (
    <>
      <h1 className="subhead_text text-black-800 w-[90dvw]" > Time to create "Your Own Web-Scraper"</h1>
      {
        theSession?.user ? 
          (
            <WSForm User={theSession?.user}/>
          ) 
          : 
          (
            <Loading />
          )
      
      }
    </>
  );
};

export default NewScraperPage;
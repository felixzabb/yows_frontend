"use client";

import { useSession } from "next-auth/react";
import Loading from "@app/loading";
import Profile from "@components/Profile";


const ProfilePage = () => {
  
  const { data: theSession } = useSession();

  return (
    <>
      {
        theSession?.user !== undefined ? 
          ( 
            <>
              <h1 className="subhead_text" >Welcome to your Profile, {theSession?.user.name}</h1>
              <Profile User={theSession?.user} />
            </>
            
          ) 
          :   
          (
            <Loading />
          )
      }
    </>
  );
};

export default ProfilePage;
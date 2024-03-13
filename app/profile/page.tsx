"use client";

import { useSession } from "next-auth/react";
import Loading from "@app/loading";
import Profile from "@components/user/profile/Profile";


const ProfilePage = () => {
  
  const { data: theSession, status: AuthStatus } = useSession();

  return (
    <>
      {
        AuthStatus !== "loading" ? 
          ( 
            <Profile User={theSession?.user} AuthStatus={AuthStatus} />            
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
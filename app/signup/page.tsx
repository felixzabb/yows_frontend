"use client";

import { useSession, getProviders} from "next-auth/react";
import { useState, useEffect } from "react";
import SignUp from "@components/user/SignUp";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PacmanLoader } from "react-spinners";

const SignUpPage = () => {

  const { status: authStatus } = useSession();
  const [ providers, setProviders ] = useState(null);

  const { push } = useRouter();

  const providerSetup = async () => {

    const providers = await getProviders();
    setProviders(providers);
    return;
  };

	useEffect(() => {
    providerSetup();
	}, []);

  useEffect(() => {
    if(authStatus === "authenticated"){
      push("/");
    };
    return;
  }, [authStatus]);

  return (
    <section id="sign-up/in-section" className="flex flex-col lg:flex-row w-full h-[80dvh] items-center" >

      <div id="logo-container" className="flex flex-col items-center gap-y-4 w-[50%] h-full border-r-2 border-gray-400" >
        <Image
          src={"/assets/icons/logo/yows_logo_1.svg"}
          alt="Yows logo"
          id="sign-up/in-logo"
          width={500}
          height={500}
          className=""
        />

        <h2 id="sign-up/in-logo-heading" className="text-[26px] font-inter font-[600]" >YOWS - Your Own Web Scraper</h2>

        <p id="sign-up/in-logo-description" className="text-[18px] font-[400] px-2 pl-6 text-start" >
          By signing in you will get access to lots of features, like saving scrapers, managing data, interacting with the API and so on. <br />
          You can sign in through Google, but if you want to subscribe to any paid features(coming soon) you will need to create your own YOWS account. <br />
          There will be no spam/ad emails sent to your email address and you can delete your account at any time.
        </p>
      </div>

      {
        authStatus === "unauthenticated" ? 
        (
          <SignUp providers={providers} push={push} />
        )
        :
        (
          <div id="auth-loading-wrapper" className="w-[50%] h-full flex flex-col items-center justify-center" >
            <PacmanLoader size={50} speedMultiplier={2} color="#9D40BE" />
          </div>
        )
      }
      
    </section>
  );
};

export default SignUpPage;
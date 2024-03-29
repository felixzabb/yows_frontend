"use client";

import { useSession, getProviders, signIn} from "next-auth/react";
import { useState, useEffect } from "react";
import SignUp from "@components/user/SignUp";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { PacmanLoader } from "react-spinners";
import SignIn from "@components/user/SignIn";
import { removeQueryParamsByKey } from "@utils/generalUtils";

const SignUpPage = () => {

  const { push } = useRouter();
  const urlQueryParams = useSearchParams();
  const currentMode = urlQueryParams.get("mode");

  const { status: authStatus } = useSession();
  const [ providers, setProviders ] = useState(null);

  const providerSetup = async () => {
    setProviders(await getProviders());
  };

	useEffect(() => {
    providerSetup();
	}, []);

  // If user is authenticated, get him the hell out of here!
  useEffect(() => {
    if(authStatus === "authenticated"){
      push("/");
    };
  }, [authStatus]);

  // If the mode query param is not present or invalid, add 'mode=in'.
  useEffect(() => {

    if(!["in", "up"].includes(urlQueryParams.get("mode"))){
      push(`??${removeQueryParamsByKey({ queryParams: urlQueryParams, keys: ["mode"] })}mode=in`);
    };
  }, [urlQueryParams]);

  return (
    <section id="sign-up/in-container" className="flex flex-col lg:flex-row w-full h-[80dvh] items-center" >

      <div className="flex flex-col items-center gap-y-4 w-[50%] h-full border-r-2 border-gray-400" >

        <Image
          src={"/assets/icons/logo/yows_logo_1.svg"}
          alt="Yows logo"
          width={500}
          height={500}
        />

        <h2 className="text-[26px] font-inter font-[600]" >YOWS - Your Own Web Scraper</h2>

        <p className="text-[18px] font-[400] px-2 pl-6 text-start" >
          By signing in you will get access to lots of features, like saving scrapers, managing data, interacting with the API and so on. <br />
          You can sign in through Google, but if you want to subscribe to any paid features(coming soon) you will need to create your own YOWS account. <br />
          There will be no spam/ad emails sent to your email address and you can delete your account at any time.
        </p>

      </div>
      
      <div className="w-[50%] h-full flex flex-col gap-y-4 items-center py-6" >

        {
          !urlQueryParams || !currentMode && (
            <div className="w-[50%] h-[400px] flex flex-col items-center justify-center" >
              <PacmanLoader size={50} speedMultiplier={2} color="#9D40BE" />
            </div>
          )
        }

        {
          currentMode === "in" && (
            <SignIn />
          )
        }

        {
          currentMode === "up" && (
            <SignUp />
          )
        }

        <button 
          onClick={async (e) => {e.preventDefault(); await signIn(providers.google.id); }}
          className='flex flex-row items-center gap-x-2 justify-between border-2 rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] max-w-[80%] w-full h-auto text-center font-[600]'  
        >
          <Image
            src="/assets/icons/providers/google.svg"
            alt="google provider icon"
            className="height-auto width-auto"
            width={40} height={40}
          />

          Sign in with google
        </button>

      </div>
    </section>
  );
};

export default SignUpPage;
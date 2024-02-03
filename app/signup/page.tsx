"use client";

import { signIn, signOut, useSession, getProviders} from "next-auth/react";
import { useState, useEffect } from "react";
import { redirect } from "next/navigation";

const SignUpPage = () => {

  const { data: theSession } = useSession();
  const [ providers, setProviders ] : [any, any] = useState(null);
  var initialRender = true;

  const firstProviderSetup = async () => {

    const providers = await getProviders();

    setProviders(providers);

    return;
  };

	useEffect(() => {

    if(initialRender){
      firstProviderSetup();
      initialRender = false;
    };

	}, []);

  return (
    <>
      {
        theSession?.user ? 
          (
            <>
              <h1> Already logged in. Redirecting... </h1>
              {redirect("/")}
            </>
          ) 
          : 
          (
            providers && Object.values(providers).map((provider : any) => (

              <button  className="purple_btn"
                type='button'
                key={provider.name}
                onClick={() => { signIn(provider.id); }}
              >
              {`Sign up/in (${provider.name})`}
              </button>
            ))
          )
      }
    </>
  );
};

export default SignUpPage;
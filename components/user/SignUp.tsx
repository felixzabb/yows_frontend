"use client";

import { CreateUser } from "@utils/api_funcs";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import errorCodes from "@utils/errorCodes.json";
import { hideElement, inputElementValue, resetInputElementValue, showElement } from "@utils/elementFunction";
import { validateEmail, validatePassword } from "@utils/validation";

const SignUp = ({providers, push}) => {

  const urlQueryParams = useSearchParams();

  const [signInError, setSignInError] = useState<string>("");
  const [signInDataValid, setSignInDataValid] = useState(false);
  const [signUpError, setSignUpError] = useState<string>("");
  const [signUpDataValid, setSignUpDataValid] = useState(false);

  const signUserUp = async (e) => {

    const {email, password, alias } = {
      email: inputElementValue({elementId: "sign-up-email"}), 
      password: inputElementValue({elementId: "sign-up-password"}), 
      alias: inputElementValue({elementId: "sign-up-alias"}),
    }

    e.preventDefault();

    const createUserOperation = await CreateUser({
      apiKey: "felix12m",
      provider: "credentials",
      email: email,
      password: password,
      alias: alias,
      scheme: "default",
    });

    if(!createUserOperation.acknowledged){
      const errorCode = createUserOperation.errors.at(0);
      const errorPath = errorCode.split("-");
      const errorData = errorCodes?.[errorPath[0]]?.[errorPath[1]]?.[errorPath[2]];

      setSignUpError(() => {
        if(errorData === undefined){
          return "An unexpected error occurred";
        }
        else{
          return errorData.message;
        }
      });

      resetInputElementValue({elementId: "sign-up-password"});
      resetInputElementValue({elementId: "sign-up-password-reenter"});
      
      showElement({elementId: "sign-up-error"});
      return;
    }

    const signInOperation = await signIn("credentials", {
      redirect: false,
      email: email,
      password: password,
    });

    if(!signInOperation.ok){

      const errorCode = signInOperation.error;
      const errorPath = errorCode.split("-");
      const errorData = errorCodes?.[errorPath[0]]?.[errorPath[1]]?.[errorPath[2]];

      setSignUpError(() => {
        if(errorData === undefined){
          return "An unexpected error occurred";
        }
        else{
          return errorData.message;
        }
      });

      resetInputElementValue({elementId: "sign-up-password"});
      resetInputElementValue({elementId: "sign-up-password-reenter"});

      showElement({elementId: "sign-up-error"});
      return;
    }
    
    const signUpForm = window.document.getElementById("sign-up-form") as HTMLFormElement;
    // signUpForm.reset();

    return;
  };

  const assertSignUpDataValid = () : void => {

    const possibleClasses = ["border-red-500"]

    const signUpEmailInput = window.document.getElementById("sign-up-email") as HTMLInputElement;
    const signUpEmail = signUpEmailInput.value;
    const emailValid = validateEmail({email: signUpEmail});

    if(!emailValid){
      if(signUpEmail.length === 0){
        signUpEmailInput.classList.remove(possibleClasses[0])
      }
      else{
        signUpEmailInput.classList.add(possibleClasses[0])
      }
    }
    else if(emailValid){
      signUpEmailInput.classList.remove(possibleClasses[0])
    }

    const signUpPasswordInput = window.document.getElementById("sign-up-password") as HTMLInputElement;
    const signUpPassword = signUpPasswordInput.value;
    const passwordValid = validatePassword({password: signUpPassword});
    
    if(!passwordValid){
      if(signUpPassword.length === 0){
        signUpPasswordInput.classList.remove(possibleClasses[0])
      }
      else{
        signUpPasswordInput.classList.add(possibleClasses[0])
      }
    }
    else if(passwordValid){
      signUpPasswordInput.classList.remove(possibleClasses[0])
    }

    const signUpPasswordReenterInput = window.document.getElementById("sign-up-password-reenter") as HTMLInputElement;
    const signUpPasswordReenter = signUpPasswordReenterInput.value;
    let passwordReenterValid = validatePassword({password: signUpPasswordReenter});

    if(signUpPasswordReenter !== signUpPassword){ passwordReenterValid = false; };
    
    if(!passwordReenterValid){
      if(signUpPasswordReenter.length === 0){
        signUpPasswordReenterInput.classList.remove(possibleClasses[0])
      }
      else{
        signUpPasswordReenterInput.classList.add(possibleClasses[0])
      }
    }
    else if(passwordReenterValid){
      signUpPasswordReenterInput.classList.remove(possibleClasses[0])
    }

    if(emailValid && passwordValid && passwordReenterValid){ hideElement({elementId: "sign-up-error"}); setSignUpDataValid(true); }
    else{ 
      setSignUpDataValid(false); 
      if(!emailValid){
        setSignUpError("Email must be a valid email!");
      }
      else if(!passwordValid){
        setSignUpError("Password must be at least 8 characters long and contain: 1 uppercase, 1 lowercase, 1 number, 1 special character!");
      }
      else if(!passwordReenterValid){
        setSignUpError("Password field don't match!");
      }
      showElement({elementId: "sign-up-error"});
    };

    return;
  };

  const signUserIn = async (e) : Promise<void> => {

    e.preventDefault(); 

    const signInOperation = await signIn("credentials", {
      redirect: false,
      email: inputElementValue({elementId: "sign-in-email"}),
      password: inputElementValue({elementId: "sign-in-password"}),
    });


    if(!signInOperation.ok){

      const errorCode = signInOperation.error;
      const errorPath = errorCode.split("-");
      const errorData = errorCodes?.[errorPath[0]]?.[errorPath[1]]?.[errorPath[2]];


      setSignInError(() => {
        if(errorData === undefined){
          return "An unexpected error occurred";
        }
        else{
          return errorData.message;
        }
      });

      const signInPasswordInput = window.document.getElementById("sign-in-password") as HTMLInputElement;
      signInPasswordInput.value = "";
      showElement({elementId: "sign-in-error"});
      return;
    }
    push("/");
    return;
  };

  const assertSignInDataValid = () : void => {

    const possibleClasses = ["border-red-500"]

    const signInEmailInput = window.document.getElementById("sign-in-email") as HTMLInputElement;
    const signInEmail = signInEmailInput.value;
    const emailValid = validateEmail({email: signInEmail});

    if(!emailValid){
      if(signInEmail.length === 0){
        signInEmailInput.classList.remove(possibleClasses[0])
      }
      else{
        signInEmailInput.classList.add(possibleClasses[0])
      }
    }
    else if(emailValid){
      signInEmailInput.classList.remove(possibleClasses[0])
    }

    const signInPasswordInput = window.document.getElementById("sign-in-password") as HTMLInputElement;
    const signInPassword = signInPasswordInput.value;
    const passwordValid = validatePassword({password: signInPassword});
    
    if(!passwordValid){
      if(signInPassword.length === 0){
        signInPasswordInput.classList.remove(possibleClasses[0])
      }
      else{
        signInPasswordInput.classList.add(possibleClasses[0])
      }
    }
    else if(passwordValid){
      signInPasswordInput.classList.remove(possibleClasses[0])
    }

    if(emailValid && passwordValid){ hideElement({elementId: "sign-in-error"}); setSignInDataValid(true); }
    else{ 
      setSignInDataValid(false); 
      if(!emailValid){
        setSignInError("Email must be a valid email!");
      }
      else if(!passwordValid){
        setSignInError("Password must be at least 8 characters long and contain: 1 uppercase, 1 lowercase, 1 number, 1 special character!")
      }
      showElement({elementId: "sign-in-error"});
    };

    return;
  };

  useEffect(() => {

    window.document.getElementById("sign-in-error").classList.add("hidden");

    if(!urlQueryParams.has("mode")){ 
      if(urlQueryParams.size === 0){ push("?mode=in"); }
      else{ push(`?${urlQueryParams}&mode=in`); };
    }
    else{
      const currentMode = urlQueryParams.get("mode");
      const modeTransformer = {in: "up", up: "in"};

      window.document.getElementById(`sign-${currentMode}-form`).classList.remove("hidden");
      window.document.getElementById(`sign-${modeTransformer[currentMode]}-form`).classList.add("hidden");
    };

  }, [urlQueryParams]);

  return (
    <div id="sign-up/in-container" className="w-[50%] h-full flex flex-col gap-y-4 items-center py-6" >

      <form id="sign-in-form" onSubmit={(e) => { async (e) => { await signUserIn(e); } }} className="flex flex-col items-center w-full h-auto gap-y-3 mb-20" >

        <h2 id="sign-in-options-heading" className="text-[24px] font-[600] font-inter" >Sign in to your YOWS account!</h2>

        <input
          type="email"
          required
          placeholder="Email address"
          onChange={assertSignInDataValid}
          id="sign-in-email"
          className='max-w-[80%] w-full text-white dark:text-black placeholder:text-white dark:placeholder:text-black text-start border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 h-[40px]'
        />

        <input
          type="password"
          required
          placeholder="Password"
          onChange={assertSignInDataValid}
          id="sign-in-password"
          className='max-w-[80%] w-full text-white dark:text-black placeholder:text-white dark:placeholder:text-black text-start border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 h-[40px]'
        />

        <h3 id="sign-in-error" className="hidden text-red-500 text-[14px] font-[500] w-[90%]" >
          {signInError}
        </h3>

        {
          signInDataValid ? 
          (
            <button id="sign-in-submit" onClick={async (e) => { await signUserIn(e); } }
              className='relative dark:hover:animate-navColorFadeLight dark:hover:text-black hover:animate-navColorFadeDark hover:text-white border-[1px] rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] w-[100px] h-[45px] text-center font-[600]'  >
              Submit
            </button>
          ):
          (
            <button id="sign-in-submit_disabled" disabled
              className='relative cursor-not-allowed border-[1px] rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] w-[100px] h-[45px] text-center font-[600]'  >
              Submit
            </button>
          )
        }

        <Link href={"?mode=up"} id="sign-up-toggle" className="text-[16px] font-[400]" >
          Don't have an Account yet? <span className="underline font-[600]" >Sign up!</span>
        </Link>
      </form>

      <form id="sign-up-form" onSubmit={async (e) => { await signUserUp(e); }} className=" hidden flex flex-col items-center w-full h-auto gap-y-3 mb-20" >

        <h2 id="sign-in-options-heading" className="text-[24px] font-[600] font-inter" >Create your own YOWS account!</h2>

        <input
          type="email"
          required
          placeholder="Email address"
          id="sign-up-email"
          onChange={assertSignUpDataValid}
          className='max-w-[80%] w-full text-white dark:text-black placeholder:text-white dark:placeholder:text-black text-start border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 h-[40px]'
        />

        <input
          type="password"
          required
          placeholder="Password"
          id="sign-up-password"
          onChange={assertSignUpDataValid}
          className='max-w-[80%] w-full text-white dark:text-black placeholder:text-white dark:placeholder:text-black text-start border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 h-[40px]'
        />

        <input
          type="password"
          required
          placeholder="Enter password again"
          id="sign-up-password-reenter"
          onChange={assertSignUpDataValid}
          className='max-w-[80%] w-full text-white dark:text-black placeholder:text-white dark:placeholder:text-black text-start border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 h-[40px]'
        />

        <input
          type="text"
          required
          placeholder="Username/Alias"
          id="sign-up-alias"
          onChange={assertSignUpDataValid}
          className='max-w-[80%] w-full text-white dark:text-black placeholder:text-white dark:placeholder:text-black text-start border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 h-[40px]'
        />
        
        <h3 id="sign-up-error" className="hidden text-red-500 text-[14px] font-[500] w-[90%]" >
          {signUpError}
        </h3>

        {
          signUpDataValid ? 
            (
              <button id="sign-up-submit" onClick={async (e) => { await signUserUp(e); }}
                className='relative dark:hover:animate-navColorFadeLight dark:hover:text-black hover:animate-navColorFadeDark hover:text-white border-[1px] rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] w-[100px] h-[45px] text-center font-[600]'  >
                Submit
              </button>
            )
            :
            (
              <button id="sign-up-submit_disabled" disabled
                className='relative cursor-not-allowed border-[1px] rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] w-[100px] h-[45px] text-center font-[600]'  >
                Submit
              </button>
            )
        }

        <Link href={"?mode=in"} id="sign-in-toggle" className="text-[16px] font-[400]" >
          Already have an account? <span className="underline font-[600]" >Sign in!</span>
        </Link>
      </form>

      <button id="sign-in-with-google" onClick={async (e) => { await signIn(providers.google.id); }}
        className='flex flex-row items-center gap-x-2 justify-between border-2 rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] max-w-[80%] w-full h-auto text-center font-[600]'  >
        <Image
          src="/assets/icons/providers/google.svg"
          alt="google provider icon"
          id="google-provider"
          className="height-auto width-auto"
          width={40}
          height={40}
        />
        {`Sign ${urlQueryParams.get("mode")} with google`}
      </button>

    </div>
  );
};

export default SignUp;
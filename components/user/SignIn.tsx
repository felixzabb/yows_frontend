"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import errorCodes from "@docs/errorCodes.json"
import { resetInputElementValue } from "@utils/htmlAbstractions";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { passwordSchema, signInDataSchema } from "@schemas/authSchemas";
import Link from "next/link";

const SignIn = () => {

  const { push } = useRouter();

  const [ signInData, setSignInData ] = useState<SignInData>({ email: "", password: "" });
  const [ signInError, setSignInError ] = useState("");

  const signInEmailValid = z.string().email().safeParse(signInData.email).success;
  const signInPasswordValid = passwordSchema.safeParse(signInData.password).success;
  const signInDataValid = signInDataSchema.safeParse(signInData).success;

  const signUserIn = async () : Promise<void> => {

    const signInOperation = await signIn("credentials", {
      redirect: false,
      email: signInData.email,
      password: signInData.password,
    });

    if(!signInOperation.ok){

      const errorCode = signInOperation.error;
      const errorPath = errorCode.split("-");
      const errorData = errorCodes?.[errorPath[0]]?.[errorPath[1]]?.[errorPath[2]];


      setSignInError(() => {
        if(!errorData){
          return "An unexpected error occurred";
        }
        return errorData.message;
      });

      resetInputElementValue({ elementId: "sign-in-password" });

      return;
    };

    push("/");
  };

  const handleSignInDataChange = ({ paramName, value } : { paramName : "email" | "password", value : string }) : void => {

    setSignInError("");
    
    const signInDataCopy = signInData;
    signInDataCopy[paramName] = value;
    
    setSignInData({ ...signInDataCopy });
  };

  return (
    <form onSubmit={ async (e) => { e.preventDefault(); await signUserIn(); }} className="flex flex-col items-center w-full h-[400px] gap-y-3" >

      <h2 className="text-[24px] font-[600] font-inter" >Sign in to your YOWS account!</h2>

      <input type="email"
        required
        placeholder="Email address"
        value={signInData.email}
        onChange={(e) => { handleSignInDataChange({ paramName: "email", value: e.target.value }); }}
        id="sign-in-email"
        className={`max-w-[80%] text_color_rev w-full text-start border-2 rounded-lg bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 h-[40px] ${signInData.email === "" ? "border_neutral_rev" : (signInEmailValid ? "border_valid" : "border_invalid")} `}
      />

      <input type="password"
        required
        placeholder="Password"
        value={signInData.password}
        onChange={(e) => { handleSignInDataChange({ paramName: "password", value: e.target.value }); }}
        id="sign-in-password"
        className={`max-w-[80%] text_color_rev w-full text-start border-2 rounded-lg bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 h-[40px] ${signInData.password === "" ? "border_neutral_rev" : (signInPasswordValid ? "border_valid" : "border_invalid")} `}
      />

      <h3 className="text-red-500 text-[14px] text-center font-[500] w-[90%]" >
        {signInError}
      </h3>

      {
        signInDataValid ? 
        (
          <button onClick={async (e) => { e.preventDefault(); await signUserIn(); } }
            className='dark:hover:animate-navColorFadeLight dark:hover:text-black hover:animate-navColorFadeDark hover:text-white border-[1px] rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] w-[100px] h-[45px] text-center font-[600]'  >
            Submit
          </button>
        ):
        (
          <button disabled
            className='cursor-not-allowed border-[1px] rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] w-[100px] h-[45px] text-center font-[600]'  >
            Submit
          </button>
        )
      }

      <Link href={"?mode=up"} className="text-[16px] font-[400]" >
        Don't have an Account yet? <span className="underline font-[600]" >Sign up!</span>
      </Link>

    </form>
  );
};

export default SignIn;
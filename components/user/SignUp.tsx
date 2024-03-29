"use client";

import { CreateUserCall } from "@utils/apiCalls";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import errorCodes from "@docs/errorCodes.json";
import { z } from "zod";
import { passwordSchema, signUpDataSchema } from "@schemas/authSchemas";

const SignUp = () => {

  const { push } = useRouter();

  const [ signUpData, setSignUpData ] = useState<SignUpData>({ email: "", passwordConfirm: "", password: "", alias: "" });
  const [ signUpError, setSignUpError ] = useState("");

  const signUpEmailValid = z.string().email().safeParse(signUpData.email).success;
  const signUpPasswordValid = passwordSchema.safeParse(signUpData.password).success;
  const signUpPasswordReenterValid = passwordSchema.safeParse(signUpData.passwordConfirm).success;
  const signUpAliasValid = true; // Add validation through backend
  const signUpDataValid = signUpDataSchema.safeParse(signUpData).success;

  const signUserUp = async () : Promise<void> => {

    const createUserOperation = await CreateUserCall({
      provider: "credentials",
      email: signUpData.email,
      password: signUpData.password,
      alias: signUpData.alias,
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

      return;
    };

    const signInOperation = await signIn("credentials", {
      redirect: false,
      email: signUpData.email,
      password: signUpData.password,
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

      return;
    };

    push("/");
  };

  const handleSignUnDataChange = ({ paramName, value } : { paramName : "email" | "passwordConfirm" | "password" | "alias", value : string }) : void => {

    setSignUpError("");

    const signUpDataCopy = signUpData;
    signUpDataCopy[paramName] = value;
    
    setSignUpData({ ...signUpDataCopy });

    if(signUpData.password !== signUpData.passwordConfirm){ setSignUpError("Password fields don't match!"); };
  };

  return (
    <form onSubmit={async (e) => { e.preventDefault(); await signUserUp(); }} className=" flex flex-col items-center w-full h-[400px] gap-y-3" >

      <h2 className="text-[24px] font-[600] font-inter" >Create your own YOWS account!</h2>

      <input type="email"
        required
        placeholder="Email address"
        id="sign-up-email"
        value={signUpData.email}
        onChange={(e) => { handleSignUnDataChange({ paramName: "email", value: e.target.value }); }}
        className={`max-w-[80%] text_color_rev w-full text-start border-2 rounded-lg bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 h-[40px] ${signUpData.email === "" ? "border_neutral_rev" : (signUpEmailValid ? "border_valid" : "border_invalid")} `}
      />

      <input type="password"
        required
        placeholder="Password"
        id="sign-up-password"
        onChange={(e) => { handleSignUnDataChange({ paramName: "password", value: e.target.value }); }}
        className={`max-w-[80%] text_color_rev w-full text-start border-2 rounded-lg bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 h-[40px] ${signUpData.password === "" ? "border_neutral_rev" : (signUpPasswordValid ? "border_valid" : "border_invalid")} `}
      />

      <input type="password"
        required
        placeholder="Confirm Password"
        id="sign-up-password-reenter"
        onChange={(e) => { handleSignUnDataChange({ paramName: "passwordConfirm", value: e.target.value }); }}
        className={`max-w-[80%] text_color_rev w-full text-start border-2 rounded-lg bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 h-[40px] ${signUpData.passwordConfirm === "" ? "border_neutral_rev" : (signUpPasswordReenterValid ? "border_valid" : "border_invalid")} `}
      />

      <input type="text"
        required
        placeholder="Username/Alias"
        id="sign-up-alias"
        onChange={(e) => { handleSignUnDataChange({ paramName: "alias", value: e.target.value }); }}
        className={`max-w-[80%] text_color_rev w-full text-start border-2 rounded-lg bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 h-[40px] ${signUpData.alias === "" ? "border_neutral_rev" : (signUpAliasValid ? "border_valid" : "border_invalid")} `}
      />
      
      <h3 className="text-red-500 text-[14px] text-center font-[500] w-[90%]" >
        {signUpError}
      </h3>

      {
        signUpDataValid ? 
          (
            <button onClick={async (e) => { e.preventDefault(); await signUserUp(); }}
              className='dark:hover:animate-navColorFadeLight dark:hover:text-black hover:animate-navColorFadeDark hover:text-white border-[1px] rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] w-[100px] h-[45px] text-center font-[600]'  >
              Submit
            </button>
          )
          :
          (
            <button disabled
              className='relative cursor-not-allowed border-[1px] rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] w-[100px] h-[45px] text-center font-[600]'  >
              Submit
            </button>
          )
      }

      <Link href={"?mode=in"} className="text-[16px] font-[400]" >
        Already have an account? <span className="underline font-[600]" >Sign in!</span>
      </Link>
    </form>
  );
};

export default SignUp;
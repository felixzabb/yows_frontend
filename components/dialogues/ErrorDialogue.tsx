"use client";

import Link from "next/link";
import errorCodes from "@docs/errorCodes.json";
import { useEffect, useState } from "react";

const ErrorDialogue = ({ errorCode, occurredWhile } : { errorCode : string, occurredWhile : string }) => {

  const [ errorData, setErrorData ] = useState<{ [index : string] : string | string[] } | null>(null);

  // Set the associated errorData every time the error code changes.
  useEffect(() => {

    const path = errorCode.split("-");
    const data = errorCodes[path[0]][path[1]][path[2]];

    setErrorData(data);
  }, [errorCode])

  if(!errorData){ return; };

  return (

    <div className="w-min min-w-[600px] h-auto flex flex-col items-start gap-y-2" >

      <h2 className=" w-full text-[20px] font-[500] font-inter text-center" >
        {`A unexpected error occurred while`} <span className="font-[600]" >{occurredWhile}</span>. <br />
      </h2>

      <p className="text-[18px] font-[400] text-start"> 
        <span className="font-[500]" >Probable cause:</span> {errorData.desc} <br />
      </p>

      <p className="text-[18px] font-[400] text-start"> 
        <span className="font-[500]" >Possible fix:</span> {errorData.possibleFix} <br />
      </p>

      <h3 className="text-[18px] font-[400] text-start"> 
        You can visit the <Link href={`/errors#${errorCode}`} prefetch rel="noopener noreferrer" target="_blank" className="font-[600] underline" > error page </Link> to learn about your error.
      </h3>

      <hr className="w-[110%] ml-[-5%] h-[1px] border-gray-600 dark:border-gray-300" />

      <div className="w-full h-auto flex flex-row items-center justify-between" >

        <h4 className="text-[20px] font-[600] text-start" >
          <span className=" text-[18px] font-[400]" >{"type: "}</span>{errorData.type}
        </h4>

        <h4 className="text-[20px] font-[600] text-start" >
          <span className=" text-[18px] font-[400]" >{"error_code: "}</span>{errorCode}
        </h4>

      </div>
    </div>

  );
};

export default ErrorDialogue;
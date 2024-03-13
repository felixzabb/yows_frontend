"use client";

import Link from "next/link";
import errorCodes from "@utils/errorCodes.json";
import { useEffect, useState } from "react";

const ErrorDialog = ({errorCode, occurredWhile} : {errorCode : string, occurredWhile : string}) => {

  const [errorData, setErrorData ] = useState<{[index : string] : string | string[]}>(null);

  useEffect(() => {

    const path = errorCode.split("-");
    const data = errorCodes[path[0]][path[1]][path[2]];

    setErrorData(data);
  }, [])

  if(errorData === undefined || errorData === null){
    return;
  };

  return (

    <div id="error-dialog-container" className="w-min min-w-[600px] h-auto flex flex-col items-start gap-y-2" >

      <h2 id="error-heading" className=" w-full text-[20px] font-[500] font-inter text-center" >
        {`A unexpected error occurred while`} <span className="font-[600]" >{occurredWhile}</span>. <br />
      </h2>

      <h3 id="error-desc" className="text-[18px] font-[400] text-start"> 
        <span className="font-[500]" >Probable cause:</span> {errorData.desc} <br />
      </h3>

      <h3 id="error-fix" className="text-[18px] font-[400] text-start"> 
        <span className="font-[500]" >Possible fix:</span> {errorData.possibleFix} <br />
      </h3>

      <h3 id="error-link" className="text-[18px] font-[400] text-start"> 
        You can visit the <Link href={`/errors#${errorCode}`} prefetch rel="noopener noreferrer" target="_blank" id="error-page-link" className="font-[600] underline" > error page </Link> to learn about your error.
      </h3>

      <hr id="error-separator" className="w-[110%] ml-[-5%] h-[1px] border-gray-600 dark:border-gray-300" />

      <div id="error-type/code-wrapper" className="w-full h-auto flex flex-row items-center justify-between" >
        <h3 id="error-type" className="text-[20px] font-[600] text-start" >
          <span className=" text-[18px] font-[400]" >{"type: "}</span>{errorData.type}
        </h3>

        <h3 id="error-type" className="text-[20px] font-[600] text-start" >
          <span className=" text-[18px] font-[400]" >{"error_code: "}</span>{errorCode}
        </h3>
      </div>
    </div>

  );
};

export default ErrorDialog;
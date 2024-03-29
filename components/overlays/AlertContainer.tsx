"use client";

import { alertContext } from "@components/layout/Provider";
import { useContext } from "react";


const AlertContainer = () => {

  const alertContextAccess = useContext<AlertContextValue>(alertContext)
  
  return (
    <div id="document-alert-container" className="z-[2000] fixed flex hidden items-center justify-center px-4 py-1 min-w-[50%] max-w-[90%] h-[5dvh] bg-blue-600 rounded-md top-[10px] z-100" >
      <p className="text-[20px] text-center text-text-color-light dark:text-text-color-dark " >
        {alertContextAccess?.data.text}
      </p>
    </div>
  );
};

export default AlertContainer;
"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ErrorDialogue from "../dialogues/ErrorDialogue";
import { hideElement, showElement } from "@utils/htmlAbstractions";
import { removeQueryParamsByKey } from "@utils/generalUtils";
import { overlayContext } from "@components/layout/Provider";

const OverlayContainer = () => {

  const overlayContextAccess = useContext<OverlayContextValue>(overlayContext);

  const { push } = useRouter();

  const urlQueryParams = useSearchParams();
  const pathName = usePathname()
  
  const [ borderColor, setBorderColor ] = useState({
    dark: "border-gray-300",
    light: "border-gray-600"
  });

  const closeOverlay = () : void => {

    setBorderColor((prevBorderColor) => ({
      ...prevBorderColor,
      dark: "border-gray-300",
      light: "border-gray-600"
    }));

    hideElement({elementId: "document-overlay-container"});

    push(`?${removeQueryParamsByKey({ queryParams: urlQueryParams, keys: ["app_error", "e_while"] })}${window.location.hash}`);
  };

  // Always close overlay on route change.
  useEffect(() => {

    closeOverlay();
  }, [pathName])

  // Check if an error occurred every time the query string changes.
  useEffect(() => {

    const appError = urlQueryParams.get("app_error");
    const occurredWhile = urlQueryParams.get("e_while");

    if(appError && occurredWhile){

      overlayContextAccess.change({
        element: <ErrorDialogue errorCode={appError} occurredWhile={occurredWhile} />, 
        title: "An error occurred!"
      });

      setBorderColor({
        dark: "border-red-800",
        light: "border-red-800",
      });

      showElement({ elementId: "document-overlay-container" });
    };

  }, [urlQueryParams]);

  return (
    <section id="document-overlay-container" className={` hidden z-[1000] flex flex-col items-center pt-[100px] fixed w-[100dvw] h-[100dvh] top-0 left-0 backdrop-blur-sm `} >
      
      <div className={` gap-y-2 min-w-[45dvw] w-max max-w-[95dvw] h-max max-h-[80dvh] overflow-hidden border-2 dark:${borderColor.dark} ${borderColor.light} bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg flex flex-col items-center p-2 rounded-xl `} >

        <div className='w-full h-auto flex flex-row items-center justify-between' >

          <h2 className='w-max h-[30px] text-[18px] font-[500] text-start' >
            {overlayContextAccess.data?.title} 
          </h2>

          <button 
            className='border-[1px] flex items-center text-center dark:border-gray-300 border-gray-600 text-[16px] font-[600] w-[50px] h-[30px] p-1 rounded-lg'
            onClick={() => { closeOverlay(); }} 
          >
            Close
          </button>

        </div>

        <hr className='border-[1px] h-[1px] border-black dark:border-white w-full rounded-3xl opacity-20' />

        {overlayContextAccess.data?.element}

      </div>

    </section>
  );
};

export default OverlayContainer;
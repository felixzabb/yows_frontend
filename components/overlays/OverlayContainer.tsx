"use client";

import { useContext, useEffect, useState } from "react";
import { appContext } from "@app/layout";
import { useSearchParams, useRouter } from "next/navigation";
import ErrorDialog from "./ErrorDialog";
import { CustomAppContext } from "@custom-types";
import { hideElement } from "@utils/elementFunction";

const OverlayContainer = () => {

  const context : CustomAppContext = useContext(appContext);
  const urlQueryParams = useSearchParams();
  const { push } = useRouter();

  const [ overlay, setOverlay ] = useState({element: <></>, title: ""});

  const closeOverlay = () : void => {

    /**
     * if(urlQueryParams.has("app_error")){
      
    }
     */
    push("?")
    hideElement({elementId: "document-overlay-container"});
  };

  useEffect(() => {
 
    const possibleError = urlQueryParams.get("app_error");
    const errorOccurredWhile = urlQueryParams.get("e_while");
    if(possibleError && errorOccurredWhile){

      const overlayContainer = window.document.getElementById("document-overlay-container")
      if(overlayContainer){ 

        setOverlay({element: <ErrorDialog errorCode={possibleError} occurredWhile={errorOccurredWhile} />, title: "An error occurred!"});
        overlayContainer.classList.remove("hidden");
      };
    };

  }, [urlQueryParams]);

  useEffect(() => {
    if(!urlQueryParams.get("app_error")){
      setOverlay(context.appContextData.overlay);
    };
  }, [context]);

  return (
    <section id="document-overlay-container" className=' hidden z-[1000] flex flex-col items-center pt-[10dvh] fixed w-[100dvw] h-[100dvh] top-0 left-0 backdrop-blur-sm ' >
      <div id="overlay-content-container" className=' gap-y-2 min-w-[45dvw] w-max max-w-[95dvw] h-max max-h-[80dvh] overflow-hidden border-2 dark:border-gray-300 border-gray-600 bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg flex flex-col items-center p-2 rounded-xl ' >

        <div id="overlay-general-options-container" className= 'w-full h-auto flex flex-row items-center justify-between' >

          <h2 id="overlay-content-title" className='w-max h-[30px] text-[18px] font-[500] text-start' >
            {overlay?.title} 
          </h2>

          <button id="close-overlay-button" className='border-[1px] flex items-center text-center dark:border-gray-300 border-gray-600 text-[16px] font-[600] w-[50px] h-[30px] p-1 rounded-lg'
            onClick={() => { closeOverlay(); }} >
            Close
          </button>
        </div>

        <hr id="overlay-options-separator" className='border-[1px] h-[1px] border-black dark:border-white w-full rounded-3xl opacity-20' />

        {overlay?.element}

      </div>
    </section>
  );
};

export default OverlayContainer;
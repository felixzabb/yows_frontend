"use client";
import { useEffect, useContext } from "react";
import { appContext } from "@app/layout";
import { AppContextData } from "@custom-types";
import ErrorDialog from "@components/overlays/ErrorDialog";
import { showElement } from "@utils/elementFunction";
import { showOverlay } from "@utils/generalFunctions";

const page = () => {
  
  const context = useContext(appContext);

  const testFunction = () => {

    context.setAppContextData((prevAppContextData : AppContextData) => ({
      ...prevAppContextData,
      overlay: {
        ...prevAppContextData.overlay,
        element: <ErrorDialog errorCode="AUTH-SIGNIN-3" occurredWhile="OAUTH" />,
        title: "Test title",
      }
    }));

    showElement({elementId: "document-overlay-container"});
  };

  useEffect(() => {
    console.log("updated context");
    console.log(context);
  }, [context])

  useEffect(() => {
    console.log("Initial mount");
    console.log(context);
    showOverlay({context: context, title: "Testing", element: <ErrorDialog errorCode="AUTH-SIGNIN-3" occurredWhile="OAUTH" />});
  }, [])

  return (
    <div id="testing-container" className="flex flex-col items-center p-10 w-full h-full" >
      <button id="test-button" className="purple_btn" onClick={testFunction} >
        Test
      </button>

    </div>
  )
}

export default page
"use client";

import { useEffect, createContext, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { determineColorMode } from '@utils/generalFunctions';
import { AppContextData } from '@custom-types';

export const appContext = createContext(null);

const Provider = ({children, session } : {children : any, session? : any}) => {

  const [appContextData, setAppContextData ] = useState<AppContextData>({
    colorMode: "light",
    alert : {
      text: "This is an alert text.",
      color: "",
    },
    overlay: {
      element: null,
      title: "",
      data: {
        results: [{scrape_runs: []}],
      },
    },
    enabledFeatures : {
      test: 0,
    },
  });

  useEffect(() => {

    const colorMode = determineColorMode();
    window.document.getElementById("html-elm").classList.add(colorMode)
    
    setAppContextData((prevAppContext) => { 
      prevAppContext.colorMode = colorMode
      return prevAppContext; 
    });
    
  }, []);

  return (
    <SessionProvider session={session} >
      <appContext.Provider value={{appContextData: appContextData, setAppContextData: setAppContextData}}>
        {children}
      </appContext.Provider>
    </SessionProvider>
  );
};

export default Provider;
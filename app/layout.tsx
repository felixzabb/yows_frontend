"use client";

import '@styles/globals.css';
import Provider from '@components/logic/Provider';
import { Suspense } from 'react';
import Loading from './loading';
import Footer from '@components/layout/Footer';
import { determineColorMode } from '@utils/generalFunctions';
import { useEffect, useState, createContext } from 'react';
import TopNav from '@components/layout/TopNav';
import { AppContextData } from '@custom-types';
import OverlayContainer from '@components/overlays/OverlayContainer';

export const appContext = createContext(null);

const RootLayout = ({ children }) => {

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
    <html id="html-elm" lang="en" >
      <body id={"document-body"} className={'relative flex flex-col items-center justify-start min-h-[calc(100dvh+150px)] h-max w-[100dvw] bg-primary-light-bg dark:bg-primary-dark-bg z-0'} >
        <appContext.Provider value={{appContextData: appContextData, setAppContextData: setAppContextData}}>
          <Provider>
            
            <header id="document-header" className="flex flex-col items-center w-full h-auto pt-2 h-aut bg-header-light-bg dark:bg-header-dark-bg" >
              <TopNav />
              <hr id="topNav-separator" className=" border-[1px] border-gray-400 w-full mt-2 ring-[0.4px] rounded-full " />
            </header>

            <main id="document-main" className="flex flex-col items-center justify-start w-[100dvw] min-h-[80dvh] h-max z-0">

              <div id="document-alert-container" className="z-[2000] fixed flex hidden items-center justify-center px-4 py-1 min-w-[50%] max-w-[90%] h-[5dvh] bg-blue-600 rounded-md top-[10px] z-100" >
                <p id={"alert-text"} className="text-[20px] text-center text-text-color-light dark:text-text-color-dark " >
                  {appContextData.alert.text}
                </p>
              </div>
              
              <Suspense fallback={ <Loading /> } >

                <OverlayContainer />

                {children}
              </Suspense>
            </main>

            <footer id="document-footer" className='absolute bottom-0 max-h-[150px] h-[150px] z-[-1] pb-5' >
              <Footer />
            </footer>

          </Provider>
        </appContext.Provider>
      </body> 
    </html>
  );
};

export default RootLayout;


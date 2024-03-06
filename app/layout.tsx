"use client";

import '@styles/globals.css';
import Provider from '@components/logic/Provider';
import { Suspense } from 'react';
import Loading from './loading';
import Footer from '@components/layout/Footer';
import { determineAndSetColorMode } from '@utils/generalFunctions';
import { useEffect, useState, useContext, createContext } from 'react';
import { showHideElement } from '@utils/generalFunctions';
import TopNav from '@components/layout/TopNav';
import { AppContextData } from '@custom-types';

export const appContext = createContext(null);

const RootLayout = ({ children }) => {

  const [appContextData, setAppContextData ] = useState<AppContextData>({
    colorMode: "light",
    alertData : {
      text: "This is an alert text.",
      color: "",
    },
    overlayChild: null,
    overlayChildTitle: "",
    overlayChildData: {results: {
      empty: true,
      0 : {
        scrape_runs : {0 : []}
      }
    }}

  });
  const [updateContext, setUpdateContext ] = useState(3);

  useEffect(() => {

    /**
     * const bodyHeight = Math.max(1000, (window.visualViewport.height+260));
    window.document.getElementById("documentBody").style.height = String(bodyHeight + "px");
     */
    setAppContextData((prevAppContext) => { 
      prevAppContext.colorMode = determineAndSetColorMode()
      return prevAppContext; 
    });
  }, []);

  useEffect(()=>{
    console.log(appContextData)
  })

  return (
    <html id="html-elm" lang="en" >
      <body id={"document-body"} className={'relative flex flex-col items-center justify-start h-auto min-h-[calc(100dvh+260px)] w-[100dvw] bg-primary-light-bg dark:bg-primary-dark-bg z-0'} >
        <appContext.Provider value={{appContextData: appContextData, setAppContextData: setAppContextData, updateContext: setUpdateContext}}>
          <Provider>

            <header id="document-header" className="flex flex-col items-center w-full h-auto pt-2 h-aut bg-header-light-bg dark:bg-header-dark-bg" >
              <TopNav />
              <hr id="topNav-separator" className=" border-[1px] border-gray-400 w-full mt-2 ring-[0.4px] rounded-full " />
            </header>

            <main id="document-main" className="flex flex-col items-center justify-start w-[100dvw] h-[100dvh] z-0">

              <div id="document-alert-container" className="z-[2000] fixed flex hidden items-center justify-center px-4 py-1 min-w-[50%] max-w-[90%] h-[5dvh] bg-blue-600 rounded-md top-[10px] z-100" >
                <p id={"alert-text"} className="text-[20px] text-center text-text-color-light dark:text-text-color-dark " >
                  {appContextData.alertData.text}
                </p>
              </div>

              <section id="document-overlay-container" className=' hidden z-[1000] flex flex-col items-center pt-[10dvh] fixed w-[100dvw] h-[100dvh] top-0 left-0 backdrop-blur-sm ' >

                <div id="overlay-content-container" className=' gap-y-2 min-w-[45dvw] w-max max-w-[95dvw] h-max max-h-[80dvh] overflow-hidden border-2 dark:border-gray-300 border-gray-600 bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg flex flex-col items-center p-2 rounded-xl ' >

                  <div id="overlay-general-options-container" className= 'w-full h-auto flex flex-row items-center justify-between' >

                    <h2 id="overlay-content-title" className='w-max h-[30px] text-[18px] font-[500] text-start' > {appContextData.overlayChildTitle} </h2>

                    <button id="close-overlay-button" className='border-[1px] flex items-center text-center dark:border-gray-300 border-gray-600 text-[16px] font-[600] w-[50px] h-[30px] p-1 rounded-lg'
                      onClick={() => { showHideElement({elementId: "document-overlay-container"}) }} >
                      Close
                    </button>
                  </div>

                  <hr id="overlay-options-separator" className='border-[1px] h-[1px] border-black dark:border-white w-full rounded-3xl opacity-20' />

                  {appContextData.overlayChild}
                </div>
                
              </section>

              <Suspense fallback={ <Loading /> } >
                {children}
              </Suspense>
            </main>

            <footer id="document-footer" className='flex absolute max-h-[200px] h-[200px] bottom-0 z-[-1]' >
              <Footer />
            </footer>

          </Provider>
        </appContext.Provider>
      </body> 
    </html>
  );
};

export default RootLayout;


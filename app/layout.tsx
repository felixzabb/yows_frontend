"use client";

import '@styles/globals.css';
import Provider from '@components/layout/Provider';
import { Suspense } from 'react';
import Loading from './loading';
import Footer from '@components/layout/Footer';
import TopNav from '@components/layout/TopNav';
import OverlayContainer from '@components/overlays/OverlayContainer';
import AlertContainer from '@components/overlays/AlertContainer';

const RootLayout = ({ children }) => {

  return (
    <html id="html-elm" lang="en" >
      <body className={'relative flex flex-col items-center justify-between min-h-[calc(100dvh+150px)] h-max w-[100dvw] bg-primary-light-bg dark:bg-primary-dark-bg z-0'} >
        <Provider>
          
          <header id="document-header" className="z-[5000] flex flex-col items-center w-full h-auto pt-2 bg-header-light-bg dark:bg-header-dark-bg" >
            <TopNav />
          </header>

          <main id="document-main" className="flex flex-col items-center justify-start w-[100dvw] min-h-[80dvh] h-fit z-0">
            
            <Suspense fallback={ <Loading /> } >

              <AlertContainer />
              <OverlayContainer />

              {children}

            </Suspense>
          </main>

          <footer id="document-footer" className=' max-h-[150px] h-[150px] z-[-1] pb-5' >
            <Footer />
          </footer>

        </Provider>
      </body> 
    </html>
  );
};

export default RootLayout;


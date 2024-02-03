
import '@styles/globals.css';
import Nav from '@components/Nav';
import Provider from '@components/Provider';
import { Suspense } from 'react';
import Loading from './loading';
import Footer from '@components/Footer';


const RootLayout = ({ children }) => {

  return (
    <html lang="en" >
      <body className={' min-h-[150dvh] relative h-full w-[100dvw] bg-primary-bg flex flex-col items-center justify-start z-0'}id={"documentBody"} >

        <Provider>

          <header className="layout_nav_header c_col_elm">
            <Nav /> 
          </header>

          

            <main className="layout_main c_col_elm z-0"  id={"documentMain"}>
              <Suspense fallback={ <Loading /> } >

                {children}

              </Suspense>
            </main>

          <footer className='flex absoloute bottom-0 mt-[100dvh] ' >          
            <Footer />
          </footer>

        </Provider>

      </body> 
    </html>
  );
};

export default RootLayout;
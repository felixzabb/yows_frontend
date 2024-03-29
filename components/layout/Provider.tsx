"use client";

import { useEffect, createContext, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { determineColorMode } from '@utils/generalUtils';

export const themeContext = createContext(null);
export const overlayContext = createContext(null);
export const alertContext = createContext(null);

const Provider = ({ children, session } : { children : any, session? : any }) => {

  const [ theme, setTheme ] = useState<ThemeContextData>("light");
  const [ overlayData, setOverlayData ] = useState<OverlayContextData>({ title: "", element: null });
  const [ alertData, setAlertData ] = useState<AlertContextData>({ text: "", color: "neutral" });

  // Determine the theme when themeContext loads and set it.
  useEffect(() => {

    const colorMode = determineColorMode();
    
    window.document.getElementById("html-elm").classList.add(colorMode)
    setTheme(colorMode);
    
  }, [themeContext]);

  // Functions defined here for easier expandability.

  const changeOverlayData = ({ title, element } : OverlayContextData) : void => {
    
    setOverlayData({
      title: title,
      element: element
    });
  };

  const changeAlertData = ({ text, color } : AlertContextData) : void => {
    
    setAlertData({
      text: text,
      color: color
    });
  };

  const changeTheme = (theme : ThemeContextData) : void => {

    setTheme(theme);
  };

  return (
    <SessionProvider session={session} >
      <themeContext.Provider value={{ data: theme, change: changeTheme } as ThemeContextValue} >
        <overlayContext.Provider value={{ data: overlayData, change: changeOverlayData } as OverlayContextValue} >
          <alertContext.Provider value={{ data: alertData, change: changeAlertData } as AlertContextValue} >
            {children}
          </alertContext.Provider>
        </overlayContext.Provider>
      </themeContext.Provider>
    </SessionProvider>
  );
};

export default Provider;
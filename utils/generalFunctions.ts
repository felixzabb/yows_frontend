import { AppContextData, ScrapedData, CustomAppContext } from "@custom-types";
import { hideElement, showElement } from "./elementFunction";

export const handleWindowClose = (e : BeforeUnloadEvent) : string => {
  e.preventDefault();
  return "";
};

export const determineColorMode = () : "dark" | "light" => {
  const possibleMode = window.localStorage.getItem("colorMode");

  if(possibleMode === null){
    window.localStorage.setItem("colorMode", "light");
    return "light";
  };
  if(possibleMode === "dark"){
    return "dark";
  };
  return "light";
};

export const createAlert = ({context, textContent, duration, color} : {context : CustomAppContext, textContent : string, duration: number, color : string}) : void => {

  context.setAppContextData((prevAppContextData : AppContextData) => ({
    ...prevAppContextData,
    alert: {
      text: textContent,
      color: color,
    },
  }));

  showElement({elementId: "document-alert-container"});
  setTimeout(() => { hideElement({elementId: "document-alert-container"}); }, duration);
};

export const showOverlay = ({context, title, element} : {context : CustomAppContext, title : string, element: JSX.Element}) : void => {

  const newOverlay : {element: JSX.Element | null, title : string} = {
    element: element,
    title: title,
  };

  context.setAppContextData((prevAppContextData : AppContextData) => ({
    ...prevAppContextData,
    overlay: newOverlay
  }));

  showElement({elementId: "document-overlay-container"});
};



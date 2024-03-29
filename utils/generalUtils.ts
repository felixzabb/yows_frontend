import { hideElement, showElement } from "./htmlAbstractions";
import { ReadonlyURLSearchParams } from "next/navigation";

export const handleWindowClose = (e : BeforeUnloadEvent) : string => {
  e.preventDefault();
  return "";
};

export const determineColorMode = () : "dark" | "light" => {

  const colorMode = window.localStorage.getItem("colorMode");

  if(!colorMode || !["light", "dark"].includes(colorMode)){
    window.localStorage.setItem("colorMode", "light");
    return "light";
  };

  return colorMode as "dark" | "light";
};

export const createAlert = ({ context, textContent, duration, color } : { context : AlertContextValue, textContent : string, duration: number, color : "red" | "green" | "neutral" }) : void => {

  context.change({
    text: textContent,
    color: color,
  });

  showElement({elementId: "document-alert-container"});

  setTimeout(() => { hideElement({elementId: "document-alert-container"}); }, duration);
};

export const showOverlay = ({ context, title, element } : { context : OverlayContextValue, title : string, element: JSX.Element }) : void => {

  context.change({
    element: element,
    title: title,
  });

  showElement({elementId: "document-overlay-container"});
};

export const removeQueryParamsByKey = ({ queryParams, keys } : { queryParams: ReadonlyURLSearchParams, keys: string[] }) : string => {
    
  let newQueryString = "";

  for(const key of Array.from(queryParams.keys())){

    if(!keys.includes(key)){
      newQueryString += `${key}=${queryParams.get(key)}&`;
    };
  };

  return newQueryString;
};

export const actionRuntime = ({ type, data, as } : { type : ActionName, data : string | number | string[] | number[], as : ScraperDataType }) : number => {

  try{

    if(as === "json"){

      let cumJsonTime : number = 0;

      for(const item of data as string[] | number[]){
        cumJsonTime += actionRuntime({ type: type, data: item, as: "text" });
      };
      
      return cumJsonTime;
    }
    else if(as === "csv"){

      let cumCsvTime : number = 0;

      for(const item of data as string[]){
        cumCsvTime += actionRuntime({ type: type, data: item, as: "text" });
      };
      
      return cumCsvTime;
    };
  }
  catch{
    return 5;
  }

  const actionRuntimes = {
    "scrape": 1,
    "button-press": 1,
    "input-fill": 1,
    "wait": Number(data)
  };

  return actionRuntimes[type];
};

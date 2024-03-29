"use client";

import { hideElement } from "@utils/htmlAbstractions";
import { useEffect, useState } from "react";

const LoadScraperDialogue = ({ loadScraper } : 
  { 
    loadScraper : ({ scraperId, withScrapedData, confirmNeeded } : { scraperId : string, withScrapedData : boolean, confirmNeeded? : boolean }) => Promise<boolean>
  }) => {

  const [ loadScraperData, setLoadScraperData ] = useState<{ scraperId: string, withScrapedData: boolean }>({ scraperId: "", withScrapedData: false });
  const [ loadScraperError, setLoadScraperError ] = useState("");

  // 22 is the length of a MongoDb _id
  const loadScraperDataValid = loadScraperData.scraperId.length === 22;
  
  // Check and show if input is valid.
  useEffect(() => {
    
    if(loadScraperData.scraperId.length !== 0 && loadScraperData.scraperId.length !== 22){ 
      setLoadScraperError("ID needs to be a 22 character string!"); 
    }
    else{ 
      setLoadScraperError(""); 
    };
  }, [loadScraperData.scraperId]);

  const submit = async () : Promise<void> => { 
        
    const loaded = await loadScraper({
      scraperId: loadScraperData.scraperId, 
      withScrapedData: loadScraperData.withScrapedData, 
      confirmNeeded: true
    });

    if(!loaded){
      setLoadScraperError("Couldn't load scraper, please try again!");
      return; 
    };

    const form = window.document.getElementById("load-scraper-form") as HTMLFormElement;
    form.reset();

    hideElement({ elementId: "document-overlay-container" });
  };

  const handleLoadScraperDataChange = ({ paramName, value } : { paramName: "scraperId" | "withScrapedData", value: string | boolean }) : void => {

    setLoadScraperData((prevLoadScraperData) => ({
      ...prevLoadScraperData,
      [paramName]: value
    }));
  };

  return (

    <form onSubmit={async (e) => { e.preventDefault(); await submit(); }} className="flex flex-col items-center justify-start gap-y-8 w-full h-max " >

      <h3 className="text-[20px] font-[600] " >
        Please enter the ID of the scraper.
      </h3>

      <div className="flex flex-col items-center gap-y-4 w-full h-auto gap-x-4 p-1" >

        <input type="text" 
          maxLength={24} 
          placeholder="Scraper ID" 
          required
          value={loadScraperData.scraperId}
          onChange={(e) => { handleLoadScraperDataChange({ paramName: "scraperId", value: e.target.value }); }}
          className={`min-w-[60%] w-auto text_color_rev text-start border-2 rounded-lg bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 h-[40px] ${loadScraperData.scraperId.length === 0 ? "border_neutral_rev" : (loadScraperDataValid ? "border_valid" : "border_invalid")} `}
        />

        <label className="inline-flex items-center cursor-pointer">

          <h3 className="pr-4 text-[18px] text-start font-[600] mb-[6px]" >Load results:</h3>

          <input type="checkbox" 
            className="sr-only peer"
            onChange={(e) => { handleLoadScraperDataChange({ paramName: "withScrapedData", value: e.target.checked}); }}
          />

          <div className="relative w-11 h-6 bg-stone-400 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
        
        </label>

        <h2 className=" text-red-500 text-center text-[14px] font-[500] w-[90%] h-[26px]" >
          {loadScraperError}
        </h2>

      </div>
      
      {
        loadScraperDataValid ? 
          (
            <button 
              className='dark:hover:animate-navColorFadeLight dark:hover:text-black hover:animate-navColorFadeDark hover:text-white border-[1px] rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] w-[100px] h-[45px] text-center font-[600]' 
              onClick={async (e) => { e.preventDefault(); await submit(); }} 
            >
              Submit
            </button>
          )
          :
          (
            <button className='border-[1px] rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] w-[100px] h-[45px] text-center font-[600] cursor-not-allowed' disabled >
              Submit
            </button>
          )
      }

    </form>
  );
};

export default LoadScraperDialogue;
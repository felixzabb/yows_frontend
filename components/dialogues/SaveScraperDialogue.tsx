"use client";

import { hideElement } from "@utils/htmlAbstractions";
import { useContext, useEffect, useState } from "react";
import { showOverlay } from "@utils/generalUtils";
import { overlayContext } from "@components/layout/Provider";

const SaveScraperDialogue = ({ userData, scrapedData, saveScraper } : 
  {
    userData : ScraperUserData | null, 
    scrapedData : ScrapedData
    saveScraper : ({ name, description, saveScrapedData } : { name : string, description : string, saveScrapedData? : boolean }) => Promise<boolean>
  }) => {

  const overlayContextAccess = useContext<OverlayContextValue>(overlayContext);

  const [ saveScraperData, setSaveScraperData ] = useState<{ name: string, desc: string, saveScrapedData: boolean}>({ name: "", desc: "", saveScrapedData: false });
  const [ saveScraperError, setSaveScraperError ] = useState("");

  const saveScraperDataValid = saveScraperData.name.length >= 4;

  // Check and show if input is valid.
  useEffect(() => {

    if(saveScraperData.name.length !== 0 && saveScraperData.name.length < 4){ 
      setSaveScraperError("Name needs to be at least 4 characters long!");  
    }
    else{
      setSaveScraperError("");
    }
  }, [saveScraperData.name]);
  
  const submit = async () : Promise<void> => {

    if(userData.saved_scrapers.length >= userData.subscription.scraper_storage){

      showOverlay({
        context: overlayContextAccess, 
        title: "Can't save scraper!", 
        element: 
          <h2 className="text-[18px] font-[400] font-inter">
            {`You already have reached your limit for saved scrapers(${userData.saved_scrapers.length}).If you want to save more, please increase your limit at Profile > Subscription > scraper storage.`}
          </h2>
      });

      return;
    };

    const saved = await saveScraper({ 
      name: saveScraperData.name, 
      description: saveScraperData.desc, 
      saveScrapedData: saveScraperData.saveScrapedData,
    });

    if(!saved){
      setSaveScraperError("Couldn't save scraper, please try again!");
      return;
    };

    const form = window.document.getElementById("save-scrape-form") as HTMLFormElement;
    form.reset();

    hideElement({ elementId: "document-overlay-container" });
  };

  const handleSaveScraperDataChange = ({ paramName, value } : { paramName: string, value: string | boolean }) : void => {

    setSaveScraperData((prevSaveScraperData) => ({
      ...prevSaveScraperData,
      [paramName]: value
    }));
  };

  return (
    <form id={"save-scrape-form"} onSubmit={async (e) => { e.preventDefault(); await submit(); }} className="flex flex-col items-center justify-start gap-y-6 mt-3 w-full h-max " >

      <h2 className="text-[20px] font-[600] " >
        Please fill in a name and a description.
      </h2>

      <input type="text"
        required
        maxLength={32} 
        placeholder="Name"
        value={saveScraperData.name}
        onChange={(e) => { handleSaveScraperDataChange({ paramName: "name", value: e.target.value }); }}
        className={`min-w-[60%] w-auto text_color_rev text-start border-2 rounded-lg bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 h-[40px] ${saveScraperData.name.length === 0 ? "border_neutral_rev" : (saveScraperDataValid ? "border_valid" : "border_invalid")} `}
      />
      
      <textarea 
        maxLength={256}
        placeholder="Description"
        value={saveScraperData.desc}
        onChange={(e) => { handleSaveScraperDataChange({ paramName: "desc", value: e.target.value }); }}
        className="min-w-[60%] w-auto h-max min-h-[120px] text_color_rev text-start border-2 border_neutral bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 rounded-es-lg rounded-se-lg"
      />

      <label className={`inline-flex items-center ${scrapedData ? "cursor-pointer" : "cursor-not-allowed"}`}>

        <h3 className="pr-4 text-[18px] text-start font-[600] mb-[6px]" > Save results: </h3>

        <input type="checkbox" 
          className="sr-only peer" 
          disabled={scrapedData ? false : true}
          onChange={(e) => { handleSaveScraperDataChange({ paramName: "saveScrapedData", value: e.target.checked }); }}
          />

        <div className="relative w-11 h-6 bg-stone-400 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600" />
      
      </label>

      <h2 className=" text-center text-red-500 text-[14px] font-[500] w-[90%] h-[26px]" >
        {saveScraperError}
      </h2>

      {
        saveScraperDataValid ? 
          (
            <button 
              className='border-[1px] rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] w-[100px] h-[45px] text-center font-[600]' 
              onClick={async (e) => { e.preventDefault(); await submit(); }} 
            >
              Submit
            </button>
          )
          :
          (
            <button className='border-[1px] rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] w-[100px] h-[45px] text-center font-[600] cursor-not-allowed opacity-60' disabled >
              Submit
            </button>
          )
      }
      

    </form>
  );
};

export default SaveScraperDialogue;
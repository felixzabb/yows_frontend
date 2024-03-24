"use client";

import { CustomAppContext, SavedScraper, ScrapedData, ScraperInfos } from "@custom-types";
import { inputElementChecked, inputElementValue, showElement } from "@utils/elementFunction";
import { Dispatch, FormEvent, MouseEvent, SetStateAction, useState } from "react";
import { pullFromDb } from "@utils/api_funcs";
import { createAlert } from "@utils/generalFunctions";

const LoadScraperDialog = ({context, push, setScraperInfos, setScrapedData} : {context : CustomAppContext, push : (href : string) => void, setScraperInfos : Dispatch<SetStateAction<ScraperInfos>>, setScrapedData : Dispatch<SetStateAction<ScrapedData>>}) => {

  const emptyScrapedData : ScrapedData = [{scrape_runs: []}];
  const [loadScraperError, setLoadScraperError] = useState("");
  const [loadScraperDataValid, setLoadScraperDataValid] = useState(false);

  /** Pulls a scraperInfo object from the DB and sets it as the scraperInfo object in use. Needs to be async.
   * PARAMS:
   * - id (String): the passed in id, by which the API will search the DB
   */
  const loadScraper = async ({id, resultsNeeded, confirmNeeded} : {id : string, resultsNeeded : boolean, confirmNeeded : boolean}) : Promise<boolean>  => {

    if(confirmNeeded && !confirm("Loading the link will remove your current work")){ return; };
  
    const pullData = {filter : {"_id" : id}, projection: ["scraper", "scraped_data"]};

    const pullOperation = await pullFromDb<SavedScraper>({apiKey: "felix12m", dbName: "test_runs", collectionName : "scrape_info_saves", data: pullData});

    if(!pullOperation.acknowledged || pullOperation.found.length === 0){
      setLoadScraperError("Failed to load scraper!");
      // push(`?app_error=${pullOperation.errors[0]}&e_while=loading%20scraper`);
      return false;
    };

    const foundScrapeObject : ScraperInfos = pullOperation.found.at(0).scraper;

    setScraperInfos(foundScrapeObject);

    if(resultsNeeded){

      const potentialFoundResults : ScrapedData = pullOperation.found.at(0).scraped_data;
      if(potentialFoundResults[0]){ setScrapedData(potentialFoundResults); };
    }
    else{ setScrapedData(emptyScrapedData); };
    
    createAlert({context: context, textContent: "Loaded Scraper successfully!", duration: 2000, color: "normal"});

    return true;
  };

  const submit = async (e : MouseEvent<HTMLButtonElement, any> | FormEvent) => { 
    e.preventDefault();
    setLoadScraperError("");
    
    const loaded = await loadScraper({
      id: inputElementValue({elementId: "scraper-id"}), 
      resultsNeeded: inputElementChecked({elementId:  "scraper-results"}), 
      confirmNeeded: true
    });

    if(!loaded){ return; };
    const form = window.document.getElementById("load-scraper-form") as HTMLFormElement;
    form.reset();
    window.document.getElementById("document-overlay-container").classList.add("hidden");
  };

  const assertLoadScraperDataValid = () => {

    const loadScraperId = inputElementValue({elementId: "scraper-id"});

    if(loadScraperId.length !== 24){
      setLoadScraperDataValid(false);
      setLoadScraperError("ID has to be 24 characters long!");
      return;
    };

    setLoadScraperDataValid(true);
    setLoadScraperError("")
  };

  return (

    <form id={"load-scraper-form"} onSubmit={(e) => { submit(e); }} className="flex flex-col items-center justify-start gap-y-8 w-full h-max " >

      <h3 id="load-scraper-heading" className="text-[20px] font-[600] " >
        Please enter the ID of the scraper.
      </h3>

      <div id="load-scraper-inputs-wrapper" className="flex flex-col items-center gap-y-4 w-full h-auto gap-x-4 p-1" >
        <input id="scraper-id" maxLength={24} placeholder={"ID"} required onChange={assertLoadScraperDataValid}
          className='min-w-[60%] w-auto text-white dark:text-black placeholder:text-white dark:placeholder:text-black text-start border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 h-[40px]'/>

        <h2 id="load-scraper-error" className=" text-red-500 text-[14px] font-[500] w-[90%]" >
          {loadScraperError}
        </h2>
        <label id="scraper-results-wrapper" className="inline-flex items-center cursor-pointer">
          <h3 id="scraper-results-heading" className="pr-4 text-[18px] text-start font-[600] mb-[6px]" >Load results:</h3>
          <input id="scraper-results" type="checkbox" className="sr-only peer" />
          <div className="relative w-11 h-6 bg-stone-400 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
        </label>
      </div>
      
      {
        loadScraperDataValid ? 
          (
            <button id={"load-scraper-submit"} className='dark:hover:animate-navColorFadeLight dark:hover:text-black hover:animate-navColorFadeDark hover:text-white border-[1px] rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] w-[100px] h-[45px] text-center font-[600]' onClick={(e) => { submit(e); }} >
              Submit
            </button>
          )
          :
          (
            <button id={"load-scraper-submit_disabled"} className='border-[1px] rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] w-[100px] h-[45px] text-center font-[600] cursor-not-allowed' disabled >
              Submit
            </button>
          )
      }
    </form>
  );
};

export default LoadScraperDialog;
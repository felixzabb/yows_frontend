"use client";

import { CustomAppContext, SaveScraperReturn, ScrapedData, ScraperInfos, UserApiData, UserSubscriptionData } from "@custom-types";
import { inputElementChecked, inputElementValue } from "@utils/elementFunction";
import { FormEvent, MouseEvent } from "react";
import { saveScraper } from "@utils/api_funcs";
import { createAlert, showOverlay } from "@utils/generalFunctions";

const SaveScraperDialog = ({scraperInfos, userData, scrapedData, expectedRuntime, push, userId, context} : {scraperInfos : ScraperInfos, userData : {api : UserApiData, subscription : UserSubscriptionData, saved_scrapers : {scraper : string}[]} | null, scrapedData : ScrapedData, expectedRuntime : number, push : (href : string) => void, userId : string, context : CustomAppContext}) => {

  const emptyScrapedData : ScrapedData = [{scrape_runs: []}];

  const exportScraper = async ({name, description, withRes} : {name : string, description : string, withRes : boolean}) : Promise<void> => {

    const saveData = [{scraper : scraperInfos, name: name, description: description, runtime: expectedRuntime, scraped_data: withRes ? scrapedData : emptyScrapedData}];

    const saveOperation : SaveScraperReturn = await saveScraper({apiKey: "felix12m", userId: userId, data: saveData});

    if(!saveOperation.acknowledged){
      push(`?app_error=${saveOperation.errors[0]}&e_while=saving%20scraper`);
      return;
    };

    navigator.clipboard.writeText(saveOperation.created_item);

    createAlert({context: context, textContent: "Saved scraper successfully! ID copied to clipboard.", duration: 2000, color: "normal"});

    return;
  };
  
  const submit = (e : MouseEvent<HTMLButtonElement, any> | FormEvent) => {
    e.preventDefault();

    if(userData.saved_scrapers.length >= userData.subscription.scraper_storage){
      showOverlay({context: context, title: "Can't save scraper!", element: <h2 id="can-not-save-scraper" className="text-[18px] font-[400] font-inter">{`You already have reached your limit for saved scrapers(${userData.saved_scrapers.length}).If you want to save more, please increase your limit at Profile > Subscription > scraper storage.`}</h2>})
      return;
    };

    exportScraper({ 
      name: inputElementValue({elementId: "save-scrape-name"}), 
      description: inputElementValue({elementId: "save-scrape-desc"}), 
      withRes: inputElementChecked({elementId: "save-scrape-results"}),
    });

    const form = window.document.getElementById("save-scrape-form") as HTMLFormElement;
    form.reset();
    window.document.getElementById("document-overlay-container").classList.add("hidden");

    return;
  };

  return (
    <form id={"save-scrape-form"} onSubmit={(e) => {submit(e)}} className="flex flex-col items-center justify-start gap-y-6 mt-3 w-full h-max " >

      <h2 className="text-[20px] font-[600] " >
        Please fill in a name and a description.
      </h2>

      <input maxLength={32} placeholder={"Name"} id={"save-scrape-name"} required
        className='min-w-[60%] w-auto text-white dark:text-black placeholder:text-white dark:placeholder:text-black text-start border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 h-[40px]'/>
      
      <textarea maxLength={512}
        placeholder={"Description"} 
        id={"save-scrape-desc"} 
        className="min-w-[60%] w-auto h-max min-h-[120px] text-white dark:text-black placeholder:text-white dark:placeholder:text-black text-start border-2 border-gray-300 dark:border-gray-600 bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 rounded-s-none rounded-es-lg rounded-se-lg " 
      />

      {     
        scrapedData[0].scrape_runs[0]? 
          (
            <label className="inline-flex items-center cursor-pointer">
              <h3 className="pr-4 text-[18px] text-start font-[600] mb-[6px]" >Save results:</h3>
              <input id="save-scrape-results" type="checkbox" className="sr-only peer" />
              <div className="relative w-11 h-6 bg-stone-400 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
          )
          :
          (
            <label className="inline-flex items-center cursor-not-allowed">
              <h3 className="pr-4 text-[18px] text-start font-[600] mb-[6px]" >Save results:</h3>
              <input id="save-scrape-results" type="checkbox" className="sr-only peer" disabled />
              <div className="relative w-11 h-6 bg-stone-400 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
          )
      }
      
      <button id={"submit-save-scrape-btn"} className='dark:hover:animate-navColorFadeLight dark:hover:text-black hover:animate-navColorFadeDark hover:text-white border-[1px] rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] w-[100px] h-[45px] text-center font-[600]' onClick={(e) => {submit(e)}} >
        Submit
      </button>

    </form>
  );
};

export default SaveScraperDialog;
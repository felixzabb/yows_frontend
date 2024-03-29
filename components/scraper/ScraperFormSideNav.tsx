import Image from "next/image";
import { hideElement, isElementVisible, rotateElement, showElement } from "@utils/htmlAbstractions";
import { showOverlay } from "@utils/generalUtils";
import SaveScraperDialogue from "@components/dialogues/SaveScraperDialogue";
import LoadScraperDialogue from "@components/dialogues/LoadScraperDialogue";
import ScrapedDataOverlay from "@components/overlays/ScrapedData";
import { useContext } from "react";
import { overlayContext } from "@components/layout/Provider";

const ScraperFormSideNav = (
  { appendScrape, resetPage, scraperValidity, runScraper, removeScrapeByIndex, userData, authStatus, calculateScraperWaitTime, scrapedData, scraper, scraperRunning, loadScraper, saveScraper} 
  :
  {
    appendScrape : () => void
    resetPage : () => void
    scraperValidity : { all : boolean, [index : number] : boolean }
    runScraper : ({ scrapeIdx, runWhole } : { scrapeIdx? : number, runWhole? : boolean }) => Promise<void>
    removeScrapeByIndex : ({ scrapeIdx } : { scrapeIdx : number }) => void
    userData : ScraperUserData | null
    authStatus : "authenticated" | "unauthenticated"
    calculateScraperWaitTime : () => number
    scrapedData : ScrapedData
    scraper : ScraperData
    scraperRunning : boolean
    loadScraper : ({ scraperId, withScrapedData, confirmNeeded } : { scraperId : string, withScrapedData : boolean, confirmNeeded? : boolean }) => Promise<boolean>
    saveScraper : ({ name, description, saveScrapedData } : { name : string, description : string, saveScrapedData? : boolean }) => Promise<boolean>
  }
  ) => {
  
  const overlayContextAccess = useContext<OverlayContextValue>(overlayContext);
  const amountScrapes = scraper?.scrapes.length;

  // Functions that don't mutate the scraper.

  const collapseAll = () => {

    for(const scrapeIdx of Array.from(Array(amountScrapes).keys())){

      const currentId = `scrape-form-${scrapeIdx}`;

      if(isElementVisible({elementId: currentId})){
        hideElement({elementId: currentId}); 
        rotateElement({elementId: `toggle-scrape-visibility-${scrapeIdx}`, degrees: "180"});
      };
    };
  };

  const expandAll = () => {

    for(const scrapeIdx of Array.from(Array(amountScrapes).keys())){

      const currentId = `scrape-form-${scrapeIdx}`;
      if(!isElementVisible({elementId: currentId})){
       showElement({elementId: currentId}); 
       rotateElement({elementId: `toggle-scrape-visibility-${scrapeIdx}`, degrees: "180"});
      };
    };
  };

  return (
    <section id="wsform-sideNav" className="flex flex-col items-center min-w-[270px] max-w-[350px] w-full h-[calc(100dvh-62px)] overflow-auto wsform_bg border-r-2 border-gray-400 p-4 " >

      <h2 className="font-inter font-[500] h-auto text-[18px] mb-4" > Create Your Own Web Scraper! </h2>

      <aside className=" w-full flex flex-col h-auto items-start justify-start gap-y-2" >

        <div className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

          <h2 className="font-inter text-[18px]" > {`Add/Delete a Scrape: `} </h2>
          
          <div className="flex flex-row items-center gap-x-2 w-auto h-auto" >
            {
              amountScrapes > 1 ? 
                (
                  <Image
                    src={"/assets/icons/generic/minus_sign_black.svg"}
                    alt={"Delete last scrape"}
                    width={40} height={40}
                    className="rounded-lg p-1 bg-red-400"
                    onClick={() => { removeScrapeByIndex({ scrapeIdx: amountScrapes - 1 }); }}
                  />
                )
                :
                (
                  <Image
                    src={"/assets/icons/generic/minus_sign_black.svg"}
                    alt={"Delete last scrape (disabled)"}
                    width={40} height={40}
                    className="cursor-not-allowed rounded-lg p-1 bg-red-400 opacity-50"
                  />
                ) 
            }

            <Image
              src={"/assets/icons/generic/plus_sign_black.svg"}
              alt={"Add scrape"}
              width={40} height={40}
              className=" rounded-lg p-1 bg-green-400"
              onClick={() => { appendScrape(); }}
            />

          </div>
        </div>

        <div className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

          <h2 className="font-inter text-[18px]" > {`Run whole Scraper: `} </h2>
          
          <div className="flex flex-row items-center gap-x-2 w-auto h-auto" >
            {
              !scraperRunning && scraperValidity.all ? 
                (
                  <Image
                    src={"/assets/icons/scrape/rocket.svg"}
                    alt={"Run scraper"}
                    width={40} height={40}
                    onClick={() => { runScraper({ runWhole: true }); }}
                  />
                ) 
                : 
                (
                  <Image
                    src={"/assets/icons/scrape/rocket.svg"}
                    alt={"Run scraper (disabled)"}
                    width={40} height={40}
                    className="cursor-not-allowed opacity-50"
                  />
                )
            }
          </div>
        </div>

        <hr className="my-2 max-h-[1px] w-full border-black dark:border-white opacity-10" />

        <div className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

          <h2 className="font-inter text-[18px]" > Collapse all: </h2>
          
          <Image
            src={"/assets/icons/generic/collapse.svg"}
            alt={"Collapse all scrapes"}
            width={40} height={40}
            onClick={collapseAll}
          />

        </div>

        <div className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

          <h2 className="font-inter text-[18px]" > {`Expand all:`} </h2>
          
          <Image
            src={"/assets/icons/generic/expand.svg"}
            alt={"Expand all scrapes"}
            width={40} height={40}
            onClick={expandAll}
          />

        </div>

        <div className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

          <h2 className="font-inter text-[18px]" > Reset scraper: </h2>
          
          <Image
            src={"/assets/icons/scrape/recycle.svg"}
            alt={"Reset Scraper"}
            width={40} height={40}
            onClick={resetPage}
          />

        </div>

        <hr className="my-2 max-h-[1px] w-full border-black dark:border-white opacity-10" />
        
        <div className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

          <h2 className="font-inter text-[18px]" > Save scraper: </h2>
          
          <div className="flex flex-row items-center gap-x-2 w-auto h-auto" >
            {
              authStatus === "authenticated" && scraperValidity.all ? 
                (
                  <Image
                    src={"/assets/icons/scrape/save.svg"}
                    alt={"Save scraper"}
                    width={40} height={40}
                    onClick={() => { showOverlay({ 
                      context: overlayContextAccess, 
                      title: "Save a Scraper!", 
                      element: <SaveScraperDialogue userData={userData} scrapedData={scrapedData} saveScraper={saveScraper} /> 
                    }); }}
                  />
                )
                :
                (
                  <Image
                    src={"/assets/icons/scrape/save.svg"}
                    alt={"Save scraper (disabled)"}
                    width={40} height={40}
                    className="cursor-not-allowed opacity-50"
                  />
                ) 
            }
          </div>
        </div>

        <div className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

          <h2 className="font-inter text-[18px]" > Load a scraper: </h2>
          
          <Image
            src={"/assets/icons/scrape/load_saved.svg"}
            alt={"Load scraper"}
            width={40} height={40}
            onClick={() => { showOverlay({ 
              context: overlayContextAccess, 
              title: "Load a Scraper!", 
              element: <LoadScraperDialogue loadScraper={loadScraper} /> 
            }); }}
          />

        </div>

        <hr className="my-2 max-h-[1px] w-full border-black dark:border-white opacity-10" />

        <div className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

          <h2 className="font-inter text-[18px]" > Show scraped data: </h2>
          
          <div className="flex flex-row items-center gap-x-2 w-auto h-auto" >
            {
              scrapedData ? 
                ( 
                  <Image
                    src={"/assets/icons/generic/data.svg"}
                    alt={"Show scraped data"}
                    width={40} height={40}
                    onClick={() => { showOverlay({ 
                      context: overlayContextAccess, 
                      title: "Scraped data", 
                      element: <ScrapedDataOverlay scrapedData={scrapedData} /> 
                    }); }}
                  />
                )
                :
                (
                  <Image
                    src={"/assets/icons/generic/data.svg"}
                    alt={"Show scraped data (disabled)"}
                    width={40} height={40}
                    className="cursor-not-allowed opacity-50"
                  />
                ) 
            }
          </div>
        </div>

        <hr className="my-2 max-h-[1px] w-full border-black dark:border-white opacity-10" />

      </aside>

      <h2 className="font-inter font-[600] text-[18px] " > Information: </h2>

      <aside className="w-full flex flex-col h-auto items-start justify-start gap-y-2" >

        <div className="flex flex-row w-full h-auto items-center justify-between" >

          <h2 className="font-inter text-[18px]" > Scrape count: </h2>
          
          <p className="font-inter text-[20px] mr-2" >
            {amountScrapes}
          </p>

        </div>

        <div className="flex flex-row w-full h-auto items-center justify-between" >

          <h2 className="font-inter text-[18px]" > Expected runtime: </h2>
          
          <p className="font-inter text-[20px] mr-2" >
            {calculateScraperWaitTime()}
          </p>
        </div>

        <div className="flex flex-row w-full h-auto items-center justify-between" >

          <h2 className="font-inter text-[18px]" > Overall valid: </h2>
          
          {
            scraperValidity.all ?
              (
                <span className="font-inter text-[18px] mr-2 text-green-600" > Yes </span>
              )
              :
              (
                <span className="font-inter text-[18px] mr-2 text-red-600" > No </span>
              )
          }
        </div>
        
      </aside>

    </section>
  );
};

export default ScraperFormSideNav;
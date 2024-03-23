import Image from "next/image";
import { hideElement, inputElementChecked, isElementVisible, rotateElement, showElement } from "@utils/elementFunction";
import { showOverlay } from "@utils/generalFunctions";
import SaveScraperDialog from "@components/overlays/SaveScraperDialog";
import LoadScraperDialog from "@components/overlays/LoadScraperDialog";
import ScrapedDataOverlay from "@components/overlays/ScrapedData";
import { CustomAppContext, ScrapeData, ScrapedData, ScraperInfos, UserApiData, UserSubscriptionData } from "@custom-types";
import { Dispatch, SetStateAction } from "react";

const WSFormSideNav = (
  {amountScrapes, readiness, userData, setReadiness, newSubmit, deleteSpecificScrape, User, authStatus, calculateWaitTime, scrapedData, setScrapedData, push, context, scraperInfos, setScraperInfos, defScraperInfos, defScrapeData, scraperRunning} 
  :
  {
    amountScrapes : number, 
    readiness : {all : boolean, [index : number ] : boolean},
    setReadiness : Dispatch<SetStateAction<{all : boolean, [index : number ] : boolean}>>,
    newSubmit : ({all, scrapeIdx} : {all : boolean, scrapeIdx : number}) => Promise<void>, 
    deleteSpecificScrape : ({scrapeIdx} : {scrapeIdx : number}) => void,
    userData : {api : UserApiData, subscription : UserSubscriptionData, saved_scrapers : {scraper : string}[]} | null
    User : any, 
    authStatus : "authenticated" | "unauthenticated" | "loading", 
    calculateWaitTime : ({all, scrapeIdx} : {all : boolean, scrapeIdx : number}) => number, 
    scrapedData : ScrapedData,
    setScrapedData : Dispatch<SetStateAction<ScrapedData>>,
    push : (href : string) => void, 
    context : CustomAppContext, 
    scraperInfos : ScraperInfos, 
    setScraperInfos : Dispatch<SetStateAction<ScraperInfos>>, 
    defScraperInfos : ScraperInfos,
    defScrapeData : ScrapeData,
    scraperRunning : boolean
  }
  ) => {

  const emptyScrapedData : ScrapedData = [{scrape_runs: []}];

  // Non-data functions

  const resetPage = () => {
    const confirmation = confirm("Are your sure you want to reset the whole scraper?");

    if(!confirmation){return;}

    setScraperInfos(defScraperInfos);
    setScrapedData(emptyScrapedData);
    setReadiness({all: false, 0: false});

    hideElement({elementId: `loop-container-0`});
    hideElement({elementId: `actions-loop-separator-0`});

  };

  /** Appends a scrape to scraperInfo.all 
   */
  const appendScrape = () : void => {

    setScraperInfos((prevScraperInfos) => ({
      ...prevScraperInfos,
      all: [
        ...prevScraperInfos.all,
        defScrapeData
      ]
    }));   
    return;
  };

  // Non-data functions

  const collapseAll = () => {
    for(const i of Array.from(Array(amountScrapes).keys())){
      const currentId = `scrape-form-${i}`;
      if(isElementVisible({elementId: currentId})){
        hideElement({elementId: currentId}); rotateElement({elementId: `toggle-scrape-visibility-${i}`, degrees: "180"});
      }
    }
  };

  const expandAll = () => {
    for(const i of Array.from(Array(amountScrapes).keys())){
      const currentId = `scrape-form-${i}`;
      if(!isElementVisible({elementId: currentId})){
       showElement({elementId: currentId}); rotateElement({elementId: `toggle-scrape-visibility-${i}`, degrees: "180"});
      };
    };
  };



  return (
    <section id={"wsform-sideNav"} className="flex flex-col items-center min-w-[270px] max-w-[350px] w-full h-[calc(100dvh-62px)] overflow-auto bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg p-4 " >

      <h2 id="wsform-sideNav-heading" className="font-inter font-[500] h-auto text-[18px] mb-4" > Create Your Own Web Scraper! </h2>

      <aside id={"wsform-sideNav-options"} className=" w-full flex flex-col h-auto items-start justify-start gap-y-2" >

        <div id={"add/delete-scrape-option-container"} className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

          <h2 id={"add/delete-scrape-option-heading"} className="font-inter text-[18px]" > {`Add/Delete a Scrape: `} </h2>
          
          <div  id={"add/delete-scrape-option-wrapper"} className="flex flex-row items-center gap-x-2 w-auto h-auto" >
            {
              amountScrapes > 1 ? 
                (
                  <Image
                    src={"/assets/icons/generic/minus_sign_black.svg"}
                    id="delete-scrape"
                    alt={"Delete last scrape"}
                    width={40}
                    height={40}
                    className="cursor-pointer rounded-lg p-1 bg-red-400"
                    onClick={() => { deleteSpecificScrape({scrapeIdx: (amountScrapes - 1)}) }}
                  />
                )
                :
                (
                  <Image
                    src={"/assets/icons/generic/minus_sign_black.svg"}
                    id="delete-scrape_disabled"
                    alt={"Delete last scrape (disabled)"}
                    width={40}
                    height={40}
                    className="cursor-not-allowed rounded-lg p-1 bg-red-400 opacity-50"
                  />
                ) 
            }

            <Image
              src={"/assets/icons/generic/plus_sign_black.svg"}
              alt={"Add scrape"}
              id="add-scrape-disabled"
              width={40}
              height={40}
              className="cursor-pointer rounded-lg p-1 bg-green-400"
              onClick={() => { appendScrape(); }}
            />
          </div>
        </div>

        <div id={"run-scraper-option-container"} className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

          <h2 id={"run-scraper-option-heading"} className="font-inter text-[18px]" > {`Run whole Scraper: `} </h2>
          
          <div id={"run-scraper-option-wrapper"} className="flex flex-row items-center gap-x-2 w-auto h-auto" >
            {
              !scraperRunning && readiness.all ? 
                (
                  <Image
                    src={"/assets/icons/scrape/rocket.svg"}
                    alt={"Run scraper"}
                    id={"run-scraper"}
                    width={40}
                    height={40}
                    className="cursor-pointer "
                    onClick={() => { newSubmit({all: true, scrapeIdx: null}); }}
                  />
                ) 
                : 
                (
                  <Image
                    src={"/assets/icons/scrape/rocket.svg"}
                    alt={"Run scraper (disabled)"}
                    id="run-scraper_disabled"
                    width={40}
                    height={40}
                    className="cursor-not-allowed opacity-50"
                  />
                )
            }
          </div>
        </div>

        <hr id="wsform-sideNav-options-separator-0" className="my-2 max-h-[1px] w-full border-black dark:border-white opacity-10" />

        <div id={"global-undetected-option-container"} className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

          <h2 id={"global-undetected-option-heading"} className="font-inter text-[18px]" > {`Global undetected:`} </h2>
          
          
          <label id={"global-undetected-option-wrapper"} className="inline-flex items-center cursor-pointer">
            <input id="global-undetected-switch" type="checkbox" className="sr-only peer" />
            <div onClick={() => { setScraperInfos((prevScraperInfos) => {
                  prevScraperInfos.args.global_undetected = !inputElementChecked({elementId: "global-undetected-switch"});
                  return prevScraperInfos;
                })}}
                className="relative w-11 h-6 bg-stone-400 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
          </label>

        </div>

        <div id={"collapse-all-option-container"} className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

          <h2 id={"collapse-all-option-heading"} className="font-inter text-[18px]" > {`Collapse all:`} </h2>
          
          <Image
            src={"/assets/icons/generic/collapse.svg"}
            alt={"Collapse all scrapes"}
            id="collapse-all"
            width={40}
            height={40}
            className="cursor-pointer"
            onClick={collapseAll}
          />

        </div>

        <div id={"expand-all-option-container"} className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

          <h2 id={"expand-all-option-heading"} className="font-inter text-[18px]" > {`Expand all:`} </h2>
          
          <Image
            src={"/assets/icons/generic/expand.svg"}
            alt={"Expand all scrapes"}
            id="expand-all"
            width={40}
            height={40}
            className="cursor-pointer"
            onClick={expandAll}
          />

        </div>

        <div id={"reset-scraper-option-container"} className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

          <h2 id={"reset-scraper-option-heading"} className="font-inter text-[18px]" > {`Reset Scraper:`} </h2>
          
          <Image
            src={"/assets/icons/scrape/recycle.svg"}
            alt={"Reset Scraper"}
            id="reset-scraper"
            width={40}
            height={40}
            className="cursor-pointer"
            onClick={resetPage}
          />

        </div>

        <hr id="wsform-sideNav-options-separator-1" className="my-2 max-h-[1px] w-full border-black dark:border-white opacity-10" />
        
        <div id={"save-scraper-option-container"} className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

          <h2 id={"save-scraper-option-heading"} className="font-inter text-[18px]" > {`Save your Scraper:`} </h2>
          
          <div id={"save-scraper-option-wrapper"} className="flex flex-row items-center gap-x-2 w-auto h-auto" >
            {
              authStatus === "authenticated" && readiness.all ? 
                (
                  <Image
                    src={"/assets/icons/scrape/save.svg"}
                    alt={"Save scraper"}
                    id="save-scraper"
                    width={40}
                    height={40}
                    className="cursor-pointer"
                    onClick={() => { showOverlay({context: context, title: "Save a Scraper!", element: <SaveScraperDialog scraperInfos={scraperInfos} userData={userData} scrapedData={scrapedData} userId={User.id} expectedRuntime={calculateWaitTime({all: true, scrapeIdx: null})} push={push} context={context} />}); }}
                  />
                )
                :
                (
                  <Image
                    src={"/assets/icons/scrape/save.svg"}
                    alt={"Save scraper (disabled)"}
                    id="save-scraper_disabled"
                    width={40}
                    height={40}
                    className="cursor-not-allowed opacity-50"
                  />
                ) 
            }
          </div>
        </div>

        <div id={"load-scraper-option-container"} className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

          <h2 id={"load-scraper-option-heading"} className="font-inter text-[18px]" > {`Load a Scraper:`} </h2>
          
          <Image
            src={"/assets/icons/scrape/load_saved.svg"}
            alt={"Load scraper"}
            id="load-scraper"
            width={40}
            height={40}
            className="cursor-pointer"
            onClick={() => { showOverlay({context: context, title: "Load a Scraper!", element: <LoadScraperDialog context={context} push={push} setScraperInfos={setScraperInfos} setScrapedData={setScrapedData} />}); }}                       
          />
        </div>

        <hr id="wsform-sideNav-options-separator-2" className="my-2 max-h-[1px] w-full border-black dark:border-white opacity-10" />

        <div id={"show-results-option-container"} className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

          <h2 id={"show-results-option-heading"} className="font-inter text-[18px]" > {`Show scraped data:`} </h2>
          
          <div id={"show-results-option-wrapper"} className="flex flex-row items-center gap-x-2 w-auto h-auto" >
            {
              scrapedData[0].scrape_runs?.length ? 
                ( 
                  <Image
                    src={"/assets/icons/generic/data.svg"}
                    alt={"Show scraped data"}
                    id="show-scraped-data"
                    width={40}
                    height={40}
                    className="cursor-pointer"
                    onClick={() => { showOverlay({context: context, title: "Scraped data", element: <ScrapedDataOverlay scrapedData={scrapedData} saveAbility={false} />}); }}                       />
                )
                :
                (
                  <Image
                    src={"/assets/icons/generic/data.svg"}
                    alt={"Show scraped data (disabled)"}
                    id="show-scraped-data_disabled"
                    width={40}
                    height={40}
                    className="cursor-not-allowed opacity-50"
                  />
                ) 
            }
          </div>
        </div>

        <hr id="wsform-sideNav-options/meta-separator" className="my-2 max-h-[1px] w-full border-black dark:border-white opacity-10" />

      </aside>

      <h2 id="wsform-sideNav-meta-heading" className="font-inter font-[600] text-[18px]  " > Information: </h2>

      <div id={"wsform-sideNav-meta"} className="w-full flex flex-col h-auto items-start justify-start gap-y-2" >

        <div id="scrape-count-meta-container" className="flex flex-row w-full h-auto items-center justify-between" >

          <h2 id="scrape-count-meta-heading" className="font-inter text-[18px]" > {`Scrape count: `} </h2>
          
          <p id="scrape-count-meta" className="font-inter text-[20px] mr-2" >
            {amountScrapes}
          </p>
        </div>

        <div id="runtime-meta-container" className="flex flex-row w-full h-auto items-center justify-between" >

          <h2 id="runtime-meta-heading" className="font-inter text-[18px]" > {`Expected runtime: `} </h2>
          
          <p id="runtime-meta" className="font-inter text-[20px] mr-2" >
            {calculateWaitTime({all: true, scrapeIdx: null})}
          </p>
        </div>

        <div id="validity-meta-container" className="flex flex-row w-full h-auto items-center justify-between" >

          <h2 id="validity-meta-heading" className="font-inter text-[18px]" > {`Overall valid: `} </h2>
          
          {
            readiness.all ?
              (
                <span id="validity-meta-valid" className="font-inter text-[18px] mr-2 text-green-600" > Yes </span>
              )
              :
              (
                <span id="validity-meta-invalid" className="font-inter text-[18px] mr-2 text-red-600" > No </span>
              )
          }
        </div>
      </div>

    </section>
  );
};
export default WSFormSideNav;
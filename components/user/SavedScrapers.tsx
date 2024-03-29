"use client";

import { putToDbCall, deleteScraperCall, pullSavedScrapersCall, runScrapeOrScraperCall } from "@utils/apiCalls";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ScaleLoader } from "react-spinners";
import Tooltip from "@components/custom/Tooltip";
import ScrapedDataOverlay from "@components/overlays/ScrapedData";
import { hideElement, showHideElement } from "@utils/htmlAbstractions";
import { showOverlay } from "@utils/generalUtils";
import NotSignedInDialogue from "@components/dialogues/NotSignedInDialogue";
import LoadingDialogue from "@components/dialogues/LoadingDialogue";
import ScraperForm from "@components/scraper/ScraperForm";
import { overlayContext } from "@components/layout/Provider";
 
// Everything that has to do with getting/processing data returned when running a scraper

export const defScrapedData : ScrapedData = [{ scrape_runs: [], errors: [] }];

const SavedScrapers = ({ User, authStatus } : { User: UserSessionData, authStatus: "authenticated" | "unauthenticated" }) => {

  const overlayContextAccess = useContext<OverlayContextValue>(overlayContext);

  const { push } = useRouter();

  const [ savedScrapers, setSavedScrapers ] = useState<SavedScraper[]>(null);
  const [ maxScrapes, setMaxScrapes ] = useState(10);
  const [ scrapedData, setScrapedData ] = useState<ScrapedData | null>(null);

  const showSavedScraperData = ({ scraperIdx } : { scraperIdx : number }) : void => {

    showOverlay({ 
      context: overlayContextAccess,
      title: "Scraped data!",
      element: <ScrapedDataOverlay scrapedData={savedScrapers[scraperIdx].scraped_data} />
    });
  };

  const useScraper = ({ scraperIdx } : { scraperIdx : number }) : void => {

    window.sessionStorage.setItem("passedScraper", JSON.stringify(savedScrapers[scraperIdx].scraper));
    window.sessionStorage.setItem("usePassedScraper", "1");

    push(`/new`);
  };

  const deleteSavedScraper = async ({ scraperIdx } : { scraperIdx : number }) : Promise<void> => {

    if(!confirm("Are you sure you want to delete this scrape?")){ return; };
      
    const deleteOperation = await deleteScraperCall({ scraperId: savedScrapers[scraperIdx]._id, userId: User.id });

    if(!deleteOperation.acknowledged){
      push(`?app_error=${deleteOperation.errors[0]}&e_while=deleting%20saved%20scraper`);
      return;
    };

    // positive deletion, revalidation only happens on refresh of the page
    const newSavedScrapers = savedScrapers;
    newSavedScrapers.splice(scraperIdx, 1);

    setSavedScrapers([...newSavedScrapers]);
  };

  const saveScraperEdits = async ({ scraperIdx } : { scraperIdx : number }) : Promise<void> => {

    const put_data = { filter : { _id : savedScrapers[scraperIdx]._id }, update: { "$set" : { "name" : savedScrapers[scraperIdx].name, "description" : savedScrapers[scraperIdx].description } } };

    const editOperation = await putToDbCall({ dbName: "test_runs", collectionName: "scrape_info_saves", data: put_data });

    if(!editOperation.acknowledged){
      push(`?app_error=${editOperation.errors[0]}&e_while=saving%20edits`);
      return;
    };
  };

  const handleScraperDataChange = ({ scraperIdx, paramName, value } : { scraperIdx : number, paramName : string, value : string | number }) : void => {

    if(!savedScrapers ){ return; };

    const newSavedScrapers = savedScrapers;
    newSavedScrapers[scraperIdx][paramName] = value;

    setSavedScrapers([...newSavedScrapers]);
  };

  const updateSavedScrapedData = async ({ scraperIdx, newScrapedData } : { scraperIdx : number, newScrapedData : ScrapedData }) : Promise<void> => {

    if(!confirm("Are you sure you want to save the data, this will overwrite any existing data?")){ return; };

    const putData = { filter : { _id: savedScrapers }, update : { "$set" : { "results" : newScrapedData } } };

    const saveOperation = await putToDbCall({ dbName: "test_runs", collectionName: "scrape_info_saves", data: putData });

    if(!saveOperation.acknowledged){
      push(`?app_error=${saveOperation.errors[0]}&e_while=saving%20results`);
      return;
    };
    
    // Need to put changes to DB!
    const savedScrapersCopy = savedScrapers;
    savedScrapersCopy.at(scraperIdx).scraped_data = scrapedData;
    
    setSavedScrapers([...savedScrapersCopy]);

    hideElement({elementId: "document-overlay-container"});
  };

  const runSavedScraper = async ({ scraperIdx } : { scraperIdx : number }) : Promise<void> => {

    showOverlay({ 
      context: overlayContextAccess, 
      title: "Running scraper!", 
      element: <LoadingDialogue expectedWaitTime={savedScrapers[scraperIdx].expected_runtime_seconds }/>
    });

    const runOperation = await runScrapeOrScraperCall({ userId: User.id, data: savedScrapers[scraperIdx].scraper });

    if(!runOperation.acknowledged){
      push(`?app_error=${runOperation.errors[0]}&e_while=running%20scraper`);
      return;
    };

    setScrapedData(runOperation.scraped_data); 

    showOverlay({
      context: overlayContextAccess, 
      title: "Running scraper!", 
      element: <ScrapedDataOverlay scrapedData={runOperation.scraped_data} updateSavedScrapedData={updateSavedScrapedData} saveAbility={true} currentScraperIndex={scraperIdx} /> 
    });
  };

  const getSavedScrapers = async () : Promise<void> => {

    const pull_operation = await pullSavedScrapersCall({ userId: User.id });

    if(!pull_operation.acknowledged){
      push(`?app_error=${pull_operation.errors[0]}&e_while=pulling%20saved%20scrapers`);
      return;
    };

    setSavedScrapers(pull_operation.found);
    setMaxScrapes(pull_operation.scraper_storage);
  };
  
  useEffect(() => {

    if(authStatus === "authenticated"){
      getSavedScrapers();
    }
    else if(authStatus === "unauthenticated"){
      showOverlay({
        context: overlayContextAccess, 
        element: <NotSignedInDialogue message="You can't access/have saved scrapers. Please create an account or sign in!" />, 
        title: "Not signed in!"
      });
    };
  }, [authStatus]);

  return (
    <div id="saved-scrapers-container" className="flex flex-col items-center w-full h-auto -mt-[60px] max-w-[1920px]" >

      <h1 className="font-[Inter] text-[40px] my-5" >
        { 
          !savedScrapers ? 
            (
              "Pulling saved scrapers..."
            ) 
            : 
            ( 
              authStatus === "unauthenticated" || (savedScrapers && !savedScrapers[0]?._id) ? 
                ("You have no saved scrapers") 
                : ("All your saved scrapers" )
            )
        }
      </h1>

      <h2 className="text-[18px] text-start w-[95%] font-[700] px-1" >
        {`Amount: ${savedScrapers ? (Object.keys(savedScrapers).length) : ((authStatus === "unauthenticated" || (savedScrapers && !savedScrapers[0])) ? ("0") : ("?"))} of ${maxScrapes}`}
      </h2>
      
      <hr className="w-[95%] bg-black h-[2px] mb-4 " />

      <div id="saved-scrapers-wrapper" className="c_col_elm w-full h-auto gap-y-5 max-w-[1400px]" >

        {
          !savedScrapers && (
            <ScaleLoader height={50} width={4} margin={3} speedMultiplier={2} color="#8A2BE2" />
          )
        }

        { 
          savedScrapers && Array.from(savedScrapers.keys()).map((scraperIdx) => (
            <section key={`saved-scraper-${scraperIdx}`} id={`saved-scraper-${scraperIdx}`} className=" relative w-[90%] h-auto flex flex-col items-center border-2 border-gray-600 dark:border-gray-300 bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg rounded-xl px-2 " >

              <aside className="flex flex-row items-center w-full h-[60px] gap-x-2 " >

                <div className="relative group flex items-center justify-center min-w-[30px] h-full mb-[-3px]" >

                  <Tooltip xOrientation="left" content={"Copy ID."} /> 

                  <Image 
                    src='/assets/icons/generic/copy.svg' 
                    alt='Copy scraper ID' 
                    width={26} height={26} 
                    onClick={() => { navigator.clipboard.writeText(savedScrapers.at(scraperIdx)._id); }} 
                  />

                </div>

                <div className="relative flex flex-row items-center h-[32px]" >

                  <h2 className="text-[18px] w-[240px] max-w-[240px] overflow-hidden text-start flex flex-row items-center font-[500] whitespace-pre-wrap " >{`${savedScrapers[scraperIdx].name}`}</h2>

                  <div className="group relative flex items-center w-auto h-full mb-[-3px]" >

                    <Tooltip xOrientation="middle" yOrientation="top" content={"Show scraper metadata."} /> 

                    <Image
                      src='/assets/icons/generic/tooltip_purple.svg' 
                      alt='Show scraper metadata' 
                      width={26} height={26} 
                      onClick={() => { 
                        showHideElement({elementId: `saved-scraper-meta-container-${scraperIdx}`}); 
                        showHideElement({elementId: `saved-scraper-options/meta-separator-${scraperIdx}`}); 
                      }} 
                    />

                  </div>
                </div>

                <hr className="h-[50px] w-[2px] bg-gray-400 " />

                <div className="relative group flex items-center justify-center min-w-[30px] h-full mb-[-3px]" >

                  <Tooltip content={"Use scraper."} /> 

                  <Image 
                    src='/assets/icons/generic/edit.svg' 
                    alt='Use scraper' 
                    width={26} height={26} 
                    onClick={() => { useScraper({ scraperIdx: scraperIdx }); }} 
                  />

                </div>

                <div className="relative group flex items-center justify-center min-w-[30px] h-full mb-[-3px]" >

                  <Tooltip content={"Preview scraper."} /> 

                  <Image
                    src='/assets/icons/generic/view.svg' 
                    alt='Preview scraper' 
                    width={40} height={40} 
                    onClick={() => { 
                      showOverlay({context: overlayContextAccess, title: "Preview your scraper!", element: 
                      <fieldset className="w-full h-full pointer-events-none break-words" disabled >
                        <ScraperForm User={User} authStatus={authStatus} previewData={savedScrapers.at(scraperIdx).scraper} />
                      </fieldset>}); 
                    }} 
                  />

                </div>

                <hr className="h-[50px] w-[2px] bg-gray-400 " />

                <div className="relative group flex items-center justify-center min-w-[30px] h-full mb-[-3px]" >

                  <Tooltip content={"Show scraped data."} /> 

                  {
                    savedScrapers.at(scraperIdx).scraped_data ?
                      (
                        <Image 
                          src='/assets/icons/generic/data.svg' 
                          alt='Show scraped data' 
                          width={40} height={40} 
                          onClick={() => { showSavedScraperData({ scraperIdx: scraperIdx }); }} 
                        />
                      )
                      :
                      (
                        <Image 
                          src='/assets/icons/generic/data.svg' 
                          className="cursor-not-allowed brightness-75" 
                          alt='Show scraped data (disabled)' 
                          width={40} height={40}
                        />
                      )
                  }

                </div>

                <div className="relative group flex items-center justify-center min-w-[30px] h-full" >

                  <Tooltip content={"Run scraper."} /> 

                  <Image
                    src='/assets/icons/scrape/rocket.svg' 
                    alt='Run scraper' 
                    width={40} height={40} 
                    onClick={() => { runSavedScraper({ scraperIdx: scraperIdx }); }} 
                  />

                </div>

                <div className="group flex items-center w-auto h-full absolute right-2 " >

                  <div className="w-auto h-full relative" >
                    <Tooltip content={"Delete scraper."} /> 
                  </div>
                  
                  <Image 
                    src='/assets/icons/scrape/trash_can.svg' 
                    alt="Delete saved scraper" 
                    width={40} height={40} 
                    onClick={() => { deleteSavedScraper({ scraperIdx: scraperIdx }); }}  
                  />
                </div>

              </aside>

              <hr id={`saved-scraper-options/meta-separator-${scraperIdx}`} className='hidden border-[1px] h-[1px] mt-1 border-black dark:border-white w-full rounded-3xl opacity-20' />

              <div id={`saved-scraper-meta-container-${scraperIdx}`} className="relative flex flex-col items-start w-full h-min gap-y-2 hidden pb-2 " > 

                  <h2 className="text-[18px] w-[90px] text-start c_row_elm whitespace-pre-wrap " >
                    <p className="font-[600]" >{"Scraper: "} </p>  
                    {String(Number(scraperIdx) + 1)}
                  </h2>

                  <h2 className="text-[18px] w-full text-start c_row_elm whitespace-pre-wrap " > 
                    <p className="font-[600]" >{"Runtime: "} </p>  
                    {savedScrapers[scraperIdx].expected_runtime_seconds + "sec"}
                  </h2>

                  <label className="text-[18px] w-full text-start c_row_elm whitespace-pre-wrap" > 
                    <p className="font-[600]" >{"Name: "} </p>
                    <input
                      minLength={1} maxLength={22} 
                      value={savedScrapers[scraperIdx].name} 
                      className=" w-full max-w-[540px] p-[2px] text-start px-2 bg-transparent border-2 border-gray-600 dark:border-gray-300 rounded-lg" 
                      onChange={(e) => { handleScraperDataChange({ scraperIdx: scraperIdx, paramName: "name", value: e.target.value }); }} 
                    />
                  </label>

                  <label className="text-[18px] w-[95%] h-auto text-start pl-1 flex flex-col items-start whitespace-pre-wrap break-all " > 
                    <p className=" ml-[-4px] font-[600] min-w-[80px]" >{"Description: "} </p>
                    <textarea 
                      maxLength={512} 
                      className="w-full max-w-[600px] h-max min-h-[120px] max-h-[400px] text-start px-1 bg-transparent border-2 p-1 border-gray-600 dark:border-gray-300 rounded-ss-none rounded-se-lg rounded-ee-none rounded-es-lg " 
                      value={savedScrapers[scraperIdx].description} 
                      onChange={(e) => { handleScraperDataChange({ scraperIdx: scraperIdx, paramName: "description", value: e.target.value }); }} 
                    />
                  </label>

                  <div className=" absolute right-0 bottom-4 group flex items-center justify-center min-w-[30px] h-min mb-[-3px] " >

                    <div className="relative h-full w-auto " >
                      <Tooltip yOrientation="bottom" content={"Save changes."} /> 
                    </div>

                    <Image 
                      src='/assets/icons/scrape/save.svg' 
                      alt="delete saved scrape icon" 
                      width={50} height={50} 
                      onClick={() => { saveScraperEdits({ scraperIdx: scraperIdx }); }} 
                    />
                  </div>
              </div>
            </section>
          ))
        }
      </div>
    </div>
  );
};

export default SavedScrapers;
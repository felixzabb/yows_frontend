"use client";

import { putToDb, deleteScrape, pullSavedScrapes, runScrape } from "@utils/api_funcs";
import { useEffect, useState, useContext } from "react";
import { appContext } from "@app/layout";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ScaleLoader } from "react-spinners";
import PreviewWS from "../scraping/preview/PreviewWS";
import Tooltip from "@components/design/Tooltip";
import ScrapedDataOverlay from "@components/overlays/ScrapedData";
import { showElement, showHideElement } from "@utils/elementFunction";
import { showOverlay } from "@utils/generalFunctions";
import { AppContextData, CustomAppContext, SavedScraper, ScrapedData } from "@custom-types";
import NotSignedInDialog from "@components/overlays/NotSignedInDialog";
import LoadingDialog from "@components/overlays/LoadingDialog";

const SavedScrapes = ({ User, AuthStatus }) => {

  const context = useContext<CustomAppContext>(appContext);

  const emptyScrapedData : ScrapedData = [{scrape_runs: []}];

  const [ savedScrapes, setSavedScrapes ] = useState<SavedScraper[]>(null);
  const [ maxScrapes, setMaxScrapes ] = useState(10);

  const [ runResults, setRunResults ] = useState<ScrapedData>(emptyScrapedData);

  const { push } = useRouter();

  const showSavedScraperData = ({getIdx} : {getIdx : number}) => {
    
    context.setAppContextData((prevAppContextData : AppContextData) => {

      prevAppContextData.overlay.element = <ScrapedDataOverlay scrapedData={savedScrapes.at(getIdx).scraped_data} saveAbility={false} />;
      prevAppContextData.overlay.title = "Scraped data!";

      return {
        ...prevAppContextData,
      };
    })
    showElement({elementId: "document-overlay-container"});
  };

  const useScraper = ({useIdx} : {useIdx : number}) : void => {

    window.sessionStorage.setItem("passedSavedObject", JSON.stringify(savedScrapes[useIdx].scraper))
    window.sessionStorage.setItem("usePassed", "1")

    push(`/new-scraper`);

    return;
  };

  const deleteSavedScrape = async ({getIdx} : {getIdx : number}) : Promise<void> => {

    const confirmation = confirm("Are you sure you want to delete this scrape?");

    if(!confirmation){ return; }
      
    const deleteOperation = await deleteScrape({apiKey: "felix12m", scrapeId: savedScrapes[getIdx]._id, userId: User.id});

    if(!deleteOperation.acknowledged){
      push(`?app_error=${deleteOperation.errors[0]}&e_while=deleting%20saved%20scraper`);
      return
    };

    // positive deletion, revalidation only happens on refresh of the page
    const newSavedScrapers = savedScrapes;
    newSavedScrapers.splice(getIdx, 1);

    setSavedScrapes([...newSavedScrapers]);
    return;
  };

  const copyScrapeId = ({getIdx} : {getIdx : number}) : void => {

    const id = savedScrapes.at(getIdx)._id;
    navigator.clipboard.writeText(String(id));
    return;
  };

  const editScrape = async ({getIdx} : {getIdx : number}) : Promise<void> => {

    const put_data = {filter : {_id : savedScrapes[getIdx]._id}, update: {"$set" : {"name" : savedScrapes[getIdx].name, "description" : savedScrapes[getIdx].description}}};

    const editOperation = await putToDb({apiKey: "felix12m", dbName: "test_runs", collectionName: "scrape_info_saves", data: put_data});

    if(!editOperation.acknowledged){
      push(`?app_error=${editOperation.errors[0]}&e_while=saving%20edits`);
      return;
    };

    return;
  };

  const handleScrapeChange = ({getIdx, pName, value} : {getIdx : number, pName : string, value : any}) : void => {

    if(savedScrapes === null && savedScrapes === undefined ){ return; }

    const newSavedScrapers = savedScrapes;
    newSavedScrapers[getIdx][pName] = value;

    setSavedScrapes([...newSavedScrapers]);
    return;
  };

  const updateSavedData = ({scrapedData, getIdx} : {scrapedData : ScrapedData, getIdx : number}) => {
    setSavedScrapes((prevSavedScrapers) => {
      prevSavedScrapers.at(getIdx).scraped_data = scrapedData;
      return [...prevSavedScrapers];
    });
    showHideElement({elementId: "document-overlay-container"});
  };

  const runWebScrape = async ({getIdx} : {getIdx : number}) : Promise<void> => {

    showOverlay({context: context, title: "Scraped data", element: <LoadingDialog expectedWaitTime={savedScrapes[getIdx].runtime}/>});

    let payload = savedScrapes[getIdx].scraper;
    payload.args.amount_scrapes_global = savedScrapes[getIdx].scraper.all.length; // value is passed to decide if multithreading is 'possible'

    const runOperation = await runScrape({apiKey: "felix12m", userId: User.id, data: payload});

    if(!runOperation.acknowledged){
      push(`?app_error=${runOperation.errors[0]}&e_while=running%20scraper`);
      return;
    };

    setRunResults(runOperation.scraped_data); 

    showOverlay({context: context, title: "Running scraper!", element: <ScrapedDataOverlay scrapedData={runOperation.scraped_data} updateSavedData={updateSavedData} saveAbility={true} currentScrapeId={savedScrapes.at(getIdx)._id} currentScrapeIndex={getIdx} /> });

    return;
  };

  const getAllSavedScrapes = async () : Promise<void> => {

    const pull_operation = await pullSavedScrapes({apiKey: "felix12m", userId: User.id});

    if(!pull_operation.acknowledged){
      push(`?app_error=${pull_operation.errors[0]}&e_while=pulling%20saved%20scrapers`);
      return
    };

    setSavedScrapes(pull_operation.found);
    setMaxScrapes(pull_operation.scraper_storage);

    return;
  };
  
  var savedScrapesInitialFetch = true;
  useEffect(() => {

    if(AuthStatus === "unauthenticated"){
      showOverlay({context: context, element: <NotSignedInDialog message="You can't access/have saved scrapers. Please create an account or sign in!" />, title: "Not signed in!"});
      return;
    };
    
    if(AuthStatus === "authenticated" && savedScrapesInitialFetch){
      getAllSavedScrapes();
      savedScrapesInitialFetch = false;
    };

  }, []);

  return (
    <div id="saved-scrapers-container" className="c_col_elm w-full h-auto -mt-[80px]" >

      <h1 id="saved-scrapers-heading" className="font-[Inter] text-[40px] my-5" >
        { 
          !savedScrapes ? 
            (
              "Pulling saved scrapers..."
            ) 
            : 
            ( 
              AuthStatus === "unauthenticated" || (savedScrapes && !savedScrapes[0]?._id) ? 
                ("You have no saved scrapers") 
                : ("All your saved scrapers" )
            )
        }
      </h1>

      {
        <h2 id="saved-scrapers-amount-heading" className="text-[18px] text-start w-[95%] font-[700] px-1" >
          {`Amount: ${savedScrapes ? (Object.keys(savedScrapes).length) : ((AuthStatus === "unauthenticated" || (savedScrapes && !savedScrapes[0])) ? ("0") : ("?"))} of ${maxScrapes}`}
        </h2>
      }

      <hr id="saved-scrapers-separator" className="w-[95%] bg-black h-[2px] mb-4 " />

      <div id="saved-scrapers-wrapper" className="c_col_elm w-full h-auto gap-y-5 " >

        {
          !savedScrapes && (
            <ScaleLoader height={50} width={4} margin={3} speedMultiplier={2} color="#8A2BE2" />
          )
        }

        {
          
          savedScrapes && Array.from(savedScrapes.keys()).map((saveIdx) => {
            
            return(
              <section key={`saved-scraper-${saveIdx}`} id={`saved-scraper-${saveIdx}`} className=" relative w-[90%] h-auto flex flex-col items-center border-2 border-gray-600 dark:border-gray-300 bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg rounded-xl px-2 " >

                <aside id={`saved-scraper-options-${saveIdx}`} className="flex flex-row items-center w-full h-[60px] gap-x-2 " >

                  <div id={`copy-id-container-${saveIdx}`} className="relative group flex items-center justify-center min-w-[30px] h-full mb-[-3px]" >

                    <div id={`copy-id-tooltip-wrapper-${saveIdx}`} className="h-auto w-auto hidden group-hover:flex " >
                      <Tooltip xOrientation="left" content={"Copy scraper ID."} /> 
                    </div>

                    <Image id={`copy-id-tooltip-toggle`} className="cursor-pointer" src='/assets/icons/generic/copy.svg' alt='html id name input tooltip icon' width={26} height={26} onClick={() => { copyScrapeId({getIdx: saveIdx}); }} />

                  </div>

                  <div id={`saved-scraper-heading-wrapper-${saveIdx}`} className="relative flex flex-row items-center h-[32px]" >

                    <h2 id={`saved-scraper-heading-${saveIdx}`} className="text-[18px] w-[240px] max-w-[240px] overflow-hidden text-start flex flex-row items-center font-[500] whitespace-pre-wrap " >{`${savedScrapes[saveIdx].name}`}</h2>

                    <div id={`saved-scraper-heading-tooltip-container-${saveIdx}`} className="group relative flex items-center w-auto h-full mb-[-3px]" >

                      <Tooltip xOrientation="middle" yOrientation="top" content={"Show scraper metadata."} /> 

                      <Image id={`saved-scraper-heading-tooltip-toggle`} className="cursor-pointer" src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} onClick={() => { showHideElement({elementId: `saved-scraper-meta-container-${saveIdx}`}); showHideElement({elementId: `saved-scraper-options/meta-separator-${saveIdx}`}); }} />

                    </div>
                  </div>

                  <hr id={`saved-scraper-options-separator-0-${saveIdx}`} className="h-[50px] w-[2px] bg-gray-400 " />

                  <div id={`edit-scraper-container-${saveIdx}`} className="relative group flex items-center justify-center min-w-[30px] h-full mb-[-3px]" >

                    <div id={`edit-scraper-tooltip-wrapper-${saveIdx}`} className="h-auto w-auto hidden group-hover:flex " >
                      <Tooltip content={"Edit the scraper."} /> 
                    </div>

                    <Image id={`edit-scraper-tooltip-toggle`} className="cursor-pointer" src='/assets/icons/generic/edit.svg' alt='html id name input tooltip icon' width={26} height={26} onClick={() => { useScraper({useIdx: saveIdx}); }} />

                  </div>

                  <div id={`preview-scraper-container-${saveIdx}`} className="relative group flex items-center justify-center min-w-[30px] h-full mb-[-3px]" >

                    <div id={`preview-scraper-tooltip-wrapper-${saveIdx}`} className="h-auto w-auto hidden group-hover:flex " >
                      <Tooltip content={"Preview the scraper."} /> 
                    </div>

                    <Image id={`preview-scraper-tooltip-toggle`} className="cursor-pointer" src='/assets/icons/generic/view.svg' alt='html id name input tooltip icon' width={40} height={40} onClick={() => { showOverlay({context: context, title: "Preview your scraper!", element: <fieldset className="w-full h-full" disabled >
                                                                                                                                                                                                                                                                                          <PreviewWS previewData={savedScrapes.at(saveIdx).scraper} />
                                                                                                                                                                                                                                                                                        </fieldset>}); }} 
                    />

                  </div>

                  <hr id={`saved-scraper-options-separator-1-${saveIdx}`} className="h-[50px] w-[2px] bg-gray-400 " />

                  <div id={`scraped-data-container-${saveIdx}`} className="relative group flex items-center justify-center min-w-[30px] h-full mb-[-3px]" >

                    <div id={`scraped-data-tooltip-wrapper-${saveIdx}`} className="h-auto w-auto hidden group-hover:flex " >
                      <Tooltip content={"Show scraped data."} /> 
                    </div>

                    {
                      savedScrapes.at(saveIdx).scraped_data[0].scrape_runs[0] ?
                        (
                          <Image id={`scraped-data-tooltip-toggle`} src='/assets/icons/generic/data.svg' className="cursor-pointer" alt='html id name input tooltip icon' width={40} height={40} onClick={() => { showSavedScraperData({getIdx: saveIdx}); }} />
                        )
                        :
                        (
                          <Image id={`scraped-data-tooltip-toggle_disabled`} src='/assets/icons/generic/data.svg' className="cursor-not-allowed brightness-75" alt='html id name input tooltip icon' width={40} height={40} />
                        )
                    }

                  </div>

                  <div id={`run-scraper-container-${saveIdx}`} className="relative group flex items-center justify-center min-w-[30px] h-full" >

                    <div id={`run-scraper-tooltip-wrapper-${saveIdx}`} className="h-auto w-auto hidden group-hover:flex " >
                      <Tooltip content={"Run the scraper."} /> 
                    </div>

                    <Image id={`run-scraper-tooltip-toggle`} className="cursor-pointer" src='/assets/icons/scrape/rocket.svg' alt='html id name input tooltip icon' width={40} height={40} onClick={() => { runWebScrape({getIdx: saveIdx}); }} />

                  </div>

                  <div id={`delete-scraper-container-${saveIdx}`} className="group flex items-center w-auto h-full absolute right-2 " >

                    <div id={`delete-scraper-tooltip-wrapper-${saveIdx}`} className="relative w-auto h-full" >
                      <Tooltip content={"Delete the scraper."} /> 
                    </div>

                    <Image id={`delete-scraper-${saveIdx}`} src='/assets/icons/scrape/trash_can.svg' alt="delete saved scrape icon" width={40} height={40} className="cursor-pointer" onClick={() => { deleteSavedScrape({getIdx: saveIdx}); }}  />
                  </div>

                </aside>

                <hr id={`saved-scraper-options/meta-separator-${saveIdx}`} className='hidden border-[1px] h-[1px] mt-1 border-black dark:border-white w-full rounded-3xl opacity-20' />

                <div id={`saved-scraper-meta-container-${saveIdx}`} className="relative flex flex-col items-start w-full h-min gap-y-2 hidden pb-2 " > 

                    <h2 id={`scraper-index-heading-${saveIdx}`} className="text-[18px] w-[90px] text-start c_row_elm whitespace-pre-wrap " > <p className="font-[600]" >{"Scraper: "} </p>  
                      {String(Number(saveIdx) + 1)}
                    </h2>

                    <h2 id={`scraper-runtime-${saveIdx}`} className="text-[18px] w-full text-start c_row_elm whitespace-pre-wrap " > <p className="font-[600]" >{"Runtime: "} </p>  {savedScrapes[saveIdx].runtime + "sec"}</h2>

                    <h2 id={`scraper-name-heading-${saveIdx}`} className="text-[18px] w-full text-start c_row_elm whitespace-pre-wrap" > <p className="font-[600]" >{"Name: "} </p>
                      <input id={`scraper-name-${saveIdx}`} minLength={1} maxLength={22} value={savedScrapes[saveIdx].name} className=" w-full max-w-[540px] p-[2px] text-start px-2 bg-transparent border-2 border-gray-600 dark:border-gray-300 rounded-lg" onChange={(e) => { handleScrapeChange({getIdx: saveIdx, pName: "name", value: e.target.value}); }} />
                    </h2>

                    <h2 id={`scraper-description-heading-${saveIdx}`} className="text-[18px] w-[95%] h-auto text-start pl-1 flex flex-col items-start whitespace-pre-wrap break-all " > <p className=" ml-[-4px] font-[600] min-w-[80px]" >{"Description: "} </p>
                      <textarea 
                        id={`scraper-description-${saveIdx}`} 
                        maxLength={512} 
                        className="w-full max-w-[600px] h-max min-h-[120px] max-h-[400px] text-start px-1 bg-transparent border-2 p-1 border-gray-600 dark:border-gray-300 rounded-ss-none rounded-se-lg rounded-ee-none rounded-es-lg " 
                        value={savedScrapes[saveIdx].description} 
                        onChange={(e) => { handleScrapeChange({getIdx: saveIdx, pName: "description", value: e.target.value}); }} 
                      />
                    </h2>

                    <div id={`save-meta-changes-container-${saveIdx}`} className=" absolute right-0 bottom-4 group flex items-center justify-center min-w-[30px] h-min mb-[-3px] " >

                      <div id={`save-meta-changes-tooltip-wrapper-${saveIdx}`} className="relative h-auto w-auto hidden group-hover:flex " >
                        <Tooltip yOrientation="bottom" content={"Save changes."} /> 
                      </div>

                      <Image id={`save-meta-changes-${saveIdx}`} src='/assets/icons/scrape/save.svg' alt="delete saved scrape icon" width={50} height={50} className="cursor-pointer" onClick={() => { editScrape({getIdx: saveIdx}); }}  />
                    </div>

                </div>
                     
              </section>
            );
          })
        }
      </div>
    </div>
  );
};

export default SavedScrapes;
"use client";

import { putToDb, deleteScrape, pullSavedScrapes, runScrape } from "@utils/api_funcs";
import { useEffect, useState, useContext } from "react";
import { appContext } from "@app/layout";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ScaleLoader } from "react-spinners";
import PreviewWS from "../scraping/preview/PreviewWS";
import { adjustTextareaHeight, showHideElement } from "@utils/generalFunctions";
import { ScraperInfoResults, ScrapeInfoSave } from "@custom-types";
import Tooltip from "@components/design/Tooltip";
import ScrapedDataOverlay from "@components/overlays/ScrapedData";

const SavedScrapes = ({ User, AuthStatus }) => {

  const context = useContext(appContext);

  const emptyResults : ScraperInfoResults = {
    empty: true,
    0 : {
      scrape_runs : {0 : []}
    }
  };

  const [ savedScrapes, setSavedScrapes ] = useState<ScrapeInfoSave[]>(null);
  const [ maxScrapes, setMaxScrapes ] = useState("10");

  const [ runResults, setRunResults ] = useState<ScraperInfoResults>(emptyResults);

  const [ update, setUpdate ] =useState(1);

  const { push } = useRouter();

  const rerenderPage = () : void => {
    setUpdate((prevUpdate) => { return (prevUpdate +1) % 2; });
    return;
  };

  const showPreview = ({context, title, getIdx} : {context : any, title : string, getIdx : number}) => {

    const overlayContentContainer = window.document.getElementById("document-overlay-container");
    if(overlayContentContainer === null){ return; }
    const setContext = context.setAppContextData;

    setContext((prevContextData) => {

      prevContextData.overlayChild = (
        <fieldset className="w-full h-full" disabled >
          <PreviewWS previewData={{data: savedScrapes.at(getIdx), amount: (Object.keys(savedScrapes.at(getIdx).scrape_object.all)).length}} />
        </fieldset>
      );

      prevContextData.overlayChildTitle = title;
      return prevContextData;
    });
    showHideElement({elementId: "document-overlay-container"});
    context.updateContext((prevUpdate) => { return (prevUpdate +1) % 2});

    return;
  };

  const useScraper = ({useIdx} : {useIdx : number}) : void => {

    window.sessionStorage.setItem("passedSavedObject", JSON.stringify(savedScrapes[useIdx].scrape_object))
    window.sessionStorage.setItem("usePassed", "1")

    push(`/new-scraper`);

    return;
  };

  const deleteSavedScrape = async ({getIdx} : {getIdx : number}) : Promise<void> => {

    const confirmation = confirm("Are you sure you want to delete this scrape?");

    if(!confirmation){ return; }
      
    await deleteScrape({apiKey: "felix12m", scrapeId: savedScrapes[getIdx]._id, userId: User.id});

    // positive deletion, revalidation only happens on refresh of the page
    savedScrapes.splice(getIdx, 1);

    rerenderPage();

    return;
  };

  const copyScrapeId = ({getIdx} : {getIdx : number}) : void => {

    const id = savedScrapes.at(getIdx)._id;
    navigator.clipboard.writeText(String(id));
    return;
  };

  const editScrape = async ({getIdx} : {getIdx : number}) : Promise<void> => {

    const put_data = {filter : {_id : savedScrapes[getIdx]._id}, update: {"$set" : {"name" : savedScrapes[getIdx].name, "description" : savedScrapes[getIdx].description}}};

    await putToDb({apiKey: "felix12m", dbName: "test_runs", collectionName: "scrape_info_saves", data: put_data});

    return;
  };

  const handleScrapeChange = ({getIdx, pName, value} : {getIdx : number, pName : string, value : any}) : void => {

    if(savedScrapes === null && savedScrapes === undefined ){ return; }

    let dataCopy = savedScrapes;

    dataCopy[getIdx][pName] = value;

    setSavedScrapes(dataCopy);
    rerenderPage();
    return;
  };

  const updateSavedData = ({scrapedData, getIdx} : {scrapedData : ScraperInfoResults, getIdx : number}) => {

    setSavedScrapes((prevSavedScrapes) => {
      prevSavedScrapes.at(getIdx).results = scrapedData;
      return prevSavedScrapes;
    });
    showHideElement({elementId: "document-overlay-container"});
    rerenderPage();
  };

  const showOverlay = ({type, title} : {type : string, title : string} , kwargs : any) => {

    const overlayContentContainer = window.document.getElementById("document-overlay-container");
    if(overlayContentContainer === null){return;}
    const setContext = context.setAppContextData;

    setContext((prevContextData) => {

      if(type === "run"){
        prevContextData.overlayChild = <ScrapedDataOverlay updateSavedData={updateSavedData} expectedWaitTime={Number(savedScrapes.at(kwargs.getIdx).runtime)} saveAbility={true} currentScrapeId={savedScrapes.at(kwargs.getIdx)._id} currentScrapeIndex={kwargs.getIdx} />
      }
      else if(type === "scrapedData"){
        prevContextData.overlayChild = <ScrapedDataOverlay saveAbility={false} />
      }

      prevContextData.overlayChildTitle = title;

      return prevContextData;
    });

    if(kwargs.results !== undefined){
      setContext((prevAppContextData) => {
        prevAppContextData.overlayChildData.results = kwargs.results;
        return prevAppContextData;
      });
    };
    showHideElement({elementId: "document-overlay-container"});
    context.updateContext((prevUpdate) => { return (prevUpdate +1) % 2});

  };

  const runWebScrape = async ({getIdx} : {getIdx : number}) : Promise<void> => {

    context.setAppContextData((prevAppContextData) => {
      prevAppContextData.overlayChildData.results = emptyResults;
      return prevAppContextData;
    });

    showOverlay({type: "run", title: "Running scraper!"}, {getIdx: getIdx});

    let bodyData = savedScrapes[getIdx].scrape_object;
    bodyData.args.amount_scrapes_global = Object.keys(savedScrapes[getIdx].scrape_object.all).length; // value is passed to decide if multithreading is 'possible'

    const stringified = JSON.stringify(bodyData);

    const runOperation = await runScrape({apiKey: "felix12m", userId: User.id, data: stringified})

    setRunResults(runOperation.results); 

    context.setAppContextData((prevAppContextData) => {
      prevAppContextData.overlayChildData.results = runOperation.results;
      return prevAppContextData;
    });

    context.updateContext((prevUpdate) => { return (prevUpdate +1) % 2});
    return;
  };

  const getAllSavedScrapes = async () : Promise<void> => {

    const pull_operation = await pullSavedScrapes({apiKey: "felix12m", userId: User.id});

    setSavedScrapes(pull_operation.found);
    setMaxScrapes(pull_operation.scraper_storage);

    return;
  };
  
  var savedScrapesInitialFetch = true;

  useEffect(() => {
    
    if(savedScrapesInitialFetch){
      getAllSavedScrapes();
      savedScrapesInitialFetch = false;
    }

    if(savedScrapes === undefined || savedScrapes === null){ return; }

    const allKeys = Object.keys(savedScrapes);
    
    for (const key of allKeys){ adjustTextareaHeight({elementId: `scraper-description-${key}`, offset: 60}); }

  }, []);

  if(savedScrapes !== null && savedScrapes?.at(0) === undefined){
    return (
      <div className="c_col_elm w-full h-auto " >
        <h1 className="subhead_text pb-1" > You have no saved scrapes</h1>
        <hr className="w-[95%] bg-black h-[2px] mb-4 " />
      </div>

    );
  };

  return (
    <div id="saved-scrapers-container" className="c_col_elm w-full h-auto " >

      <h1 id="saved-scrapers-heading" className="font-[Inter] text-[40px] my-5" >
        {
          savedScrapes === null ?
            (
              "Pulling saved scrapers..."
            )
            :
            (
              "All your saved scrapers"
            )
        }
      </h1>

      <div id="saved-scrapers-amount-wrapper" className="c_row_elm w-full justify-start px-[2.5%] mb-1 gap-x-5 " >
        {
          savedScrapes !== null && 
            (
              <h2 id="saved-scrapers-amount-heading" className="text-[18px] font-[700] px-1" >
                {`Amount: ${Object.keys(savedScrapes).length} of ${maxScrapes}`}
              </h2>
            )
        }
      </div>

      <hr id="saved-scrapers-separator" className="w-[95%] bg-black h-[2px] mb-4 " />

      <div id="saved-scrapers-wrapper" className="c_col_elm w-full h-auto gap-y-5 " >

        {
          savedScrapes === null && (
            <ScaleLoader height={50} width={4} margin={3} speedMultiplier={2} color="#8A2BE2" />
          )
        }

        {
          savedScrapes !== null && Array.from(savedScrapes.keys()).map((saveIdx) => {

            return(
              <section key={`saved-scraper-${saveIdx}`} id={`saved-scraper-${saveIdx}`} className=" relative w-[90%] h-auto flex flex-col items-center border-2 border-gray-600 dark:border-gray-300 bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg rounded-xl px-2 " >

                <aside id={`saved-scraper-options-${saveIdx}`} className="flex flex-row items-center w-full h-[60px] gap-x-2 " >

                  <div id={`copy-id-container-${saveIdx}`} className="relative group flex items-center justify-center min-w-[30px] h-full mb-[-3px]" >

                    <div id={`copy-id-tooltip-wrapper-${saveIdx}`} className="h-auto w-auto hidden group-hover:flex " >
                      <Tooltip xOrientation="right" content={"Copy scraper ID."} /> 
                    </div>

                    <Image id={`copy-id-tooltip-toggle`} className="cursor-pointer" src='/assets/icons/generic/copy.svg' alt='html id name input tooltip icon' width={26} height={26} onClick={() => { copyScrapeId({getIdx: saveIdx}); }} />

                  </div>

                  <div id={`saved-scraper-heading-wrapper-${saveIdx}`} className="relative flex flex-row items-center h-[32px]" >

                    <h2 id={`saved-scraper-heading-${saveIdx}`} className="text-[18px] w-[240px] max-w-[240px] overflow-hidden text-start flex flex-row items-center font-[500] whitespace-pre-wrap " >{`${savedScrapes[saveIdx].name}`}</h2>

                    <div id={`saved-scraper-heading-tooltip-container-${saveIdx}`} className="group flex items-center justify-center min-w-[30px] h-full mb-[-3px]" >

                      <div id={`saved-scraper-heading-tooltip-wrapper-${saveIdx}`} className="h-auto w-auto hidden group-hover:flex " >
                        <Tooltip content={"Show scraper metadata."} /> 
                      </div>

                      <Image id={`saved-scraper-heading-tooltip-toggle`} className="cursor-pointer" src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} onClick={() => { showHideElement({elementId: `saved-scraper-meta-container-${saveIdx}`}); showHideElement({elementId: `saved-scraper-options/meta-separator-${saveIdx}`}) ;rerenderPage(); }} />

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

                    <Image id={`preview-scraper-tooltip-toggle`} className="cursor-pointer" src='/assets/icons/generic/view.svg' alt='html id name input tooltip icon' width={40} height={40} onClick={() => { showPreview({context: context, title: "Preview your scraper!", getIdx: saveIdx}); }} />

                  </div>

                  <hr id={`saved-scraper-options-separator-1-${saveIdx}`} className="h-[50px] w-[2px] bg-gray-400 " />

                  <div id={`scraped-data-container-${saveIdx}`} className="relative group flex items-center justify-center min-w-[30px] h-full mb-[-3px]" >

                    <div id={`scraped-data-tooltip-wrapper-${saveIdx}`} className="h-auto w-auto hidden group-hover:flex " >
                      <Tooltip content={"Show scraped data."} /> 
                    </div>

                    {
                      !savedScrapes.at(saveIdx).results.empty ?
                        (
                          <Image id={`scraped-data-tooltip-toggle`} src='/assets/icons/generic/data.svg' className="cursor-pointer" alt='html id name input tooltip icon' width={40} height={40} onClick={() => { showOverlay({type: "scrapedData", title: "Scraped data!"}, {getIdx: saveIdx, results: savedScrapes.at(saveIdx).results}) }} />
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

                  <div id={`delete-scraper-container-${saveIdx}`} className="group flex items-center justify-center min-w-[30px] h-full mb-[-3px] absolute right-2 " >

                    <div id={`delete-scraper-tooltip-wrapper-${saveIdx}`} className="relative h-auto w-auto hidden group-hover:flex " >
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

                    <div id={`save-meta-changes-container-${saveIdx}`} className="group flex items-center justify-center min-w-[30px] h-min mb-[-3px] absolute right-[600px] bottom-4 " >

                      <div id={`save-meta-changes-tooltip-wrapper-${saveIdx}`} className="relative h-auto w-auto hidden group-hover:flex " >
                        <Tooltip content={"Save changes."} /> 
                      </div>

                      <Image id={`save-meta-changes-${saveIdx}`} src='/assets/icons/scrape/save.svg' alt="delete saved scrape icon" width={40} height={40} className="cursor-pointer" onClick={() => { editScrape({getIdx: saveIdx}); }}  />
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
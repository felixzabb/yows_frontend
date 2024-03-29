"use client";

import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { pullFromDbCall, runScrapeOrScraperCall, saveScraperCall } from "@utils/apiCalls";
import { actionRuntime, handleWindowClose, showOverlay } from "@utils/generalUtils";
import { validateUrl } from "@utils/customValidation";
import Tooltip from "../custom/Tooltip";
import ScrapedDataOverlay from "@components/overlays/ScrapedData";
import { hideElement, rotateElement, showHideElement, showElement } from "@utils/htmlAbstractions";
import NotSignedInDialogue from "@components/dialogues/NotSignedInDialogue";
import { useRouter } from "next/navigation";
import LoadingDialogue from "@components/dialogues/LoadingDialogue";
import LoopContainer from "./LoopContainer";
import WorkflowActionsContainer from "./WorkflowActionsContainer";
import WSFormJsonEditor from "@components/codeEditors/WSFormJsonEditor";
import { scrapeSchema, scraperSchema } from "@schemas/scraperSchemas";
import ScrapeParamsContainer from "./ScrapeParamsContainer";
import ScraperFormSideNav from "./ScraperFormSideNav";
import { overlayContext } from "@components/layout/Provider";

const ScraperForm = ({ User, authStatus, previewData } : { User : UserSessionData, authStatus : "authenticated" | "unauthenticated", previewData? : ScraperData }) => {

  // Everything to do with creating a scraper. Need to be defined here because of shallow/deep copy shenanigans

  const defActionType = "scrape";

  const defActionData = {
    "scrape": { css_selectors: "" },
    "button-press": { css_selectors: "" },
    "input-fill": { css_selectors: "", fill_content: "" },
    "wait": { time: 0 },
  };

  const defAction : WorkflowData = { type: defActionType, data: defActionData[defActionType], as: "text" };

  const defWorkflow : WorkflowData[] = [defAction];

  const defLoop : LoopData = { start: 1, end: 1, iterations: 2, created: false };

  const defScrapeParams : ScrapeParams = { url: "", url_as: "text", browser: "chrome", exec_type: "sequential", swallow_errors: false };

  const defScraperMeta : ScraperMeta = { user_email: "", expected_runtime_seconds: 0, }

  const defScrape : ScrapeData = {
    workflow: defWorkflow,
    loop: defLoop,
    scrape_params: defScrapeParams,
  };

  const defScraper : ScraperData = {
    scrapes: [defScrape],
    meta: defScraperMeta,
  };

  const overlayContextAccess = useContext<OverlayContextValue>(overlayContext);

  const { push } = useRouter();

  const [ scraper, setScraper ] = useState(defScraper);
  const amountScrapes = scraper?.scrapes.length;
  const [ scraperRunning, setScraperRunning ] = useState(false);
  const [ scrapedData, setScrapedData ] = useState<ScrapedData | null>(null);
  const [ userData, setUserData ] = useState<ScraperUserData | null>(null);
  const [ scraperValidity, setScraperValidity ] = useState<{ all: boolean, [index : number]: boolean }>({ all: false, 0: false });
  const [ editMode, setEditMode ] = useState<"normal" | "json">("normal");

  /** Only for dev!!! */
  useEffect(() => {

    console.log("Rerender...");
    console.log("Current info:", scraper);

  });

  // See if there is a scraper that should be used in sessionStorage and if yes set it.
  // Also add the 'beforeunload' event listener and set the user email from session.
  useEffect(() => {

    setScraper((prevScraper) => ({
      ...prevScraper,
      meta: {
        ...prevScraper.meta,
        user_email: User.email,
      }
    }));
     
    if(Number(window.sessionStorage.getItem("usePassedScraper"))){

      window.sessionStorage.setItem("usePassedScraper", "0");

      const passedObject : ScraperData | null = JSON.parse(window.sessionStorage.getItem("passedScraper"));
      if(!passedObject){ return; };
      
      setScraper(passedObject);
      assertScraperValidity({ amount: passedObject.scrapes.length });
    };

    window.addEventListener('beforeunload', handleWindowClose);

    return () => { window.removeEventListener('beforeunload', handleWindowClose); };
  }, []);

  // Check if there is previewData to be shown and if yes set it.
  useEffect(() => {
    if(previewData){ setScraper({ ...previewData }); };
  }, [previewData]);

  // Get and set user data or tell the user they're not signed in.
  useEffect(() => {

    const getUserData = async () : Promise<void> => {

      const pullData = { filter : { _id : User.id }, projection: ["api", "subscription", "saved_scrapers"] };
      const pullOperation = await pullFromDbCall<BaseApiReturn & ScraperUserData>({ dbName: "yows_users", collectionName: "users", data: pullData });
  
      if(!pullOperation.acknowledged){
        push(`?app_error=${pullOperation.errors[0]}&e_while=loading%20profile`);
        return;
      };
  
      setUserData(pullOperation.found.at(0));
    };

    if(authStatus === "authenticated"){ 
      getUserData(); 
    }
    else if(authStatus === "unauthenticated"){ 
      showOverlay({
        context: overlayContextAccess, 
        element: <NotSignedInDialogue message="If you want to use all features, please create an account or sign in." />, 
        title: "Not signed in!"
      }); 
    };

  }, [authStatus]);

  // Assert the scraperValidity of the scraper and individual scrapes every time connected data changes.
  useEffect(() => {
    assertScraperValidity({ amount: amountScrapes });
  }, [amountScrapes, scraper, userData]);

  // Functions that mutate the scraper.

  const resetScraper = () => {
  
    if(!confirm("Are your sure you want to reset the whole scraper?")){ return; };

    for(let scrapeIdx = 0; scrapeIdx < scraper.scrapes.length; ++scrapeIdx){
      resetScrapeByIndex({ scrapeIdx: scrapeIdx });
    };

    setScraper((prevScraper) => ({
      ...prevScraper,
      scrapes: [defScrape]
    }));
  };

  // functions that mutate the scrapes object in the scraper.

  const resetScrapeByIndex = ({ scrapeIdx, confirmNeeded } : { scrapeIdx: number, confirmNeeded? : boolean }) : void => {

    if(confirmNeeded && !confirm("Do you want to reset the current scrape?")){ return; };

    const sequentialExecutionRadioButton = window.document.getElementById(`execution-type-sequential-${scrapeIdx}`) as HTMLInputElement;
    sequentialExecutionRadioButton.checked = true;

    const chromeBrowserRadioButton = window.document.getElementById(`browser-Chrome-${scrapeIdx}`) as HTMLInputElement;
    chromeBrowserRadioButton.checked = true;

    const swallowErrorsCheckbox = window.document.getElementById(`swallow-errors-${scrapeIdx}`) as HTMLInputElement;
    swallowErrorsCheckbox.checked = false;

    const scrapesCopy = scraper.scrapes;
    scrapesCopy[scrapeIdx] = defScrape;

    setScraper((prevScraper) => ({
      ...prevScraper,
      scrapes: scrapesCopy
    }));

    hideElement({ elementId: `loop-container-${scrapeIdx}` });
    hideElement({ elementId: `actions-loop-separator-${scrapeIdx}` });
  };

  const removeScrapeByIndex = ({ scrapeIdx } : { scrapeIdx : number }) : void => {

    if(!confirm("Do you want to delete this scrape?")){ return; };

    const scrapesCopy = scraper?.scrapes;
    scrapesCopy.splice(scrapeIdx, 1);

    setScraper((prevScraper) => ({
      ...prevScraper,
      scrapes: scrapesCopy,
    }));
  };

  const appendScrape = () : void => {

    setScraper((prevScraper) => ({
      ...prevScraper,
      scrapes: [
        ...prevScraper.scrapes,
        defScrape
      ]
    }));   
  };

  const switchTwoScrapes = ({ scrapeIdx, localIndex, dropIndex } : { scrapeIdx : number, localIndex : number, dropIndex : number }) : void => {

    const scrapesCopy = scraper?.scrapes;

    // Assigns the data of the two workflow objects which need to switch places.
    const firstDataPoint = scrapesCopy[scrapeIdx].workflow[localIndex];
    const secondDataPoint = scrapesCopy[scrapeIdx].workflow[dropIndex];

    scrapesCopy[scrapeIdx].workflow[localIndex] = secondDataPoint;
    scrapesCopy[scrapeIdx].workflow[dropIndex] = firstDataPoint;

    setScraper((prevScraper) => ({
      ...prevScraper,
      scrapes: scrapesCopy,
    }));
  };

  // Functions that mutate the workflow object in the scraper.

  const removeActionByIndex = ({ scrapeIdx, workflowIndex } : { scrapeIdx: number, workflowIndex: number}) : void => {

    const scrapesCopy = scraper?.scrapes;
    scrapesCopy[scrapeIdx].workflow.splice(workflowIndex, 1);

    const workflowLength = scraper.scrapes[scrapeIdx].workflow.length;
    if(workflowLength < scraper.scrapes[scrapeIdx].loop.end || workflowLength < scraper.scrapes[scrapeIdx].loop.start){

      scrapesCopy.at(scrapeIdx).loop.start = 1;
      scrapesCopy[scrapeIdx].loop.end = 1;
    };
    
    setScraper((prevScraper) => ({
      ...prevScraper,
      scrapes: scrapesCopy,
    }));
  };

  const appendAction = ({ scrapeIdx, type } : { scrapeIdx : number, type : ActionName }) : void => {

    const scrapesCopy = scraper?.scrapes;
    scrapesCopy[scrapeIdx].workflow.push({ type: type, data: defActionData[type], as: "text" });

    setScraper((prevScraper) => ({
      ...prevScraper,
      scrapes: scrapesCopy,
    }));
  };

  // Functions that mutate the loop object in the scraper.

  const resetLoopByIndex = ({ scrapeIdx } : { scrapeIdx : number }) : void => {

    const scrapesCopy = scraper?.scrapes;
    scrapesCopy[scrapeIdx].loop = defLoop;

    setScraper((prevScraper) => ({
      ...prevScraper,
      scrapes: scrapesCopy
    }));

    hideElement({ elementId: `loop-container-${scrapeIdx}` }); 
    hideElement({ elementId: `actions-loop-separator-${scrapeIdx}` });
  };

  const createLoopByIndex = ({ scrapeIdx } : { scrapeIdx: number }) : void => {

    const scrapesCopy = scraper?.scrapes;
    const workflowLength = scraper.scrapes[scrapeIdx].workflow.length;

    scrapesCopy[scrapeIdx].loop.created = true;

    scrapesCopy[scrapeIdx].loop.start = workflowLength; // loop start
    scrapesCopy[scrapeIdx].loop.end = workflowLength; // loop end (because no member in the current loop)

    setScraper((prevScraper) => ({
      ...prevScraper,
      scrapes: scrapesCopy
    }));

    showElement({ elementId: `loop-container-${scrapeIdx} `}); 
    showElement({ elementId: `actions-loop-separator-${scrapeIdx}` });
  };

  // Functions that handle input changes and mutate the scraper.

  const handleScrapeParamChange = ({ scrapeIdx, paramName, value } : { scrapeIdx : number, paramName : string, value : string | number | boolean }) : void => {

    const scrapesCopy = scraper?.scrapes;
    scrapesCopy[scrapeIdx].scrape_params[paramName] = value;

    setScraper((prevScraper) => ({
      ...prevScraper,
      scrapes: scrapesCopy
    }));
  };

  const handleActionChange = ({ scrapeIdx, workflowIndex, paramName, value, as } : { scrapeIdx : number, workflowIndex : number, paramName? : string, value? : string | number, as? : ActionDataType }) : void => {

    const scrapesCopy = scraper?.scrapes;
    if(value === "" || value){
      scrapesCopy[scrapeIdx].workflow[workflowIndex].data[paramName] = value;
    }
    else if(as){
      scrapesCopy[scrapeIdx].workflow[workflowIndex].as = as;
    }

    setScraper((prevScraper) => ({
      ...prevScraper,
      scrapes: scrapesCopy
    }));
  };

  const handleLoopChange = ({ scrapeIdx, paramName, value } : { scrapeIdx : number, paramName : string, value : number }) : void => {

    const scrapesCopy = scraper?.scrapes;
    scrapesCopy[scrapeIdx].loop[paramName] = value;
    setScraper((prevScraper) => ({
      ...prevScraper,
      scrapes: scrapesCopy
    }));
  };

  // Functions that validate the scraper or individual scrapes.

  const assertScraperValidity = ({ amount } : { amount : number }) : void => {

    let tempScraperValidity = { all: scraperSchema.safeParse(scraper).success };

    for(let scrapeIdx = 0; scrapeIdx < amount; ++scrapeIdx){
      tempScraperValidity[scrapeIdx] = scrapeSchema.safeParse(scraper.scrapes[scrapeIdx]).success;
    };

    setScraperValidity(tempScraperValidity);
  };

  // Functions that compute scraper metadata.

  const calculateScrapeRuntimeByIndex = ({ scrapeIdx } : { scrapeIdx : number }) : number => {
     
    let cumRunTime = 5; // +5 for return and runtime reasons

    for(const action of scraper.scrapes[scrapeIdx].workflow){

      for(const dataValue of Object.values(action.data)){
        cumRunTime += actionRuntime({ type: action.type, data: dataValue as any, as: action.as });
      }
    };

    if(scraper.scrapes[scrapeIdx].loop.created){
      
      const loopStart = scraper.scrapes[scrapeIdx].loop.start;
      const loopEnd = scraper.scrapes[scrapeIdx].loop.end;
      const loopIterations = scraper.scrapes[scrapeIdx].loop.iterations;

      let oneLoopTime = 0;

      for(let loopIndex = (loopStart - 1); loopIndex < loopEnd; loopIndex += 1){  // no -1 at loopEnd because last number is exclusive

        const action = scraper.scrapes[scrapeIdx].workflow[loopIndex];

        for(const dataValue of Object.values(action.data)){
          oneLoopTime += actionRuntime({ type: action.type, data: dataValue as any, as: action.as });
        }
      };

      cumRunTime += (oneLoopTime * (loopIterations - 1));
    };

    return cumRunTime;
  };

  const calculateScraperRuntime = () : number => {

    let cumWaitTime = 0;

    for(const scrapeIdx of Array.from(scraper?.scrapes.keys())){

      cumWaitTime += calculateScrapeRuntimeByIndex({ scrapeIdx: scrapeIdx });
    };

    return cumWaitTime;
  };

  // Functions that interact with the backend.

  const runScrapeOrScraper = async ({ scrapeIdx, runWhole } : { scrapeIdx? : number, runWhole? : boolean }) : Promise<void> => {
    
    setScraperRunning(true);
    
    const expectedRuntime = calculateScrapeRuntimeByIndex({ scrapeIdx: scrapeIdx });

    showOverlay({ 
      context: overlayContextAccess, 
      title: "Scraped data", 
      element: <LoadingDialogue expectedWaitTime={expectedRuntime} /> 
    });

    let runData : ScraperData;

    if(runWhole){
      runData = scraper; 
      runData.meta.expected_runtime_seconds = expectedRuntime;
    }
    else{
      runData = { 
        scrapes : [scraper?.scrapes[scrapeIdx]], 
        meta : { user_email : User.email, expected_runtime_seconds: expectedRuntime } 
      };
    };
    
    const runOperation = await runScrapeOrScraperCall({ userId: User.id, data: runData });
    setScraperRunning(false);
    
    if(!runOperation.acknowledged){
      push(`?app_error=${runOperation.errors[0]}&e_while=running%20scraper`);
      return;
    };

    setScrapedData(runOperation.scraped_data);
    
    showOverlay({
      context: overlayContextAccess, 
      title: "Scraped data", 
      element: <ScrapedDataOverlay scrapedData={runOperation.scraped_data} /> 
    });
  };

  const saveScraper = async ({ name, description, saveScrapedData } : { name : string, description : string, saveScrapedData? : boolean }) : Promise<boolean> => {

    const saveData = [{
      scraper : scraper, 
      name: name, 
      description: description, 
      expected_runtime_seconds: calculateScraperRuntime(), 
      scraped_data: saveScrapedData ? scrapedData : null
    }];

    const saveOperation : SaveScraperReturn = await saveScraperCall({ userId: User.id, data: saveData });

    if(!saveOperation.acknowledged){
      // Not creating an app error because the save dialog handles it in a custom way.
      // push(`?app_error=${saveOperation.errors[0]}&e_while=saving%20scraper`);
      return false;
    };

    navigator.clipboard.writeText(saveOperation.created_item);

    return true;
  };
  
  const loadScraper = async ({ scraperId, withScrapedData, confirmNeeded } : { scraperId : string, withScrapedData : boolean, confirmNeeded? : boolean }) : Promise<boolean> => {

    if(confirmNeeded && !confirm("Loading the link will remove your current work")){ return; };
  
    const pullData = { filter : { _id : scraperId }, projection: ["scraper", "scraped_data"] };

    const pullOperation = await pullFromDbCall<SavedScraper>({ dbName: "test_runs", collectionName : "scrape_info_saves", data: pullData });

    if(!pullOperation.acknowledged || pullOperation.found.length === 0){
      // Not creating an app error because the save dialog handles it in a custom way.
      // push(`?app_error=${pullOperation.errors[0]}&e_while=loading%20scraper`);
      return false;
    };

    const loadedScraper : ScraperData = pullOperation.found.at(0).scraper;

    setScraper(loadedScraper);

    setScrapedData(pullOperation.found.at(0).scraped_data);

    return true;
  };

  return ( 
    <div id="wsform-container" className="flex flex-row flex-grow items-start justify-start w-full h-[calc(100dvh-62px)]" >
      
      {
        !previewData && (
          <ScraperFormSideNav
            appendScrape={appendScrape}
            resetPage={resetScraper}
            loadScraper={loadScraper}
            saveScraper={saveScraper}
            userData={userData}
            calculateScraperWaitTime={calculateScraperRuntime}
            scraper={scraper}
            scraperValidity={scraperValidity}
            runScraper={runScrapeOrScraper}
            authStatus={authStatus}
            scrapedData={scrapedData}
            removeScrapeByIndex={removeScrapeByIndex}
            scraperRunning={scraperRunning}
          />
        )
      }

      <div className="scraper_grid p-5 pb-20 mt-5 w-full h-[100%-200px] max-h-[90dvh] mx-[1%] overflow-auto" >
        {   
          Array.from(Array(amountScrapes).keys()).map((index) => (

            <section key={`scrape-${index}`} id={`scrape-${index}`} className='gap-y-2 flex flex-col items-center h-min justify-between rounded-xl w-min border-[3px] bg-header-light-bg dark:bg-header-dark-bg border-purple-500 dark:border-purple-300 shadow-[0px_0px_10px_#000000] dark:shadow-[0px_0px_10px_#FFFFFF] ' > 
              
              <aside className="flex flex-row items-center justify-between min-w-[600px] p-2 w-full h-[50px] rounded-xl shadow-[0px_2px_2px_darkslateblue] bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg " >

                <div className="relative flex flex-row items-center gap-x-2 w-[150px]"  >

                  {
                    scraperValidity[index] ? 
                      (
                        <Image
                          width={36} height={36}
                          src="/assets/icons/scrape/valid.svg" 
                          alt="Scrape valid"
                          className="cursor-default w-[40px] h-[40px]"
                        />
                      ) 
                      :
                      (
                        <Image 
                          width={28} height={28} 
                          src="/assets/icons/scrape/invalid.svg" 
                          alt="Scrape invalid"
                          className="cursor-default w-[40px] h-[40px]"
                        />
                      )
                  }

                  <h3 className="w-fit font-inter font-[500] text-[18px]"  >
                    {`Scrape: ${index + 1}`}
                  </h3>

                </div>

                <div className="c_row_elm justify-end gap-x-2" >

                  <div className="relative group flex items-center justify-center min-w-[30px] h-full" >

                    <Tooltip yOrientation="top" content={"Run this scrape. Need to be valid!"} /> 

                    {
                      !scraperRunning && scraperValidity[index] ? 
                        (
                          <Image
                            src={"/assets/icons/scrape/rocket.svg"}
                            alt={"Run scraper"}
                            width={32} height={32}
                            onClick={() => { runScrapeOrScraper({ scrapeIdx: index }); }}
                          />
                        )
                        :
                        (
                          <Image
                            src={"/assets/icons/scrape/rocket.svg"}
                            alt={"Run scraper (disabled)"}
                            width={32} height={32}
                            className="cursor-not-allowed opacity-50"
                          />
                        )
                    }

                  </div>
                  
                  <hr className="h-[38px] w-[2px] bg-gray-400 " />

                  <div className="relative group flex items-center justify-center min-w-[30px] h-full" >

                    <Tooltip yOrientation="top" content={`Edit this scrape via ${editMode === "json" ? "a UI." : "raw JSON."}`} /> 

                    {
                      editMode === "normal" ? 
                        (
                          <Image
                            src={"/assets/icons/generic/curly_braces.svg"}
                            alt={"Edit scrape as JSON"}
                            width={26} height={28}
                            onClick={() => { setEditMode("json"); }}
                          />
                        )
                        :
                        (
                          <Image
                            src={"/assets/icons/generic/cursor.svg"}
                            alt={"Edit scrape via UI"}
                            width={26} height={28}
                            onClick={() => { setEditMode("normal"); }}
                          />
                        )
                    }

                  </div>

                  <hr className="h-[38px] w-[2px] bg-gray-400 " />
                  
                  <div className="relative group flex items-center justify-center min-w-[30px] h-full" >

                    <Tooltip yOrientation="top" content={"Delete this scrape. Can't delete if only 1 exists!"} /> 

                    {
                      amountScrapes > 1 ?
                        (
                          <Image 
                            src='/assets/icons/scrape/trash_can.svg' 
                            onClick={() => { removeScrapeByIndex({ scrapeIdx: index }); }} 
                            width={34} height={34} 
                            alt="Delete scrape" 
                          /> 
                        )
                        :
                        (
                          <Image 
                            src='/assets/icons/scrape/trash_can.svg' 
                            width={34} height={34} 
                            alt="Delete scrape (disabled)" 
                            className="opacity-50 cursor-not-allowed" 
                          />
                        )
                    }

                  </div>

                  <div className="relative group flex items-center justify-center min-w-[30px] h-full" >

                    <Tooltip yOrientation="top" content={"Reset scrape."} /> 

                    <Image 
                      onClick={() => { resetScrapeByIndex({ scrapeIdx: index, confirmNeeded: true }); }} 
                      src='/assets/icons/scrape/reset.svg' 
                      width={32} height={32} 
                      alt="Reset scrape" 
                    />

                  </div>

                  <div className="relative group flex items-center justify-center min-w-[30px] h-full" >

                    <Tooltip yOrientation="top" content={"Toggle visibility."} /> 

                    <Image 
                      className=" rotate-180" 
                      width={34} height={34} 
                      src="/assets/icons/generic/updownarrow.svg" 
                      id={`toggle-scrape-visibility-${index}`}  
                      alt={"Expand/Collapse scrape"}
                      onClick={() => { 
                        showHideElement({elementId: `scrape-form-${index}`}); 
                        rotateElement({elementId: `toggle-scrape-visibility-${index}`, degrees: "180"}); 
                      }}
                    />

                  </div>
                      
                </div>

              </aside>

              {
                editMode === "normal" && (
                  <form id={`scrape-form-${index}`} className="px-2 min-w-[600px] flex flex-col items-center h-full w-auto justify-around gap-y-2 mb-2" >

                    <ScrapeParamsContainer
                      scrapeIdx={index}
                      scraper={scraper}
                      handleScrapeParamsChange={handleScrapeParamChange}
                      resetLoopByIndex={resetLoopByIndex}
                    />

                    <hr className="w-[98%] h-[2px] bg-black " />

                    <div className="w-full h-full flex flex-row items-start gap-x-4" >

                      <div className="flex flex-col items-start gap-y-1 pb-5 "  >

                          {
                            /** This whole thing as a map */
                            // So that there is always at least one workflow element.
                            scraper?.scrapes[index] !== undefined && scraper?.scrapes[index] !== null  && scraper?.scrapes[index].workflow.length > 1 ?
                              (

                                <button className="row_options_button bg-[#bd3030]"  
                                  onClick={(e) => { e.preventDefault(); removeActionByIndex({ scrapeIdx: index, workflowIndex: scraper?.scrapes[index].workflow.length - 1 }); }} >
                                  - last
                                </button>
                              )
                              :
                              (
                                <button disabled className="row_options_button brightness-50 bg-gray-300 dark:bg-gray-600 cursor-not-allowed " >
                                  - last
                                </button>
                              )
                          }

                          <button className="row_options_button bg-[#003314cc]" 
                            onClick={(e) => { e.preventDefault(); appendAction({ scrapeIdx: index, type: "scrape" }); }} >
                            + Scrape
                          </button>

                          <button className="row_options_button bg-[#003314cc] " 
                            onClick={(e) => { e.preventDefault(); appendAction({ scrapeIdx: index, type: "button-press" }); }} >
                            + Button
                          </button>

                          <button className="row_options_button bg-[#003314cc] " 
                            onClick={(e) => { e.preventDefault(); appendAction({ scrapeIdx: index, type: "input-fill" }); }} >
                            + Input
                          </button>

                          <button className="row_options_button bg-[#003314cc] " 
                            onClick={(e) => { e.preventDefault(); appendAction({ scrapeIdx: index, type: "wait" }); }} >
                            + Wait
                          </button>

                          {
                            !scraper?.scrapes[index].loop.created ?

                              (
                                <button disabled={scraper?.scrapes[index].scrape_params.exec_type === "looping"} className="row_options_button bg-purple-500 dark:bg-purple-700" 
                                  onClick={(e) => { e.preventDefault(); createLoopByIndex({ scrapeIdx: index }); }} >
                                  + Loop
                                </button>
                              )
                              :
                              (
                                <button id={`toggle-loop-visibility-${index}`} className="row_options_button flex flex-row gap-x-2 bg-purple-500 dark:bg-purple-700" 
                                  onClick={(e) => { 
                                    e.preventDefault(); 
                                    showHideElement({elementId: `loop-container-${index}`}); 
                                    showHideElement({elementId: `actions-loop-separator-${index}`}); 
                                  }}  
                                >
                                  <Image
                                    src={"/assets/icons/generic/view.svg"}
                                    alt={"Expand/Collapse loop"}
                                    width={24} height={24}
                                  />
                                  Loop
                                </button>
                              )
                          }

                      </div>

                      <WorkflowActionsContainer
                        scrapeIdx={index}
                        scraper={scraper}
                        handleActionChange={handleActionChange}
                        switchTwoScrapes={switchTwoScrapes}
                        removeActionByIndex={removeActionByIndex}
                      />
                      
                    </div>

                    <hr id={`actions-loop-separator-${index}`} className="bg-black w-[98%] h-[2px] hidden " />

                    <LoopContainer
                      scrapeIdx={index}
                      scraper={scraper}
                      handleLoopChange={handleLoopChange}
                      resetLoopByIndex={resetLoopByIndex}
                    />

                  </form>
                )
              }
              {
                editMode === "json" && (
                  <WSFormJsonEditor scrapeIdx={index} scraper={scraper} setScraper={setScraper} valid={scraperValidity.all} />
                )
              }
            </section>
          ))
        }
      </div>

      <Image
        src={"/assets/icons/generic/menu.svg"}
        alt={"Toggle sideNav"}
        width={44} height={44}
        className="fixed bottom-6 left-8 cursor-pointer rounded-lg p-1 bg-wsform-sideNav-dark-bg dark:bg-wsform-sideNav-light-bg"
        onClick={() => { showHideElement({elementId: "wsform-sideNav"}); }}
      />

    </div>
  );
};

export default ScraperForm;
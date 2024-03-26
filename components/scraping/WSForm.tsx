"use client";

import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { pullFromDb, runScrape, saveScraperCall } from "@utils/api_funcs";
import { createAlert, handleWindowClose, showOverlay } from "@utils/generalFunctions";
import { validateCssSelector, validateUrl } from "@utils/validation";
import { appContext } from "@components/layout/Provider";
import Tooltip from "../custom/Tooltip";
import ScrapedDataOverlay from "@components/overlays/ScrapedData";
import { hideElement, rotateElement, showHideElement, isElementVisible } from "@utils/elementFunction";
import NotSignedInDialog from "@components/dialogues/NotSignedInDialog";
import { useRouter } from "next/navigation";
import { ScrapedData, ScraperInfos, CustomAppContext, WorkflowData, ScrapeParams, LoopData, UserApiData, UserSubscriptionData, SavedScraper, SaveScraperReturn, PossibleCssSelectorDataTypes, PossibleUrlDataTypes } from "@custom-types";
import WSFormSideNav from "./WSFormSideNav";
import LoadingDialog from "@components/dialogues/LoadingDialog";
import ScrapeParamsComponent from "./ScrapeParamsComponent";
import LoopContainer from "./LoopContainer";
import WorkflowActionsContainer from "./WorkflowActionsContainer";
import WSFormJsonEditor from "@components/code_editor/WSFormJsonEditor";

const WSForm = ({ User, authStatus, previewData } : {User : any, authStatus : "authenticated" | "unauthenticated", previewData? : ScraperInfos | null}) => {

  const context = useContext<CustomAppContext>(appContext);
  const emptyScrapedData : ScrapedData = [{scrape_runs: []}];
  const { push } = useRouter();

  const defScrapeData : { workflow : WorkflowData[], scrape_params : ScrapeParams, loop : LoopData } = {
    workflow : [{type: "scrape-action", data: {css_selector: "", as: "text"}}],
    scrape_params:{
      website_url : "", url_as : "text", browser_type: "", amount_actions_local : 1, exec_type: "sequential", swallow_errors: false
    },
    loop: {
      start: 1, end : 1, iterations: 2, created: false,
    },
  };

  const defScraperInfos : ScraperInfos = {
    all: [defScrapeData], 
    args: { user_email: User?.email, amount_scrapes_global: 1, scraper_expected_runtime_seconds: 10, global_undetected: false }
  };

  const [ scraperInfos, setScraperInfos ] = useState(defScraperInfos);
  const amountScrapes = scraperInfos?.all.length;
  const [ scrapedData, setScrapedData ] = useState(emptyScrapedData);
  const [ scraperRunning, setScraperRunning ] = useState(false);

  const [ userData, setUserData ] = useState<{api : UserApiData, subscription : UserSubscriptionData, saved_scrapers : {scraper : string}[]} | null>(null);

  const [ readiness, setReadiness ] = useState<{all: boolean, [index : number]: boolean}>({all: false, 0: false});

  const [editMode, setEditMode] = useState<"normal" | "json">("normal");

  /** Only for dev!!! */
  useEffect(() => {

    console.log("Rerender...");
    console.log("Current info:", scraperInfos);

  });

  var wsFormUserDataInitialFetch = true;
  useEffect(() => {
    const getProfileData = async () : Promise<void> => {

      const pullData = {filter : {_id : User.id}, projection: ["api", "subscription", "saved_scrapers"]};
      const pullOperation = await pullFromDb<{api : UserApiData, subscription : UserSubscriptionData, saved_scrapers : {scraper : string}[]}>({apiKey: "felix12m", dbName: "yows_users", collectionName: "users", data: pullData});
  
      if(!pullOperation.acknowledged){
        push(`?app_error=${pullOperation.errors[0]}&e_while=loading%20profile`);
        return;
      };
  
      setUserData(pullOperation.found.at(0));
      return;
    };
    if(wsFormUserDataInitialFetch && authStatus === "authenticated"){
      getProfileData();
      wsFormUserDataInitialFetch = false;
    };
  }, [])

  useEffect(() => {

    if(authStatus === "unauthenticated"){
      showOverlay({context: context, element: <NotSignedInDialog message="If you want to use all features, please create an account or sign in." />, title: "Not signed in!"});
      return;
    };
     
    if(Number(window.sessionStorage.getItem("usePassed"))){
      const passedObject : ScraperInfos | null = JSON.parse(window.sessionStorage.getItem("passedSavedObject"));
      if(!passedObject){ return; }
      setScraperInfos(passedObject);
      window.sessionStorage.setItem("usePassed", "0");
      assertReadiness({amount: passedObject.all.length});
    };

    window.addEventListener('beforeunload', handleWindowClose);

    return () => { window.removeEventListener('beforeunload', handleWindowClose); };
  }, []);

  useEffect(() => {
    if(previewData){
      setScraperInfos({...previewData});
    }
  }, [previewData]);

  useEffect(() => {
    assertReadiness({amount: amountScrapes});
  }, [amountScrapes, scraperInfos, userData]);

  

  // non-data function

  const handleDrop = ({scrapeIdx, localIndex, dropIndex}  :{scrapeIdx : number, localIndex : number, dropIndex : number}) => {

    const newAll = scraperInfos?.all;

    // Assigns the data of the two workflow objects which need to switch places.
    const firstDataPoint = newAll[scrapeIdx].workflow[localIndex];
    const secondDataPoint = newAll[scrapeIdx].workflow[dropIndex];

    newAll[scrapeIdx].workflow[localIndex] = secondDataPoint;
    newAll[scrapeIdx].workflow[dropIndex] = firstDataPoint;

    setScraperInfos((prevScraperInfos) => ({
      ...prevScraperInfos,
      all: newAll,
    }));

    return;
  };

  // Data functions

  const resetPage = () => {
  
    if(!confirm("Are your sure you want to reset the whole scraper?")){ return; };

    for(let i = 0; i < scraperInfos.all.length; i += 1){
      resetScrape({scrapeIdx: i});
    };

    setScraperInfos((prevScraperInfos) => ({
      ...prevScraperInfos,
      all: [defScrapeData]
    }))
  };
  
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

  /** Resets a particular scrape to the defScrapeData through setState.
   * PARAMS:
   * - resetScrapeIdx (String): the current index in the scraperInfo.all of the scrape to be reset
   */
  const resetScrape = ({scrapeIdx, confirmNeeded} : {scrapeIdx: number, confirmNeeded? : boolean}) : void => {

    if(confirmNeeded && !confirm("Do you want to reset the current scrape?")){ return; };

    if(isElementVisible({elementId: `loop-container-${scrapeIdx}`})){
      hideElement({elementId: `loop-container-${scrapeIdx}`})
    };

    const sequentialExecutionRadioButton = window.document.getElementById(`execution-type-sequential-${scrapeIdx}`) as HTMLInputElement;
    sequentialExecutionRadioButton.checked = true;

    const edgeBrowserRadioButton = window.document.getElementById(`browser-edge-${scrapeIdx}`) as HTMLInputElement;
    edgeBrowserRadioButton.checked = true;

    const newAll = scraperInfos.all;
    newAll[scrapeIdx] = defScrapeData;

    setScraperInfos((prevScraperInfos) => ({
      ...prevScraperInfos,
      all: newAll,
    }));

    hideElement({elementId: `loop-container-${scrapeIdx}`});
    hideElement({elementId: `actions-loop-separator-${scrapeIdx}`});
    
    return;
  };

  /** Deletes a particular scrape in scraperInfo.all 
   * PARAMS:
   * - deleteScrapeIdx (String): the current index in the scraperInfo.all of the scrape to be deleted
  */
  const deleteSpecificScrape = ({scrapeIdx} : {scrapeIdx : number}) : void => {

    const confirmation = confirm("Do you want to delete this scrape?");

    if(!confirmation){ return; };

    const newAll = scraperInfos.all
    newAll.splice(scrapeIdx, 1);

    setScraperInfos((prevScraperInfos) => ({
      ...prevScraperInfos,
      all: newAll,
    }));
    return;
  };

  const appendWorkflow = ({scrapeIdx, type} : {scrapeIdx : number, type : string}) => {

    const defaultData = {
      "scrape-action": {css_selector : "", as: "text"},
      "btn-press": {css_selector: "", as: "text"},
      "input-fill": {css_selector: "", as: "text", fill_content: "" },
      "wait-time": { time_to_wait: 5 },
    };

    const newAll = scraperInfos.all
    newAll[scrapeIdx].workflow.push({type: type, data: defaultData[type]});

    setScraperInfos((prevScraperInfos) => ({
      ...prevScraperInfos,
      all: newAll,
    }));
  };

  /** Removes a specific workflow of the current scrape.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   */
  const removeSpecificWorkflow = ({scrapeIdx, workflowIndex} : {scrapeIdx: number, workflowIndex: number}) : void => {

    const newAll = scraperInfos.all;
    newAll[scrapeIdx].workflow.splice(workflowIndex, 1);

    if(scraperInfos.all[scrapeIdx].loop.created && scraperInfos.all[scrapeIdx].workflow.length < scraperInfos.all[scrapeIdx].loop.end || scraperInfos.all[scrapeIdx].workflow.length < scraperInfos.all[scrapeIdx].loop.start){
      newAll[scrapeIdx].loop.start = 1;
      newAll[scrapeIdx].loop.end = 1;
    };

    setScraperInfos((prevScraperInfos) => {
      return {
        ...prevScraperInfos,
        all: newAll,
      };
    });

    return;
  };

  /** Creates/shows a loop input field which can loop a maximum amount of five actions, with a max wait time of 15sec per action. Also there can only be 1 wait-time action per loop 
   * and it needs to concist of at least one button press per loop iteration which, if failed will return all scraped data to this point and end the current scrape.
   * This function needs to have all these checks or else it could be abused to jeopardize the API.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   * - 
   */
  const createLoop = ({scrapeIdx} : {scrapeIdx: number}) : void => {

    setScraperInfos((prevScraperInfos) => {
      prevScraperInfos.all[scrapeIdx].loop.created = true;

      prevScraperInfos.all[scrapeIdx].loop.start = prevScraperInfos.all[scrapeIdx].workflow.length; // loop start
      prevScraperInfos.all[scrapeIdx].loop.end = prevScraperInfos.all[scrapeIdx].workflow.length; // loop end (because no member in the current loop)

      return {
        ...prevScraperInfos,
      };
    });

    return;
  };

  /** Deletes loop in a scrape.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   */
  const deleteLoop = ({scrapeIdx} : {scrapeIdx : number}) : void => {

    setScraperInfos((prevScraperInfos) => {
      prevScraperInfos.all[scrapeIdx].loop = { start : 1, end : 1, iterations: 2, created: false };
      return {
        ...prevScraperInfos,
      };
    });

    hideElement({elementId: `loop-container-${scrapeIdx}`}); 
    hideElement({elementId: `actions-loop-separator-${scrapeIdx}`});

    return;
  };

  /** Handles changes in input elements and saves them to their respective place in scraperInfo through setState.
   * The inputs are all controlled, so updating them is not needed.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   * - paramName (String): the param name at wich to store the value
   * - value (String): the value which will be saved
   */
  const handleGlobalParamChange = ({scrapeIdx, paramName, value} : {scrapeIdx : number, paramName : string, value : string | number | boolean}) : void => {

    setScraperInfos((prevScraperInfos) => {
      prevScraperInfos.all[scrapeIdx].scrape_params[paramName] = value;

      return {
        ...prevScraperInfos,
      };
    });

    return;
  };

  /** Handles changes in input elements and saves them to their respective place in scraperInfo through setState.
   * The inputs are all controlled, so updating them is not needed.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   * - workflowIndex (String): the index of the current workflow relative to the scrape it's in
   * - paramName (String): the param name at wich to store the value
   * - value (String): the value which will be saved
   */
  const handleWorkflowChange = ({scrapeIdx, workflowIndex, paramName, value} : {scrapeIdx : number, workflowIndex : number, paramName : string, value : string | number | boolean}) => {

    setScraperInfos((prevScraperInfos) => {

      prevScraperInfos.all[scrapeIdx].workflow[workflowIndex].data[paramName] = value;

      return {
        ...prevScraperInfos,
      };
    });

    return;
  };

  /** Handles changes in the loop input.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   */
  const handleLoopChange = ({scrapeIdx, paramName, value} : {scrapeIdx : number, paramName : string, value : number}) : void => {

    if(paramName === "iterations" && value > 10){
      createAlert({context: context, textContent: "Iterations can be a maximum of 10 on this plan!", duration: 2000, color: "red"});
      return;
    };
    if((paramName === "start" || paramName === "end") && value > scraperInfos.all[scrapeIdx].workflow.length){
      createAlert({context: context, textContent: "There isn't an element with this Index!", duration: 2000, color: "red"})
      return;
    }

    setScraperInfos((prevScraperInfos) => {
      prevScraperInfos.all[scrapeIdx].loop[paramName] = value;

      return {
        ...prevScraperInfos,
      };
    });

    return;
  };

  const handleUrlTypeChange = ({id, scrapeIdx} : { id: PossibleCssSelectorDataTypes | PossibleUrlDataTypes, scrapeIdx? : number }) : void => {

    const newAll = scraperInfos?.all;
    
    newAll[scrapeIdx].scrape_params.url_as = id;

    setScraperInfos((prevScraperInfos) => ({
      ...prevScraperInfos,
      all: newAll,
    }));
  };

  // validation functions

  const assertReadiness = ({amount} : {amount : number}) : void => {

    let tempObj : {all: boolean, [index : number]: boolean} = {all : true};

    for(let i = 0; i < amount; i++){
      let valid = checkScrapeValid({scrapeIdx: i});
      tempObj[i] = valid;
    };

    if(Object.values(tempObj).includes(false)){ tempObj.all = false; }
    else{ tempObj.all = true; };

    setReadiness(tempObj);
  };
  
  /** Checks if the current scrapeIdx data is valid to send to the API.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   * - all (Boolean): decides if all scrapes should be checked or only a specific one
   */
  const checkScrapeValid = ({scrapeIdx} : {scrapeIdx : number}) : boolean => {

    if(!scraperInfos?.all?.[scrapeIdx] || !userData){ return false; };

    const currentScrapeData = scraperInfos.all[scrapeIdx];

    // URL check
    if(!validateUrl({input: currentScrapeData.scrape_params.website_url, as: currentScrapeData.scrape_params.url_as})){ return false; };

    // Loop check
    if(currentScrapeData.loop.created){
      if(!validateLoop({scrapeIdx: scrapeIdx})){ return false; };
    };

    // Workflow check
    for(const workflowIndex of Array.from(currentScrapeData.workflow.keys())){
      if(!validateWorkflowAction({scrapeIdx: scrapeIdx, workflowIndex: workflowIndex})){ return false; };
    };

    return true;
  };

  const validateWorkflowAction = ({scrapeIdx, workflowIndex} : {scrapeIdx : number, workflowIndex : number}) : boolean => {

    const actionType = scraperInfos.all[scrapeIdx].workflow[workflowIndex].type;
    const actionData = scraperInfos.all[scrapeIdx].workflow[workflowIndex].data;

    if(actionType === 'scrape-action'){ 
      return validateCssSelector({input: actionData.css_selector, as: actionData.as}); 
    }
    else if(actionType === 'btn-press'){ 
      return validateCssSelector({input: actionData.css_selector, as: actionData.as}); 
    }
    else if(actionType === 'input-fill'){
      if(actionData.fill_content.length == 0){ return false; };
      return validateCssSelector({input: actionData.css_selector, as: actionData.as});
    }
    else if(actionType === "wait-time"){
      return actionData.time_to_wait <= 30;
    };
  };

  const validateLoop = ({scrapeIdx} : {scrapeIdx : number}) : boolean => {

    const currentLoopData = scraperInfos?.all[scrapeIdx].loop;

    const loopIterations = currentLoopData.iterations;
    if( loopIterations > 10 || loopIterations < 2 ){ return false; };

    const loopStart = currentLoopData.start - 1;
    const loopEnd = currentLoopData.end - 1;
    const amountWorkflows = scraperInfos?.all[scrapeIdx].workflow.length;

    if(loopStart > amountWorkflows || loopEnd > amountScrapes){ return false; };

    return true
  };

  /** Calculates the approximate time the scrape-fetch API call will take. 
   *  PARAMS:
   * - all (Boolean): Decides if all of the scrapes should be included or just a specific one
   * - scrapeIdx (String): the current index in the scraperInfo.all (only used when all=false)
  */
  const calculateWaitTime = ({all, scrapeIdx} : {all : boolean, scrapeIdx : number}) : number => {

    if(all){

      let cumWaitTime = 0;

      for(const index of Array.from(scraperInfos?.all.keys())){

        cumWaitTime += calculateWaitTime({all: false, scrapeIdx: index});
      }

      return cumWaitTime;
    };
     
    let waitTime = 5; // +5 for return and runtime reasons

    for(const workflow of scraperInfos.all[scrapeIdx].workflow){

      const workflowType = workflow.type;
      const workflowData = workflow.data;

      const workflowDurations = {
        "scrape-action": 1,
        "btn-press": 1,
        "input-fill": 1,
        "wait-time": Number(workflowData.time_to_wait)
      };

      waitTime += workflowDurations[workflowType];
    };

    if(scraperInfos.all[scrapeIdx].loop.created){
      
      const loopStart = scraperInfos.all[scrapeIdx].loop.start;
      const loopEnd = scraperInfos.all[scrapeIdx].loop.end;
      const loopIterations = scraperInfos.all[scrapeIdx].loop.iterations;

      let oneLoopTime = 0;

      for(let loopIndex = (loopStart - 1); loopIndex < loopEnd; loopIndex += 1){  // no -1 at loopEnd because last number is exclusive

        const workflowType = scraperInfos.all[scrapeIdx].workflow[loopIndex].type;
        const workflowData = scraperInfos.all[scrapeIdx].workflow[loopIndex].data;

        const workflowDurations = {
          "scrape-action": 1,
          "btn-press": 1,
          "input-fill": 1,
          "wait-time": Number(workflowData.time_to_wait)
        };

        oneLoopTime += workflowDurations[workflowType];
      };

      waitTime += (oneLoopTime * (loopIterations - 1));
    };

    return waitTime;
  };

  // API interaction

  /** Sends a POST request with scraperInfo or parts of it as the body to the API, which then runs the web-scrape-function depending on the params given in the body and
   * returns then returns the scraped data.
   * PARAMS:
   * - all (Boolean): specifies if all of scraperInfo or only a single scrape should be sent to the API
   * - scrapeIdx (String): the current index in the scraperInfo.all (only used when all=false)
    */
  const newSubmit = async ({all, scrapeIdx} : {all : boolean, scrapeIdx : number}) : Promise<void> => {

    setScraperRunning(true);

    const expectedWaitTime = calculateWaitTime({all: all, scrapeIdx: scrapeIdx});

    showOverlay({context: context, title: "Scraped data", element: <LoadingDialog expectedWaitTime={expectedWaitTime}/>});

    let runData : ScraperInfos;

    if(all){

      runData = scraperInfos;
      runData.args.amount_scrapes_global = amountScrapes; // value is passed to decide if multithreading is 'possible'
      
    }
    else{

      runData = {all : [scraperInfos?.all[scrapeIdx]], args : {user_email : User['email'], amount_scrapes_global : 1, scraper_expected_runtime_seconds: expectedWaitTime, global_undetected: false}}
      runData.args.amount_scrapes_global = 1; // NO multithreading
    }
    
    runData.args.scraper_expected_runtime_seconds = expectedWaitTime;

    const runOperation = await runScrape({apiKey: "felix12m", userId: User.id, data: runData});
    
    if(!runOperation.acknowledged){
      push(`?app_error=${runOperation.errors[0]}&e_while=running%20scraper`);
      setScraperRunning(false);
      return;
    };

    setScrapedData(runOperation.scraped_data);
    
    showOverlay({context: context, title: "Scraped data", element: <ScrapedDataOverlay scrapedData={runOperation.scraped_data} saveAbility={false} />});
    setScraperRunning(false);

    return;
  };

  const saveScraper = async ({name, description, withRes} : {name : string, description : string, withRes : boolean}) : Promise<boolean> => {

    const saveData = [{scraper : scraperInfos, name: name, description: description, runtime: calculateWaitTime({all: true, scrapeIdx: null}), scraped_data: withRes ? scrapedData : emptyScrapedData}];

    const saveOperation : SaveScraperReturn = await saveScraperCall({apiKey: "felix12m", userId: User.id, data: saveData});

    if(!saveOperation.acknowledged){
      // push(`?app_error=${saveOperation.errors[0]}&e_while=saving%20scraper`);
      return false;
    };

    navigator.clipboard.writeText(saveOperation.created_item);

    createAlert({context: context, textContent: "Saved scraper successfully! ID copied to clipboard.", duration: 2000, color: "normal"});

    return true;
  };
  
  /** Pulls a scraperInfo object from the DB and sets it as the scraperInfo object in use. Needs to be async.
   * PARAMS:
   * - id (String): the passed in id, by which the API will search the DB
   */
  const loadScraper = async ({id, resultsNeeded, confirmNeeded} : {id : string, resultsNeeded : boolean, confirmNeeded : boolean}) : Promise<boolean>  => {

    if(confirmNeeded && !confirm("Loading the link will remove your current work")){ return; };
  
    const pullData = {filter : {"_id" : id}, projection: ["scraper", "scraped_data"]};

    const pullOperation = await pullFromDb<SavedScraper>({apiKey: "felix12m", dbName: "test_runs", collectionName : "scrape_info_saves", data: pullData});

    if(!pullOperation.acknowledged || pullOperation.found.length === 0){
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

  return ( 
    <div id="wsform-container" className="flex flex-row flex-grow items-start justify-start w-full h-[calc(100dvh-62px)]" >
      
      {
        !previewData && (
          <>
            <WSFormSideNav
              appendScrape={appendScrape}
              resetPage={resetPage}
              loadScraper={loadScraper}
              saveScraper={saveScraper}
              userData={userData}
              calculateWaitTime={calculateWaitTime}
              scraperInfos={scraperInfos}
              readiness={readiness}
              setScrapedData={setScrapedData}
              newSubmit={newSubmit}
              authStatus={authStatus}
              scrapedData={scrapedData}
              deleteSpecificScrape={deleteSpecificScrape}
              scraperRunning={scraperRunning}
            />

            <hr id="wsform-sideNav-separator" className="w-[2px] h-[calc(100dvh-62px)] bg-gray-400 " /> 
          </>
        
        )
      }

      <div id={"wsform-all-scrapes-container"} className="scraper_grid p-5 pb-20 mt-5 w-full h-[100%-200px] max-h-[90dvh] mx-[1%] overflow-auto" >
        {   
          scraperInfos?.all && Array.from(Array(amountScrapes).keys()).map((index) => (
            <section key={`scrape-${index}`} id={`scrape-${index}`} className='gap-y-2 flex flex-col items-center h-min justify-between rounded-xl w-min border-[3px] bg-header-light-bg dark:bg-header-dark-bg border-purple-500 dark:border-purple-300 shadow-[0px_0px_10px_#000000] dark:shadow-[0px_0px_10px_#FFFFFF] ' > 
              
              <aside id={`scrape-options-container-${index}`} className="flex flex-row items-center justify-between min-w-[600px] p-2 w-full h-[50px] rounded-xl shadow-[0px_2px_2px_darkslateblue] bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg " >

                <div id={`scrape-validity-container-${index}`} className="relative flex flex-row items-center gap-x-2"  >
                  {
                    readiness[index] ? 
                      (
                        <Image id={`scrape-valid-${index}`} width={36} height={36} src="/assets/icons/scrape/valid.svg" alt="Scrape valid" />
                      ) 
                      :
                      (
                        <Image id={`scrape-invalid-${index}`} width={32} height={32} src="/assets/icons/scrape/invalid.svg" alt="Scrape invalid" />
                      )
                  }

                  <h3 id={`scrape-index-${index}`} className="absolute left-[48px] w-max font-inter text-[18px]"  >
                    {`Scrape: ${index + 1}`}
                  </h3>

                </div>

                <div id={`scrape-interactive-options-container-${index}`} className="c_row_elm justify-end gap-x-2" >

                  <div  id={`run-scrape-tooltip-container-${index}`} className="relative group flex items-center justify-center min-w-[30px] h-full" >

                    <Tooltip yOrientation="top" content={"Run this scrape. Need to be valid!"} /> 

                    {
                      !scraperRunning && readiness[index] ? 
                        (
                          <Image
                            src={"/assets/icons/scrape/rocket.svg"}
                            id={`run-scrape-${index}`}
                            alt={"Run scraper"}
                            width={32}
                            height={32}
                            className="cursor-pointer "
                            onClick={() => { newSubmit({all: false, scrapeIdx: index}); }}
                          />
                        )
                        :
                        (
                          <Image
                            src={"/assets/icons/scrape/rocket.svg"}
                            id={`run-scrape-${index}_disabled`}
                            alt={"Run scraper (disabled)"}
                            width={32}
                            height={32}
                            className="cursor-not-allowed opacity-50"
                          />
                        )
                    }

                  </div>
                  
                  <hr className="h-[38px] w-[2px] bg-gray-400 " />

                  <div  id={`run-scrape-tooltip-container-${index}`} className="relative group flex items-center justify-center min-w-[30px] h-full" >

                    <Tooltip yOrientation="top" content={`Edit this scrape via ${editMode === "json" ? "a UI." : "raw JSON."}`} /> 

                    {
                      editMode === "normal" ? 
                        (
                          <Image
                            src={"/assets/icons/generic/curly_braces.svg"}
                            id={`edit-scrape-json-${index}`}
                            alt={"Edit scrape as JSON"}
                            width={26}
                            height={28}
                            className="cursor-pointer "
                            onClick={() => { setEditMode("json") }}
                          />
                        )
                        :
                        (
                          <Image
                            src={"/assets/icons/generic/cursor.svg"}
                            id={`edit-scrape-ui-${index}`}
                            alt={"Edit scrape via UI"}
                            width={26}
                            height={28}
                            className="cursor-pointer "
                            onClick={() => { setEditMode("normal") }}
                          />
                        )
                    }

                  </div>

                  <hr className="h-[38px] w-[2px] bg-gray-400 " />
                  
                  <div  id={`delete-scrape-tooltip-container-${index}`} className="relative group flex items-center justify-center min-w-[30px] h-full" >

                    <div id={`delete-scrape-tooltip-wrapper-${index}`} className="h-auto w-auto hidden group-hover:flex " >
                      <Tooltip yOrientation="top" content={"Delete this scrape. Can't delete if only 1 exists!"} /> 
                    </div>

                    {
                      amountScrapes > 1 ?
                        (
                          <Image id={`delete-scrape-${index}`} src='/assets/icons/scrape/trash_can.svg' onClick={() => { deleteSpecificScrape({scrapeIdx: index}); }} 
                            width={34} height={34} alt="delete button" className="cursor-pointer" /> 
                        )
                        :
                        (
                          <Image id={`delete-scrape-${index}_disabled`} src='/assets/icons/scrape/trash_can.svg' 
                            width={34} height={34} alt="delete button" className="opacity-50 cursor-not-allowed" />
                        )
                    }

                  </div>

                  <div  id={`reset-scrape-tooltip-container-${index}`} className="relative group flex items-center justify-center min-w-[30px] h-full" >

                    <div id={`reset-scrape-tooltip-wrapper-${index}`} className="h-auto w-auto hidden group-hover:flex " >
                      <Tooltip yOrientation="top" content={"Reset scrape."} /> 
                    </div>

                    <Image id={`reset-scrape-${index}`} onClick={() => { resetScrape({scrapeIdx: index, confirmNeeded: true}); }} src='/assets/icons/scrape/reset.svg' 
                    width={32} height={32} alt="reset button" className="cursor-pointer" />

                  </div>

                  <div  id={`toggle-scrape-visibility-tooltip-container-${index}`} className="relative group flex items-center justify-center min-w-[30px] h-full" >

                    <div id={`toggle-scrape-visibility-tooltip-wrapper-${index}`} className="h-auto w-auto hidden group-hover:flex " >
                      <Tooltip yOrientation="top" content={"Toggle visibility."} /> 
                    </div>

                    <Image 
                      className="cursor-pointer rotate-180" width={34} height={34} 
                      src="/assets/icons/generic/updownarrow.svg" 
                      id={`toggle-scrape-visibility-${index}`}  
                      alt={"show/hide form"}
                      onClick={() => { showHideElement({elementId: `scrape-form-${index}`}); rotateElement({elementId: `toggle-scrape-visibility-${index}`, degrees: "180"}); }}
                    />

                  </div>
                      
                </div>

              </aside>

              {
                editMode === "normal" && (
                  <form id={`scrape-form-${index}`} className="px-2 min-w-[600px] flex flex-col items-center h-full w-auto justify-around gap-y-2 mb-2" >

                    <ScrapeParamsComponent
                      scrapeIdx={index}
                      scraperInfos={scraperInfos}
                      handleGlobalParamChange={handleGlobalParamChange}
                      handleUrlTypeChange={handleUrlTypeChange}
                      deleteLoop={deleteLoop}
                      urlValid={validateUrl({input: scraperInfos?.all[index].scrape_params.website_url, as: scraperInfos?.all[index].scrape_params.url_as})}
                      
                    />

                    <hr id={`global-params-actions-separator-${index}`} className="w-[98%] h-[2px] bg-black " />

                    <div id={`workflow-options-actions-container-${index}`} className="w-full h-full flex flex-row items-start gap-x-4" >

                      <div id={`workflow-options-wrapper-${index}`} className="flex flex-col items-start gap-y-1 pb-5 "  >

                          {
                            // So that there is always at least one workflow element.
                            scraperInfos?.all[index] !== undefined && scraperInfos?.all[index] !== null  && scraperInfos?.all[index].workflow.length > 1 ?
                              (

                                <button id={`pop-scrape-${index}`} className="row_options_button bg-[#bd3030]"  
                                  onClick={(e) => { e.preventDefault(); removeSpecificWorkflow({scrapeIdx: index, workflowIndex: (scraperInfos?.all[index].workflow.length - 1)}); }} >
                                  - last
                                </button>
                              )
                              :
                              (
                                <button id={`pop-scrape-${index}_disabled`} disabled className="row_options_button brightness-50 bg-gray-300 dark:bg-gray-600 cursor-not-allowed " >
                                  - last
                                </button>
                              )
                          }

                          <button id={`add-scrape-action-${index}`} className="row_options_button bg-[#003314cc]" 
                            onClick={(e) => { e.preventDefault(); appendWorkflow({scrapeIdx: index, type: "scrape-action"}); }} >
                            + Scrape
                          </button>

                          <button id={`add-button-action-${index}`} className="row_options_button bg-[#003314cc] " 
                            onClick={(e) => { e.preventDefault(); appendWorkflow({scrapeIdx: index, type: "btn-press"}); }} >
                            + Button
                          </button>

                          <button id={`add-input-action-${index}`} className="row_options_button bg-[#003314cc] " 
                            onClick={(e) => { e.preventDefault(); appendWorkflow({scrapeIdx: index, type: "input-fill"}); }} >
                            + Input
                          </button>

                          <button id={`add-wait-action-${index}`} className="row_options_button bg-[#003314cc] " 
                            onClick={(e) => { e.preventDefault(); appendWorkflow({scrapeIdx: index, type: "wait-time"}); }} >
                            + Wait
                          </button>

                          {
                            !scraperInfos?.all[index].loop.created ?

                              (
                                <button disabled={scraperInfos?.all[index].scrape_params.exec_type === "looping"} id={`create-loop-${index}`} className="row_options_button bg-purple-500 dark:bg-purple-700" 
                                  onClick={(e) => { e.preventDefault(); createLoop({scrapeIdx: index}); showHideElement({elementId: `loop-container-${index}`}); showHideElement({elementId: `actions-loop-separator-${index}`}); }} >
                                  + Loop
                                </button>
                              )
                              :
                              (
                                <button id={`toggle-loop-visibility-${index}`} className="row_options_button flex flex-row gap-x-2 bg-purple-500 dark:bg-purple-700" 
                                  onClick={(e) => { e.preventDefault(); showHideElement({elementId: `loop-container-${index}`}); showHideElement({elementId: `actions-loop-separator-${index}`}); }}  >
                                  <Image
                                    src={"/assets/icons/generic/view.svg"}
                                    alt={"Show/hide loop"}
                                    width={24}
                                    height={24}
                                    id="toggle-loop-visibility-clue"
                                  />
                                  Loop
                                </button>
                              )
                          }

                      </div>

                      <WorkflowActionsContainer
                        scrapeIdx={index}
                        scraperInfos={scraperInfos}
                        setScraperInfos={setScraperInfos}
                        handleWorkflowChange={handleWorkflowChange}
                        handleDrop={handleDrop}
                        removeSpecificWorkflow={removeSpecificWorkflow}
                        validateWorkflowAction={validateWorkflowAction}
                      />
                      
                    </div>

                    <hr id={`actions-loop-separator-${index}`} className="bg-black w-[98%] h-[2px] hidden " />

                    <LoopContainer
                      scrapeIdx={index}
                      scraperInfos={scraperInfos}
                      handleLoopChange={handleLoopChange}
                      deleteLoop={deleteLoop}
                    />

                  </form>
                )
              }
              {
                editMode === "json" && (
                  <WSFormJsonEditor scrapeIdx={index} scraperInfos={scraperInfos} setScraperInfos={setScraperInfos} valid={readiness.all} />
                )
              }
            </section>
          ))
        }
      </div>

      <Image
        src={"/assets/icons/generic/menu.svg"}
        id="toggle-wsform-sideNav"
        alt={"Toggle sideNav"}
        width={44}
        height={44}
        className="fixed bottom-6 left-8 cursor-pointer rounded-lg p-1 bg-wsform-sideNav-dark-bg dark:bg-wsform-sideNav-light-bg"
        onClick={() => {showHideElement({elementId: "wsform-sideNav"}); showHideElement({elementId: "wsform-sideNav-separator"}); }}
      />
    </div>
  );
};

export default WSForm;
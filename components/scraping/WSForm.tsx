"use client";

import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { pullFromDb, runScrape } from "@utils/api_funcs";
import WorkflowAction from "./WorkflowAction";
import Link from "next/link";
import { createAlert, handleWindowClose, showOverlay } from "@utils/generalFunctions";
import { validateBrowserType, validateCssSelector, validateURl } from "@utils/validation";
import { appContext } from "@app/layout";
import Tooltip from "../design/Tooltip";
import ScrapedDataOverlay from "@components/overlays/ScrapedData";
import { hideElement, rotateElement, showHideElement, isElementVisible } from "@utils/elementFunction";
import NotSignedInDialog from "@components/overlays/NotSignedInDialog";
import { useRouter } from "next/navigation";
import { ScrapedData, ScraperInfos, CustomAppContext, WorkflowData, ScrapeParams, LoopData, UserApiData, UserSubscriptionData, PossibleCssSelectorDataTypes, PossibleUrlDataTypes } from "@custom-types";
import WSFormSideNav from "./WSFormSideNav";
import LoadingDialog from "@components/overlays/LoadingDialog";
import ChangeDataInterpretationDropdown from "@components/dropdowns/ChangeDataInterpretationDropdown";

const WSForm = ({ User, authStatus }) => {

  const context = useContext<CustomAppContext>(appContext);
  const emptyScrapedData : ScrapedData = [{scrape_runs: []}];
  const { push } = useRouter();

  const defScrapeData : { workflow : WorkflowData[], scrape_params : ScrapeParams, loop : LoopData } = {
    workflow : [{type: "scrape-action", data: {css_selector: "", as: "text"}}],
    scrape_params:{
      website_url : "", url_as : "text", browser_type: "", wait_time : 5, amount_actions_local : 1, exec_type: "sequential"
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
  const [scraperRunning, setScraperRunning] = useState(false);

  const [userData, setUserData] = useState<{api : UserApiData, subscription : UserSubscriptionData, saved_scrapers : {scraper : string}[]} | null>(null);

  const [ readiness, setReadiness ] = useState<{all: boolean, [index : number]: boolean}>({all: false, 0: false});

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

    if(window.visualViewport.width < 1100){ hideElement({elementId: "wsform-sideNav"}); hideElement({elementId: "wsform-sideNav-separator"}); };

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
      console.log("here");
    };

    window.addEventListener('beforeunload', handleWindowClose);

    return () => { window.removeEventListener('beforeunload', handleWindowClose); };
  }, []);

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

  /** Resets a particular scrape to the defScrapeData through setState.
   * PARAMS:
   * - resetScrapeIdx (String): the current index in the scraperInfo.all of the scrape to be reset
   */
  const resetScrape = ({scrapeIdx} : {scrapeIdx: number}) : void => {

    const confirmation = confirm("Do you want to reset the current scrape?");

    if(!confirmation){ return; };

    if(isElementVisible({elementId: `loop-container-${scrapeIdx}`})){
      hideElement({elementId: `loop-container-${scrapeIdx}`})
    };

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
      "btn-press": {css_selector: "", as: "text", wait_after: 2},
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

  const handleUrlTypeChange = ({id, scrapeIdx} : { id: PossibleCssSelectorDataTypes | PossibleUrlDataTypes, scrapeIdx? : number }) : void => {

    const newAll = scraperInfos?.all;
    console.log("NA:", newAll);
    console.log(scrapeIdx)
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

    console.log("ASSERTED:", tempObj)

    setReadiness(tempObj);
  };
  
  /** Checks if the current scrapeIdx data is valid to send to the API.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   * - all (Boolean): decides if all scrapes should be checked or only a specific one
   */
  const checkScrapeValid = ({scrapeIdx} : {scrapeIdx : number}) => {

    if(!scraperInfos?.all || !scraperInfos?.all?.[scrapeIdx] || !userData){ return false; };

    var returnValue = true;
    const currentScrapeData = scraperInfos.all[scrapeIdx];

    // Runtime

    // URL check
    const scrapeUrl = currentScrapeData.scrape_params.website_url;
    const urlAs = currentScrapeData.scrape_params.url_as;
    
    if(urlAs === "text" && !validateURl({url: scrapeUrl})){
      
      returnValue = false;
    }
    else if(urlAs === "csv"){

      for(const item of scrapeUrl.split(",")){
        if(!validateURl({url: item})){
          returnValue = false;
        }
      }
    }
    else if(urlAs === "json"){

      try{
        for(const item of JSON.parse(scrapeUrl)){
          if(!validateURl({url: item})){
            returnValue = false;
          }
        }
      }
      catch{
        returnValue = false;
      }
      
    }
    
    // Browser check
    const browserType = currentScrapeData.scrape_params.browser_type;
    if(browserType === "" || validateBrowserType({type: browserType})){
      window.document.getElementById(`browser-param-${scrapeIdx}`).classList.add("border-green-800");
    }
    else{ window.document.getElementById(`browser-param-${scrapeIdx}`).classList.remove("border-green-800"); returnValue = false; }

    // Page load time check
    const pageLoadTime = currentScrapeData.scrape_params.wait_time;
    if(pageLoadTime < 5){
      window.document.getElementById(`wait-param-${scrapeIdx}`).classList.remove("border-green-800");
      returnValue = false;
    }
    else{ window.document.getElementById(`wait-param-${scrapeIdx}`).classList.add("border-green-800"); };

    // Loop check
    if(currentScrapeData.loop.created){

      const currentLoopData = currentScrapeData.loop;

      const loopIterations = Number(currentLoopData.iterations);
      if(loopIterations > 10 || loopIterations < 2){ returnValue = false; };

      const loopStart = Number(currentLoopData.start) - 1;
      const loopEnd = Number(currentLoopData.end) - 1;

      if(loopStart > currentScrapeData.workflow.length || loopEnd > currentScrapeData.workflow.length){
        window.document.getElementById(`loop-container-${scrapeIdx}`).classList.remove("border-green-800");
        returnValue = false; 
      }
      else{
        window.document.getElementById(`loop-container-${scrapeIdx}`).classList.add("border-green-800");   
      };
    }
    // Workflow check
    for(const actionIndex of Array.from(currentScrapeData.workflow.keys())){

      const actionType = currentScrapeData.workflow[actionIndex].type;
      const actionData = currentScrapeData.workflow[actionIndex].data;

      if(actionType === 'scrape-action'){

        if(window.document.getElementById(`scrape-action-css_selector-${scrapeIdx}-${actionIndex}-container`) === null){ return false; };

        const cssSelector : string = actionData.css_selector;

        const actionValid = validateCssSelector({cssSelector: cssSelector, as: actionData.as})

        if(actionValid){
          window.document.getElementById(`scrape-action-css_selector-${scrapeIdx}-${actionIndex}-container`).classList.add("border-green-800")
        }
        else{
          window.document.getElementById(`scrape-action-css_selector-${scrapeIdx}-${actionIndex}-container`).classList.remove("border-green-800"); 
          returnValue = false;
        }
      }
      else if(actionType === 'btn-press'){

        if(window.document.getElementById(`btn-press-css_selector-${scrapeIdx}-${actionIndex}-container`) === null){ return false; };

        const cssSelector = actionData.css_selector;

        const actionValid = validateCssSelector({cssSelector: cssSelector, as: actionData.as});

        if(actionValid){
          window.document.getElementById(`btn-press-css_selector-${scrapeIdx}-${actionIndex}-container`).classList.add("border-green-800")
        }
        else{
          window.document.getElementById(`btn-press-css_selector-${scrapeIdx}-${actionIndex}-container`).classList.remove("border-green-800"); 
          returnValue = false;
        }

        const waitTime = Number(actionData.wait_after);

        if(waitTime <= 10){
          window.document.getElementById(`btn-press-wait_after-${scrapeIdx}-${actionIndex}-container`).classList.add("border-green-800")
        }
        else{
          window.document.getElementById(`btn-press-wait_after-${scrapeIdx}-${actionIndex}-container`).classList.remove("border-green-800"); 
          returnValue = false;
        }
      }
      else if(actionType === 'input-fill'){

        if(window.document.getElementById(`input-fill-css_selector-${scrapeIdx}-${actionIndex}-container`) === null){ return false; };

        const cssSelector = actionData.css_selector;

        const actionValid = validateCssSelector({cssSelector: cssSelector, as: actionData.as});

        if(actionValid){
          window.document.getElementById(`input-fill-css_selector-${scrapeIdx}-${actionIndex}-container`).classList.add("border-green-800")
        }
        else{
          window.document.getElementById(`input-fill-css_selector-${scrapeIdx}-${actionIndex}-container`).classList.remove("border-green-800"); 
          returnValue = false;
        }

        const fill_content = actionData.fill_content;
        if(fill_content.length == 0){
          window.document.getElementById(`input-fill-css_selector-${scrapeIdx}-${actionIndex}-container`).classList.remove("border-green-800"); 
          returnValue = false;
        }
        else{ window.document.getElementById(`input-fill-css_selector-${scrapeIdx}-${actionIndex}-container`).classList.add("border-green-800"); }
        
      }
      else if(actionType === "wait-time"){

        if(window.document.getElementById(`wait-time-time_to_wait-${scrapeIdx}-${actionIndex}-container`) === null){ return; };

        const waitTime = actionData.time_to_wait;

        if(waitTime <= 30){
          window.document.getElementById(`wait-time-time_to_wait-${scrapeIdx}-${actionIndex}-container`).classList.add("border-green-800");
        }
        else{
          window.document.getElementById(`wait-time-time_to_wait-${scrapeIdx}-${actionIndex}-container`).classList.remove("border-green-800");
          returnValue = false;
        }
      }
    };
    return returnValue;
  };

  /** Calculates the approximate time the scrape-fetch API call will take. 
   *  PARAMS:
   * - all (Boolean): Decides if all of the scrapes should be included or just a specific one
   * - scrapeIdx (String): the current index in the scraperInfo.all (only used when all=false)
  */
  const calculateWaitTime = ({all, scrapeIdx} : {all : boolean, scrapeIdx : number}) : number => {

    if(all){

      let cummWaitTime = 0;

      for(const index of Array.from(scraperInfos.all.keys())){

        cummWaitTime += Number(calculateWaitTime({all: false, scrapeIdx: index}));
      }

      return Number(cummWaitTime);
    }
    else{
     
      let waitTime = Number(scraperInfos.all[scrapeIdx].scrape_params.wait_time) + 5; // +5 for return and runtime reasons

      
      for(const action of scraperInfos.all[scrapeIdx].workflow){

        const actionType = action.type;
        const actionData = action.data;

        if(actionType === "scrape-action"){ waitTime += 1; }

        else if(actionType === "btn-press"){ waitTime += (Number(actionData.wait_after) + 1); } // +1 because of button press

        else if(actionType === "input-fill"){ waitTime += 1; }

        else if(actionType === "wait-time"){waitTime += Number(actionData.time_to_wait); }
      }

      if(scraperInfos.all[scrapeIdx].loop.created){
        
        const loopStart = Number(scraperInfos.all[scrapeIdx].loop.start);
        const loopEnd = Number(scraperInfos.all[scrapeIdx].loop.end);
        const loopIterations = Number(scraperInfos.all[scrapeIdx].loop.iterations);

        let oneLoopTime = 0;

        for(let loopIndex = (loopStart - 1); loopIndex < loopEnd; loopIndex += 1){  // no -1 at loopEnd because last number is exclusive

          const workflowType = scraperInfos.all[scrapeIdx].workflow[loopIndex]?.type;
          const workflowData = scraperInfos.all[scrapeIdx].workflow[loopIndex]?.data;

          if(workflowType === "scrape-action"){ oneLoopTime += 1; }

          else if(workflowType === "btn-press"){ oneLoopTime += (Number(workflowData.wait_after) + 1); } // +1 because of button press

          else if(workflowType === "input-fill"){ oneLoopTime += 1; }

          else if(workflowType === "wait-time"){ oneLoopTime += Number(workflowData.time_to_wait); }
        }

        waitTime += (oneLoopTime * (loopIterations - 1));
      }

      return waitTime;
    }
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

  return ( 
    <div id="wsform-container" className="flex flex-row flex-grow items-start justify-start w-full h-[calc(100dvh-62px)]" >
      
      <WSFormSideNav
        context={context}
        userData={userData}
        amountScrapes={amountScrapes}
        calculateWaitTime={calculateWaitTime}
        scraperInfos={scraperInfos}
        setScraperInfos={setScraperInfos}
        defScraperInfos={defScraperInfos}
        readiness={readiness}
        setScrapedData={setScrapedData}
        setReadiness={setReadiness}
        newSubmit={newSubmit}
        User={User}
        authStatus={authStatus}
        push={push}
        scrapedData={scrapedData}
        deleteSpecificScrape={deleteSpecificScrape}
        defScrapeData={defScrapeData}
        scraperRunning={scraperRunning}
      />

      <hr id="wsform-sideNav-separator" className="w-[2px] h-[calc(100dvh-62px)] bg-gray-400 " /> 

      <div id={"wsform-all-scrapes-container"} className="scraper_grid p-5 pb-20 mt-5 w-full h-[100%-200px] max-h-[90dvh] mx-[1%] overflow-auto" >
        {   
          scraperInfos?.all && Array.from(Array(amountScrapes).keys()).map((index) => (
              <section key={`scrape-${index}`} id={`scrape-${index}`} className='gap-y-2 flex flex-col items-center h-min justify-between rounded-xl w-min border-[3px] bg-header-light-bg dark:bg-header-dark-bg border-purple-500 dark:border-purple-300 shadow-[0px_0px_10px_#000000] dark:shadow-[0px_0px_10px_#FFFFFF] ' > 
                
                <aside id={`scrape-options-container-${index}`} className="flex flex-row items-center justify-between min-w-[600px] p-2 w-full h-[70px] rounded-xl shadow-[0px_2px_2px_darkslateblue] bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg " >

                  <div id={`scrape-validity-container-${index}`} className="relative flex flex-row items-center gap-x-2"  >
                    {
                      readiness[index] ? 
                        (
                          <Image id={`scrape-valid-${index}`} width={40} height={40} src="/assets/icons/scrape/valid.svg" alt="Scrape valid" />
                        ) 
                        :
                        (
                          <Image id={`scrape-invalid-${index}`} width={38} height={38} src="/assets/icons/scrape/invalid.svg" alt="Scrape invalid" />
                        )
                    }

                    <h3 id={`scrape-index-${index}`} className="absolute left-[48px] w-max font-inter text-[18px]"  >
                      {`Scrape: ${index + 1}`}
                    </h3>

                  </div>

                  <div id={`scrape-interactive-options-container-${index}`} className="c_row_elm justify-end gap-x-2" >

                    <div  id={`run-scrape-tooltip-container-${index}`} className="relative group flex items-center justify-center min-w-[30px] h-full" >

                      <div id={`run-scrape-tooltip-wrapper-${index}`} className="h-auto w-auto hidden group-hover:flex " >
                        <Tooltip yOrientation="top" content={"Run this scrape. Need to be valid!"} /> 
                      </div>

                      {
                        !scraperRunning && readiness[index] ? 
                          (
                            <Image
                              src={"/assets/icons/scrape/rocket.svg"}
                              id={`run-scrape-${index}`}
                              alt={"Run scraper"}
                              width={40}
                              height={40}
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
                              width={40}
                              height={40}
                              className="cursor-not-allowed opacity-50"
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
                              width={40} height={40} alt="delete button" className="cursor-pointer" /> 
                          )
                          :
                          (
                            <Image id={`delete-scrape-${index}_disabled`} src='/assets/icons/scrape/trash_can.svg' 
                              width={40} height={40} alt="delete button" className="opacity-50 cursor-not-allowed" />
                          )
                      }

                    </div>

                    <div  id={`reset-scrape-tooltip-container-${index}`} className="relative group flex items-center justify-center min-w-[30px] h-full" >

                      <div id={`reset-scrape-tooltip-wrapper-${index}`} className="h-auto w-auto hidden group-hover:flex " >
                        <Tooltip yOrientation="top" content={"Reset scrape."} /> 
                      </div>

                      <Image id={`reset-scrape-${index}`} onClick={() => { resetScrape({scrapeIdx: index}); }} src='/assets/icons/scrape/reset.svg' 
                      width={38} height={38} alt="reset button" className="cursor-pointer" />

                    </div>

                    <div  id={`toggle-scrape-visibility-tooltip-container-${index}`} className="relative group flex items-center justify-center min-w-[30px] h-full" >

                      <div id={`toggle-scrape-visibility-tooltip-wrapper-${index}`} className="h-auto w-auto hidden group-hover:flex " >
                        <Tooltip yOrientation="top" content={"Toggle visibility."} /> 
                      </div>

                      <Image 
                        className="cursor-pointer rotate-180" width={40} height={40} 
                        src="/assets/icons/generic/updownarrow.svg" 
                        id={`toggle-scrape-visibility-${index}`}  
                        alt={"show/hide form"}
                        onClick={() => { showHideElement({elementId: `scrape-form-${index}`}); rotateElement({elementId: `toggle-scrape-visibility-${index}`, degrees: "180"}); }}
                      />

                    </div>
                        
                  </div>

                </aside>

                <form id={`scrape-form-${index}`} className="px-2 min-w-[600px] flex flex-col items-center h-full w-auto justify-around gap-y-2 mb-2" >

                  <div id={`global-params-container-${index}`} className=" flex flex-col items-center min-h-[40px] h-auto gap-y-1 w-full justify-evenly mt-1" >

                    <div id={`execution-type-param-container-${index}`} className="w-full h-auto flex flex-col items-center p-2" >

                      <h3 id={`execution-type-param-heading-${index}`} className="w-full h-auto text-start pb-2 text-[18px] font-[500]" >
                        Execution type <Link href="/docs#scrape-execution-type" rel="noopener noreferrer" target="_blank" className="text-[12px] underline text-blue-500" > learn more </Link>
                      </h3>

                      <div id={`execution-type-param-wrapper-${index}`} className="w-full h-auto flex flex-row items-center justify-between gap-x-4" >
                        <div className="flex flex-row items-center px-2 border border-gray-600 rounded-md dark:border-gray-300 w-[48%] cursor-pointer relative">
                          <input 
                            id={`execution-type-sequential-${index}`}
                            defaultChecked
                            type="radio" 
                            value="" 
                            name={`execution-type-${index}`} 
                            className="focus:outline-none w-8 h-8 cursor-pointer"
                            onChange={(e) => { handleGlobalParamChange({scrapeIdx: index, paramName: "exec_type", value: "sequential"}); }}
                          />
                          <label htmlFor={`execution-type-sequential-${index}`} className="w-full py-2 text-[16px] font-[600] cursor-pointer">
                            Sequential
                            <div  id={`execution-type-sequential-tooltip-container-${index}`} className="group absolute right-1 -top-[5px] flex items-center justify-center min-w-[30px] h-full mt-[6px]" >

                              <div id={`execution-type-sequential-tooltip-wrapper-${index}`} className="h-auto w-auto hidden group-hover:flex " >
                                <Tooltip yOrientation="bottom" content={"This will execute all actions sequentially for every provided URL, meaning every action will be executed for every URL."} /> 
                              </div>

                              <Image id={`execution-type-sequential-tooltip-toggle-${index}`} src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} />

                            </div>
                          </label>
                        </div>

                        <div className="flex flex-row items-center px-2 border border-gray-600 rounded-md dark:border-gray-300 w-[48%] relative">
                          <input 
                            id={`execution-type-looping-${index}`} 
                            type="radio"
                            value=""
                            name={`execution-type-${index}`} 
                            className="focus:outline-none w-8 h-8 cursor-pointer"
                            onChange={(e) => { handleGlobalParamChange({scrapeIdx: index, paramName: "exec_type", value: "looping"}); }}
                          />
                          <label htmlFor={`execution-type-looping-${index}`} className="w-full py-2 text-[16px] font-[600] cursor-pointer">
                            Looping
                            <div  id={`execution-type-looping-tooltip-container-${index}`} className="group absolute right-1 -top-[5px] flex items-center justify-center min-w-[30px] h-full mt-[6px]" >

                              <div id={`execution-type-looping-tooltip-wrapper-${index}`} className="h-auto w-auto hidden group-hover:flex " >
                                <Tooltip yOrientation="bottom" content={"This will execute all actions in a looping manner, meaning the first action will be executed for every URL."} /> 
                              </div>

                              <Image id={`execution-type-looping-tooltip-toggle-${index}`} src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} />

                            </div>
                          </label>
                        </div>
                      </div>

                    </div>

                    <hr id={`global-params-execType/url-separator-${index}`} className="w-[98%] h-[2px] my-1 bg-black " />

                    <div id={`url-param-container-${index}`} className="w-full min-h-[44px] h-auto flex flex-row items-start gap-x-4 px-2" >
                      <h3 id={`url-param-heading-${index}`} className="text-[18px] font-[600] w-[70px] text-start " >URL</h3>
                      <div  id={`url-param-wrapper-${index}`} className="relative flex flex-row items-start w-[calc(60%+142px)] min-h-[40px] h-max rounded-xl bg-purple-400 dark:bg-purple-300 " >

                        {
                          scraperInfos?.all[index].scrape_params.url_as !== "text" ?
                            (
                              <textarea
                                required 
                                placeholder="https://example.com"
                                value={scraperInfos?.all[index].scrape_params.website_url}
                                id={`url-param-${index}`} 
                                className='text-[16px] px-2 min-h-[34px] h-fit py-1 break-words focus:outline-none text-start m-[3px] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark w-[92%]'
                                onChange={(e) => { handleGlobalParamChange({scrapeIdx: index, paramName: "website_url", value: e.target.value}); }} 
                              />
                            )
                            :
                            (
                              <input type="text"
                                required 
                                placeholder="https://example.com"
                                value={scraperInfos?.all[index].scrape_params.website_url}
                                id={`url-param-${index}`} 
                                className='text-[16px] pl-2 min-h-[34px] h-[calc(100%-6px)] w-[calc(100%-32px)] focus:outline-none text-start pr-2 m-[3px] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark' 
                                onChange={(e) => { handleGlobalParamChange({scrapeIdx: index, paramName: "website_url", value: e.target.value}); }} 
                              />
                            )
                        }
                        
                        <ChangeDataInterpretationDropdown
                          thingToClick={
                            <Image
                              id={`url-data-types-icon-${index}`}
                              alt="url data type options"
                              src={"/assets/icons/generic/3_dots.svg"}
                              className="cursor-pointer"
                              height={30}
                              width={30}
                            />
                          }
                          scrapeIdx={index}
                          handleTypeSelection={handleUrlTypeChange}
                          options={[{name : "As TEXT", id: "text"}, {name : "As CSV", id: "csv"}, {name : "As JSON-array", id: "json"}]}
                        />
                        <div  id={`url-param-tooltip-container-${index}`} className="group flex items-center justify-center min-w-[30px] h-full mt-[6px]" >

                          <div id={`url-param-tooltip-wrapper-${index}`} className="h-auto w-auto hidden group-hover:flex " >
                            <Tooltip yOrientation="bottom" content={"Any valid URL. Must be https."} /> 
                          </div>

                          <Image id={`url-param-tooltip-toggle-${index}`} src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} />

                        </div>
                      </div>
                    </div>

                    <div id={`browser-and-wait-param-container-${index}`} className="w-full h-[44px] flex flex-row items-center gap-x-4 px-2" >

                      <h3 id={`browser-param-heading-${index}`} className="text-[18px] font-[600] w-[70px] text-start" >Browser</h3>
                      <div id={`browser-param-wrapper-${index}`} className="relative flex flex-row items-center w-[calc(30%+12px)] h-[40px] rounded-xl bg-purple-400 dark:bg-purple-300 " >
                        <input type="text" 
                          className='text-[16px] pl-2 h-[calc(100%-6px)] w-[calc(100%-32px)] focus:outline-none text-start pr-2 m-[3px] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark' 
                          required 
                          placeholder="Browser"
                          value={scraperInfos?.all?.[index].scrape_params.browser_type}
                          id={`browser-param-${index}`}
                          onChange={(e) => { handleGlobalParamChange({scrapeIdx: index, paramName: "browser_type", value: e.target.value}); }} 
                        />

                        <div id={`browser-param-tooltip-container-${index}`} className="group flex items-center justify-center min-w-[30px] h-full" >

                          <div id={`browser-param-tooltip-wrapper-${index}`} className="h-auto w-auto hidden group-hover:flex " >
                            <Tooltip yOrientation="bottom" content={"Can be 'chrome', 'safari', 'edge' or 'firefox'."} /> 
                          </div>

                          <Image id={`browser-param-tooltip-toggle-${index}`} src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} />

                        </div>
                      </div>

                      <h3 id={`wait-param-heading-${index}`} className="text-[18px] font-[600] w-[90px] text-start ml-[12%]" >load time</h3>
                      <div id={`wait-param-wrapper-${index}`} className="relative flex flex-row items-center w-[calc(18%+12px)] h-[40px] rounded-xl bg-purple-400 dark:bg-purple-300 " >
                        <input type="number" 
                          min={5}
                          className='text-[16px] pl-2 h-[calc(100%-6px)] w-[calc(100%-32px)] focus:outline-none text-start pr-2 m-[3px] autofill:delay-[9999s] focus:delay-[9999s] hover:delay-[9999s] active:delay-[9999s] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark' 
                          required 
                          value={scraperInfos?.all?.[index].scrape_params.wait_time}
                          id={`wait-param-${index}`} 
                          onChange={(e) => { handleGlobalParamChange({scrapeIdx: index, paramName: "wait_time", value: Number(e.target.value)}); }} 
                        />

                        <div id={`wait-param-tooltip-container-${index}`} className="group flex items-center justify-center min-w-[30px] h-full" >

                          <div id={`wait-param-tooltip-wrapper-${index}`} className="h-auto w-auto hidden group-hover:flex " >
                            <Tooltip yOrientation="bottom" content={"Enter a valid integer between 0-25."} /> 
                          </div>

                          <Image id={`wait-param-tooltip-toggle-${index}`} src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} />

                        </div>
                      </div>
                    </div>

                  </div>

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
                          scraperInfos?.all[index].loop.created === false ?

                            (
                              <button id={`create-loop-${index}`} className="row_options_button bg-purple-500 dark:bg-purple-700" 
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

                    <div id={`actions-container-${index}`} className="rows_grid w-full h-auto gap-y-1 p-2 " >
                      {
                        scraperInfos?.all?.[index] !== undefined &&
                          (
                            <>
                              { 
                                
                                Array.from(scraperInfos?.all[index].workflow.keys()).map((rowIndex) => {

                                  return (
                                    <div id={`action-${rowIndex}`} className="w-full h-auto" key={`workflow-action-${rowIndex}`} onDragOver={(e) => { e.preventDefault(); }} onDrop={(e) => {e.preventDefault(); let dropIdx = e.dataTransfer.getData("droppedWorkflowIndex"); handleDrop({scrapeIdx: index, localIndex: rowIndex, dropIndex: Number(dropIdx)});}} >
                                      <div id={`action-drag-wrapper-${rowIndex}`} className="relative flex flex-row items-start justify-start pr-2 w-full" draggable onDragStart={(e) => { e.dataTransfer.setData("droppedWorkflowIndex", String(rowIndex));}} >

                                        <h4 id={`action-heading-${rowIndex}`} className="text-start text-[14px] font-[Helvetica] font-[600] object-contain max-h-[40px] min-w-[80px] max-w-[80px] break-words pr-2" > {`${(Number(rowIndex) + 1)}: ${(scraperInfos?.all[index].workflow[rowIndex].type.at(0).toUpperCase() + scraperInfos?.all[index].workflow[rowIndex].type.slice(1))}`} </h4>

                                        <WorkflowAction
                                          handleChange={handleWorkflowChange} 
                                          scraperInfos={scraperInfos}
                                          setScraperInfos={setScraperInfos}
                                          removeSpecificWorkflow={removeSpecificWorkflow}
                                          type={scraperInfos?.all[index].workflow[rowIndex].type}
                                          scrapeIdx={index} 
                                          rowIndex={Number(rowIndex)}  
                                        />
                                      </div>
                                    </div>
                                  )
                                })
                              }
                            </>
                          )
                      }
                    </div>
                  </div>

                  <hr id={`actions-loop-separator-${index}`} className="bg-black w-[98%] h-[2px] hidden " />

                  <div id={`loop-container-${index}`} className={" hidden w-[90%] h-fit flex flex-col gap-y-2 my-3 items-center relative justify-start p-2 shadow-lg rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg border-gray-600 dark:border-gray-300 border-2"} >

                      <h3 id="loop-heading" className="text-[20px] font-[600] " >
                        {"Please, define your loop here:"}
                      </h3>

                      <div id="loop-wrapper" className="w-full h-full flex flex-row items-end gap-x-6 justify-center" >

                        <div id="loop-start-wrapper" className="w-[50px] h-fit flex flex-col items-center " >

                          <h3 id="loop-start-heading" className="w-full text-[18px] text-center" >Start: </h3>  
                          
                          <input
                            type="number"
                            min={1}
                            id={`loop-start-index-${index}`}
                            value={scraperInfos?.all[index].loop.start}
                            className={"w-full rounded-lg border-2 border-gray-600 dark:border-gray-300 text-[18px] px-1 justify-center h-10 bg-gray-300 dark:bg-gray-600 font-[700]"}
                            onChange={(e) => { handleLoopChange({scrapeIdx: index, paramName: "start", value: Number(e.target.value)}); }}
                          />

                        </div>

                        {/**
                         * <Image
                          src='/assets/icons/scrape/start.svg'
                          id="loop-start"
                          alt='loop start icon'
                          className=" ml-[2px] mr-4 mb-[3px]"
                          width={30} height={30}
                        />
                         */}

                        <div id="loop-end-wrapper" className="w-[50px] h-fit flex flex-col items-center " >

                          <h3 id="loop-end-heading" className="w-full text-[18px] text-center" >End: </h3>  
                          
                          <input
                            type="number"
                            min={1}
                            id={`loop-end-index-${index}`}
                            value={scraperInfos?.all[index].loop.end}
                            className={"w-full rounded-lg border-2 border-gray-600 dark:border-gray-300 text-[18px] px-1 justify-center h-10 bg-gray-300 dark:bg-gray-600 font-[700]"}
                            onChange={(e) => { handleLoopChange({scrapeIdx: index, paramName: "end", value: Number(e.target.value)}); }}
                          />

                        </div>

                        {/**
                         * <Image
                          src='/assets/icons/scrape/end.svg'
                          id="loop-start"
                          alt='loop start icon'
                          className=" ml-[2px] mr-4 mb-[3px]"
                          width={30} height={30}
                        />
                         */}

                        <div id="loop-iterations-wrapper" className="w-[80px] h-fit flex flex-col items-center " >

                          <h3 id="loop-iterations-header" className="w-full text-[18px] text-center" > Iterations: </h3>  
                          
                          <input
                            type="number"
                            min={2}
                            max={10}
                            maxLength={2}
                            id={`loop-iterations-${index}`}
                            className={"w-full rounded-lg border-2 border-gray-600 dark:border-gray-300 text-[18px] px-1 justify-center h-10 bg-gray-300 dark:bg-gray-600 font-[700]"}
                            value={scraperInfos?.all[index].loop.iterations}
                            onChange={(e) => { handleLoopChange({scrapeIdx: index, paramName: "iterations", value: Number(e.target.value)}); }}
                          />

                        </div>

                        {/**
                         * <Image
                          src='/assets/icons/scrape/recycle.svg'
                          id="loop-iterations"
                          alt='iterations icon'
                          className="mb-[-3px] ml-[-3px]"
                          width={45} height={45}
                        />
                         */}

                        <Image 
                          src={"/assets/icons/scrape/trash_can.svg"} 
                          alt="delete loop" 
                          id="delete-loop"
                          width={40} 
                          height={40} 
                          className="absolute right-2 top-2 cursor-pointer mb-[-5px]"
                          onClick={() => { deleteLoop({scrapeIdx: index}); }}
                          />

                      </div>
                    
                  </div>

                </form>
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
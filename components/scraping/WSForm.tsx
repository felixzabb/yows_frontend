"use client";

import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { pullFromDb, runScrape, saveScrape } from "@utils/api_funcs";
import WorkflowAction from "./WorkflowAction";
import WorkflowElement from './WorkflowElement';
import { createAlert, isElementVisible, handleWindowClose, returnInputElementChecked } from "@utils/generalFunctions";
import { appContext } from "@app/layout";
import Tooltip from "../design/Tooltip";
import SaveScrapeDialog from "@components/overlays/SaveScrapeDialog";
import LoadScrapeDialog from "@components/overlays/LoadScrapeDialog";
import ScrapedDataOverlay from "@components/overlays/ScrapedData";
import { ScraperInfoResults, WorkflowObject, GlobalParamsObject, LoopObject, ScraperInfos, PullFromDbReturnData, ScrapeInfoSave, SaveScrapeReturnData, AppContextType } from "@custom-types";

const WSForm = ({ User, authStatus }) => {

  const context = useContext<AppContextType>(appContext);
  const emptyResults : ScraperInfoResults = {
    empty: true,
    0 : {
      scrape_runs : {0 : []}
    }
  }

  const defScrapeInfoObject : { workflow : WorkflowObject, global_params : GlobalParamsObject, loop : LoopObject, } = {
    workflow : { 
      0 : ["scrape-action", {css_selector: ""}] 
    },
    global_params:{
      website_url : "", browser_type: "", wait_time : 5, amount_actions_local : 1
    },
    loop: {
      loop_start_end: [1, 1], iterations: 2, created: false,
    },
  };

  const defScraperInfos : ScraperInfos = {
    all: { 0 : defScrapeInfoObject }, 
    args: { user_email: User?.email, amount_scrapes_global: 1, global_expected_runtime: 10, global_undetected: false }
  };

  const [ scraperInfos, setScrapeInfos ]   = useState(defScraperInfos);
  const [ amountScrapes, setAmountScrapes ] = useState(1);
  const [ results, setResults ] = useState(emptyResults);

  const [ readiness, setReadiness ] = useState<{all?: boolean, [index : number]: boolean}>({all: false, 0: false});
  
  const [ update, setUpdate ] = useState(2);

    /** Only for dev!!! */
  useEffect(() => {

    console.log("Rerender...");
    console.log("Current info:", scraperInfos);
  });

  useEffect(() => {

    if(window.visualViewport.width < 1100){ window.document.getElementById("wsform-sideNav").classList.add("hidden"); };
    
    const usePassed = Boolean(Number(window.sessionStorage.getItem("usePassed")));
     
    if(usePassed){
      const passedObject : ScraperInfos = JSON.parse(window.sessionStorage.getItem("passedSavedObject"));
      if(passedObject === null){ return; }

      setScrapeInfos(passedObject);
      setAmountScrapes(Object.keys(passedObject.all).length);

      window.sessionStorage.setItem("usePassed", "0");
    };

    if(authStatus === "unauthenticated"){ alertSignIn(); };

    window.addEventListener('beforeunload', handleWindowClose);
    rerenderPage();

    return () => { window.removeEventListener('beforeunload', handleWindowClose); };
  }, []);

  useEffect(() => {
    assertReadiness({amount: amountScrapes});
  }, [amountScrapes])

  /** Pulls a scraperInfo object from the DB and sets it as the scraperInfo object in use. Needs to be async.
   * PARAMS:
   * - id (String): the passed in id, by which the API will search the DB
   */
  const loadScrape = async ({id, resultsNeeded, confirmNeeded} : {id : string, resultsNeeded : boolean, confirmNeeded : boolean}) : Promise<void>  => {

    let confirmation = true;

    if(confirmNeeded){ confirmation = confirm("Loading the link will remove your current work"); }
    if(!confirmation){ return; }

    const pullData = {filter : {"_id" : id}, projection: {}}

    const pullOperation : PullFromDbReturnData<ScrapeInfoSave> = await pullFromDb({apiKey: "felix12m", dbName: "test_runs", collectionName : "scrape_info_saves", data: pullData});

    const foundScrapeObject : ScraperInfos = pullOperation.found.at(0).scrape_object;

    setScrapeInfos(foundScrapeObject);
    setAmountScrapes(Object.keys(foundScrapeObject.all).length);

    if(resultsNeeded){

      const potentialFoundResults : ScraperInfoResults = pullOperation.found.at(0).results;
      if(Object.keys(potentialFoundResults).length != 0){setResults(potentialFoundResults);};
    }

    assertReadiness({amount: Object.keys(foundScrapeObject.all).length});
    
    createAlert({context: context, textContent: "Loaded Scraper successfully!", duration: 2000, color: "normal"});

    return;
  };

  const alertSignIn = () : void => {
    createAlert({context: context, textContent: "You are not signed in! Please sign in to use all features.", duration: 3000, color: "normal"});
    return;
  };

  const rerenderPage = () : void => {
    setUpdate((prevUpdate) => { return (prevUpdate +1) % 2; });
    return;
  };

  const resetPage = () => {
    const confirmation = confirm("Are your sure you want to reset the whole scraper?");

    if(!confirmation){return;}

    setAmountScrapes(1);
    setScrapeInfos(defScraperInfos);
    setResults(emptyResults);
    setReadiness({all: false, 0: false});

  };

  const validateCssSelector = ({cssSelector} : {cssSelector : string}) => {
    const possibleChars = [".", "#", "~", ">"];
    const allValidHtmlTags = ["a", "abbr","address","area",	"article","aside","b","base",	"bdi","bdo","blockquote","body","br","button","canvas","caption",	"cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","head","header","hgroup","hr","i","input","ins","kbd","label","legend","li","link","main","map","mark","menu","meta","meter","nav","object","ol","optgroup","option","output","p","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","slot","small","source","span","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","time","title","tr","track","u","ul","var","video","wbr",]
    
    if(allValidHtmlTags.includes(cssSelector)){return true}
    else if(cssSelector.length < 2){return false}

    let firstDesignator = -1;
    for(let i = 0; i < cssSelector.length; i++){
      if(possibleChars.includes(cssSelector.at(i))){
        firstDesignator = i
        break;
      }
    }
    if(firstDesignator !== -1){
      if(firstDesignator === 0){return true}
      if(allValidHtmlTags.includes(cssSelector.slice(0, firstDesignator)) && cssSelector.at(firstDesignator + 1) !== undefined){
        return true
      }
      else{return false;}
    } 
  };

  const collapseAll = () => {
    for(const i of Array.from(Array(amountScrapes).keys())){
      const potentialForm = window.document.getElementById(`scrape-sec-form-${i}`)
      if(!potentialForm.classList.contains("hidden")){
        showHideElement({elementId: `scrape-sec-form-${i}`}); rotateElement({elementId: `hide-show-form-icon-${i}`, degrees: "180"});
      }
    }
  };

  const expandAll = () => {
    for(const i of Array.from(Array(amountScrapes).keys())){
      const potentialForm = window.document.getElementById(`scrape-sec-form-${i}`)
      if(potentialForm.classList.contains("hidden")){
       showHideElement({elementId: `scrape-sec-form-${i}`}); rotateElement({elementId: `hide-show-form-icon-${i}`, degrees: "180"});
      }
     } 
  };

  const assertReadiness = ({amount} : {amount : number}) => {

    let tempObj : {all?: boolean, [index : number]: boolean} = {}

    for(let i = 0; i < amount; i++){
      let v = check_ready({scrapeIdx: i});
      tempObj[i] = v;
    }

    if(Object.values(tempObj).includes(false)){
      tempObj.all = false;
    }
    else{
      tempObj.all = true;
    }
    setReadiness(tempObj);
  };
  
  /** Checks if the current scrapeIdx data is valid to send to the API.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   * - all (Boolean): decides if all scrapes should be checked or only a specific one
   */
  const check_ready = ({scrapeIdx} : {scrapeIdx : number}) => {

    if(scraperInfos?.all === undefined || scraperInfos?.all === null || scraperInfos?.all?.[scrapeIdx] === undefined ||scraperInfos?.all?.[scrapeIdx] === null ){return false;}
  
    if(window.document.getElementById(`wait-param-${scrapeIdx}`) === null){return false;}

    var returnValue = true;

    let scrapeUrl = String(scraperInfos?.all?.[scrapeIdx].global_params.website_url);
    
    let browserType = String(scraperInfos?.all?.[scrapeIdx].global_params.browser_type);
    const possibleBrowserTypes = ["edge", "firefox", "chrome", "safari", ""];

    if(!possibleBrowserTypes.includes(browserType.toLowerCase())){
      window.document.getElementById(`browser-param-${scrapeIdx}`).classList.remove("border-green-800");
      returnValue = false;
    }
    else{window.document.getElementById(`browser-param-${scrapeIdx}`).classList.add("border-green-800");}

    if(scraperInfos?.all[scrapeIdx].loop.created){

      const loopStart = Number(scraperInfos?.all[scrapeIdx].loop.loop_start_end[0]) - 1;
      const loopEnd = Number(scraperInfos?.all[scrapeIdx].loop.loop_start_end[1]) - 1;
      const loopIterations = Number(scraperInfos?.all[scrapeIdx].loop.iterations);
      const allPossibleWorkflowIndexes = Object.keys(scraperInfos?.all[scrapeIdx].workflow);

      if(loopIterations > 10){returnValue = false};

      if(allPossibleWorkflowIndexes.includes(String(loopStart)) && allPossibleWorkflowIndexes.includes(String(loopEnd))){
        window.document.getElementById(`loop-container-${scrapeIdx}`).classList.add("border-green-800");
      }
      else{
        window.document.getElementById(`loop-container-${scrapeIdx}`).classList.remove("border-green-800");
        returnValue = false; 
      }
    }

    const pageLoadTime = Number(scraperInfos?.all[scrapeIdx].global_params.wait_time);

    if(pageLoadTime < 5){

      window.document.getElementById(`wait-param-${scrapeIdx}`).classList.remove("border-green-800");
      returnValue = false;
    }
    else{
      window.document.getElementById(`wait-param-${scrapeIdx}`).classList.add("border-green-800");
    }

    if((scrapeUrl.includes("https://") && scrapeUrl.length > 13 && scrapeUrl.includes(".") && !scrapeUrl.includes(" "))){

      window.document.getElementById(`url-param-${scrapeIdx}`).classList.add("border-green-800");
    }
    else{

      window.document.getElementById(`url-param-${scrapeIdx}`).classList.remove("border-green-800");
      returnValue = false;
    }

    let allWorkflowActionKeys = Object.keys(scraperInfos?.all[scrapeIdx].workflow);

    for(const actionIndex of allWorkflowActionKeys){

      const action_type = scraperInfos?.all[scrapeIdx].workflow[actionIndex][0];
      const action_data = scraperInfos?.all[scrapeIdx].workflow[actionIndex][1];


      if(action_type === 'scrape-action'){

        if(window.document.getElementById(`class-input-${scrapeIdx}-${actionIndex}-container`) === null){return false;}

        const cssSelector : string = action_data.css_selector;

        const actionValid = validateCssSelector({cssSelector: cssSelector})

        if(actionValid){
          window.document.getElementById(`class-input-${scrapeIdx}-${actionIndex}-container`).classList.add("border-green-800")
        }
        else{
          window.document.getElementById(`class-input-${scrapeIdx}-${actionIndex}-container`).classList.remove("border-green-800"); 
          returnValue = false;
        }
      }
      else if(action_type === 'btn-press'){

        if(window.document.getElementById(`btn-selector-input-${scrapeIdx}-${actionIndex}-container`) === null){return false;}

        const cssSelector = action_data.selector;

        const actionValid = validateCssSelector({cssSelector: cssSelector})

        if(actionValid){
          window.document.getElementById(`btn-selector-input-${scrapeIdx}-${actionIndex}-container`).classList.add("border-green-800")
        }
        else{
          window.document.getElementById(`btn-selector-input-${scrapeIdx}-${actionIndex}-container`).classList.remove("border-green-800"); 
          returnValue = false;
        }
      }
      else if(action_type === 'input-fill'){

        if(window.document.getElementById(`input-selector-input-${scrapeIdx}-${actionIndex}-container`) === null){return false;}

        const cssSelector = action_data.selector;

        const actionValid = validateCssSelector({cssSelector: cssSelector})

        if(actionValid){
          window.document.getElementById(`input-selector-input-${scrapeIdx}-${actionIndex}-container`).classList.add("border-green-800")
        }
        else{
          window.document.getElementById(`input-selector-input-${scrapeIdx}-${actionIndex}-container`).classList.remove("border-green-800"); 
          returnValue = false;
        }

        const fill_content = action_data.fill_content;
        if(fill_content.length == 0){window.document.getElementById(`input-fill-content-input-${scrapeIdx}-${actionIndex}-container`).classList.remove("border-green-800"); returnValue = false;}
        else{window.document.getElementById(`input-fill-content-input-${scrapeIdx}-${actionIndex}-container`).classList.add("border-green-800");}
        
      }

      return returnValue; 
    }
    return;
  };
    
  /** Shows or hides html elements depending on their display value.
   * PARAMS:
   * elementId (String): Id of the html to operate on
   */
  const showHideElement = ({elementId} : {elementId : string}) : void => {

    let elementClassList = window.document.getElementById(elementId)?.classList;
                        
    if (elementClassList.contains("hidden")){

      elementClassList.remove("hidden")
    }
    else{

      elementClassList.add("hidden")
    }
    
    rerenderPage();

    return;
  };

  /** Rotates a element by a specified number of degrees.!!! Could be abused if different degree numbers get entered again and again, so should add a check !!!
   * PARAMS:
   * - elementId (String): Id of the html to operate on
   * - degreed (String): number of degrees to rotate by
   */
  const rotateElement = ({elementId, degrees} : {elementId : string, degrees : string}) : void => {

    const possibleDegreeRotations = ["rotate-180, rotate-90, rotate-45, rotate-135, rotate-270, rotate-315"]
    let classList = window.document.getElementById(elementId).classList;

    if(classList.contains(`rotate-${degrees}`)){ classList.remove(`rotate-${degrees}`); }
    else{ classList.add(`rotate-${degrees}`); }

    return;
  };
  
  /** Resets a particular scrape to the defScrapeInfoObject through setState.
   * PARAMS:
   * - resetScrapeIdx (String): the current index in the scraperInfo.all of the scrape to be reset
   */
  const resetScrape = ({resetScrapeIdx} : {resetScrapeIdx: number}) : void => {

    const confirmation = confirm("Do you want to reset the current scrape?");

    if(!confirmation){return;};

    let scraperInfoCopy = scraperInfos;

    scraperInfoCopy.all[resetScrapeIdx] = defScrapeInfoObject;

    const loopContainer = window.document.getElementById(`loop-container-${resetScrapeIdx}`);

    if(!loopContainer.classList.contains("hidden")){
      loopContainer.classList.add("hidden");
    };

    setScrapeInfos(scraperInfoCopy);
    assertReadiness({amount: amountScrapes});

    rerenderPage();
    
    return;
  };

  /** Deletes a particular scrape in scraperInfo.all 
   * PARAMS:
   * - deleteScrapeIdx (String): the current index in the scraperInfo.all of the scrape to be deleted
  */
  const deleteSpecificScrape = ({deleteScrapeIdx} : {deleteScrapeIdx : number}) : void => {

    const confirmation = confirm("Do you want to delete the current scrape?");

    if(!confirmation){return;};

    const allScrapeIdx = Object.keys(scraperInfos?.all);
    let scraperInfoCopy = scraperInfos;

    // intermediate storage
    let container = {};

    for(const scrapeIdx of allScrapeIdx){

      if (scrapeIdx !== String(deleteScrapeIdx)){

        // will always equal the next index that is 'empty/undefined'
        let appendScrapeIndex = Object.keys(container).length;

        container[appendScrapeIndex] = scraperInfos?.all[scrapeIdx];
      };
    };

    scraperInfoCopy.all = container;

    setScrapeInfos(scraperInfoCopy);
    assertReadiness({amount: amountScrapes});
    setAmountScrapes((prevAmountScrapes) => { return (prevAmountScrapes - 1); });

    return;
  };

  /** Deletes the last scrape in scraperInfo.all 
  */
  const deleteLastScrape = () : void => {

    let scraperInfoCopy = scraperInfos;

    const lastScrapeIdx = Object.keys(scraperInfoCopy.all).length - 1; 

    delete scraperInfoCopy.all[lastScrapeIdx];

    setScrapeInfos(scraperInfoCopy);
    assertReadiness({amount: amountScrapes});
    setAmountScrapes((prevAmountScrapes) => { return (prevAmountScrapes - 1); });

    return;
  };

  /** Appends a scrape to scraperInfo.all 
   */
  const appendScrape = () : void => {

    let scraperInfoCopy = scraperInfos;
    const appendScrapeIdx = Object.keys(scraperInfoCopy.all).length;
    scraperInfoCopy.all[appendScrapeIdx] = defScrapeInfoObject;

    setScrapeInfos(scraperInfoCopy);
    assertReadiness({amount: (amountScrapes + 1)});
    setAmountScrapes((prevAmountScrapes) => { return (prevAmountScrapes + 1) });

    rerenderPage();

    return;
  };

  /** Appends a btn-press workflow to the current scrape.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   */
  const appendBtnPressWorkflow = ({scrapeIdx} : {scrapeIdx : number}) : void => {

    let scraperInfoCopy = scraperInfos;
    const appendIdx = Object.keys(scraperInfoCopy.all[scrapeIdx].workflow).length;

    const defBtnPressesObject_only_dict = { selector: "", wait_after: ""};

    scraperInfoCopy.all[scrapeIdx].workflow[appendIdx] = ["btn-press", defBtnPressesObject_only_dict];

    setScrapeInfos(scraperInfoCopy);
    assertReadiness({amount: amountScrapes});

    rerenderPage();

    return;
  };

  /** Appends a input-fill workflow to the current scrape.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   */
  const appendInputFillWorkflow = ({scrapeIdx} : {scrapeIdx : number}) : void => {

    let scraperInfoCopy = scraperInfos;
    const appendIdx = Object.keys(scraperInfoCopy.all[scrapeIdx].workflow).length;

    const defInputFillObjects_only_dict = { selector: "", fill_content: "" };

    scraperInfoCopy.all[scrapeIdx].workflow[appendIdx] = ["input-fill", defInputFillObjects_only_dict];

    setScrapeInfos(scraperInfoCopy);
    assertReadiness({amount: amountScrapes})

    rerenderPage();

    return;
  };

  /** Appends a wait-time workflow to the current scrape.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   */
  const appendWaitTimeWorkflow = ({scrapeIdx} : {scrapeIdx : number}) : void => {

    let scraperInfoCopy = scraperInfos;
    const appendIdx = Object.keys(scraperInfoCopy.all[scrapeIdx].workflow).length;

    const defWaitObject_only_dict = { time_to_wait: "" };

    scraperInfoCopy.all[scrapeIdx].workflow[appendIdx] = ["wait-time", defWaitObject_only_dict];

    setScrapeInfos(scraperInfoCopy);
    assertReadiness({amount: amountScrapes})

    rerenderPage();

    return;
  };

  /** Appends a scrape-action workflow to the current scrape.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   */
  const appendScrapeActionWorkflow = ({scrapeIdx} : {scrapeIdx : number}) : void => {

    let scraperInfoCopy = scraperInfos;
    const appendIdx = Object.keys(scraperInfoCopy.all[scrapeIdx].workflow).length;

    const defScrapeObject_only_dict = {css_selector: ""};

    scraperInfoCopy.all[scrapeIdx].workflow[appendIdx] = ["scrape-action", defScrapeObject_only_dict];

    setScrapeInfos(scraperInfoCopy);
    assertReadiness({amount: amountScrapes})

    rerenderPage();

    return;
  };

  /** Handles changes in the loop input.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   */
  const handleLoopChange = ({scrapeIdx, paramName, value} : {scrapeIdx : number, paramName : string, value : number}) : void => {

    let scraperInfoCopy = scraperInfos;

    if(paramName === "iterations"){

      if(value > 10){

        createAlert({context: context, textContent: "Iterations can be a maximum of 10 on this plan!", duration: 2000, color: "red"});
      }

      scraperInfoCopy.all[scrapeIdx].loop.iterations = value;
    }
    else{

      const workflowLength = Object.keys(scraperInfoCopy.all[scrapeIdx].workflow).length;

      if(value > workflowLength){
        createAlert({context: context, textContent: "There isn't an element with this Index!", duration: 2000, color: "red"})
      }
      else{
        if( paramName === "elementsStart"){

          scraperInfoCopy.all[scrapeIdx].loop.loop_start_end[0] = value; // -1 ; // computers start at 0
        }
        else if( paramName === "elementsEnd" ){

          scraperInfoCopy.all[scrapeIdx].loop.loop_start_end[1] = value; // - 1; // computers start at 0
        }
      }
    }

    setScrapeInfos(scraperInfoCopy);
    assertReadiness({amount: amountScrapes})

    rerenderPage();

    return;
  };

  /** Deletes loop in a scrape.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   */
  const deleteLoop = ({scrapeIdx} : {scrapeIdx : number}) : void => {

    let scraperInfoCopy = scraperInfos;

    scraperInfoCopy.all[scrapeIdx].loop = { loop_start_end: [1, 1], iterations: 2, created: false };

    showHideElement({elementId: `loop-container-${scrapeIdx}`}); 
    showHideElement({elementId: `actions-loop-separator-${scrapeIdx}`});

    setScrapeInfos(scraperInfoCopy);
    assertReadiness({amount: amountScrapes})

    rerenderPage();

    return;
  };

  /** Removes the last workflow of the current scrape.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   */
  const removeLastWorkflow = ({scrapeIdx} : {scrapeIdx : number}) : void => {

    let scraperInfoCopy = scraperInfos;

    // '-1' is important, so that it's always equal to the last populated index
    const removeIdx = Object.keys(scraperInfoCopy.all[scrapeIdx].workflow).length -1; 
    const loopStart = Number(scraperInfoCopy.all[scrapeIdx].loop.loop_start_end[0]);
    const loopEnd = Number(scraperInfoCopy.all[scrapeIdx].loop.loop_start_end[1]);

    if((removeIdx + 1) == loopStart){
      scraperInfoCopy.all[scrapeIdx].loop.loop_start_end[0] = 1;
    }

    if((removeIdx + 1) == loopEnd){
      console.log("setting end")
      scraperInfoCopy.all[scrapeIdx].loop.loop_start_end[1] = 1;
    }

    delete scraperInfoCopy.all[scrapeIdx].workflow[removeIdx];

    setScrapeInfos(scraperInfoCopy);
    assertReadiness({amount: amountScrapes})

    rerenderPage();

    return;
  };

  /** Generates a sample workflow, depending on the last generated sample row (rotates)
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   */
  const generateSampleWorkflow = ({scrapeIdx} : {scrapeIdx : number}) : void => {

    let scraperInfoCopy = scraperInfos;
    const lastPopulatedWorkflowIndex = Object.keys(scraperInfos?.all[scrapeIdx].workflow).length -1; // so it's populated (computers start counting at 0)
    const lastWorkflowType = scraperInfos?.all[scrapeIdx].workflow[lastPopulatedWorkflowIndex][0];
    let sampleArray : [string, object];

    const appendIndex = Object.keys(scraperInfoCopy.all[scrapeIdx].workflow).length;

    if(lastWorkflowType === "scrape-action"){
      
      sampleArray = ["btn-press", {selector: ".cbtn#login", wait_after: "10", loop: "0"}];
    }
    else if(lastWorkflowType === "btn-press"){

      sampleArray = ["input-fill", {selector: ".ninpt#login", fill_content: "username", loop: "0"}];
    }
    else if(lastWorkflowType === "input-fill"){

      sampleArray = ["wait-time", {time_to_wait: "30"}];
    }
    else if(lastWorkflowType === "wait-time"){

      sampleArray = ["scrape-action", {css_selector: "a.scp"}]
    }

    scraperInfoCopy.all[scrapeIdx].workflow[appendIndex] = sampleArray;

    setScrapeInfos(scraperInfoCopy);
    assertReadiness({amount: amountScrapes});

    rerenderPage();

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

    let scraperInfoCopy = scraperInfos;
    const firstUnpopulatedWorkflowIndex = Object.keys(scraperInfoCopy.all[scrapeIdx].workflow).length;

    scraperInfoCopy.all[scrapeIdx].loop.created = true;

    scraperInfoCopy.all[scrapeIdx].loop.loop_start_end[0] = firstUnpopulatedWorkflowIndex; // loop start
    scraperInfoCopy.all[scrapeIdx].loop.loop_start_end[1] = firstUnpopulatedWorkflowIndex; // loop end (because no member in the current loop)

    setScrapeInfos(scraperInfoCopy);

    rerenderPage();

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
    
    let scraperInfoCopy = scraperInfos;

    scraperInfoCopy.all[scrapeIdx].global_params[paramName] = value;

    // sets the amount of scrapes can be moved to a useEffect
    scraperInfoCopy.all[scrapeIdx].global_params.amount_actions_local = Object.keys(scraperInfoCopy.all[scrapeIdx].workflow).length;

    setScrapeInfos(scraperInfoCopy);
    assertReadiness({amount: amountScrapes})

    rerenderPage();

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
  const handleNormalChange = ({scrapeIdx, workflowIndex, paramName, value} : {scrapeIdx : number, workflowIndex : number, paramName : string, value : string | number | boolean}) => {

    let scraperInfoCopy = scraperInfos;

    scraperInfoCopy.all[scrapeIdx].workflow[workflowIndex][1][paramName] = value;
    scraperInfoCopy.all[scrapeIdx].global_params.amount_actions_local = Object.keys(scraperInfoCopy.all[scrapeIdx].workflow).length;

    setScrapeInfos(scraperInfoCopy);
    assertReadiness({amount: amountScrapes})

    rerenderPage();

    return;
  };

  /** Sends a POST request with scraperInfo as the body to the API, which then saves the object to the DB, so that it can be retrieved if needed.
   *  Copies the ObjectId by which the scraperInfo object can be retrieved to the clipboard.
  */
  const generateExport = async ({name, description, withRes} : {name : string, description : string, withRes : boolean}) : Promise<void> => {

    const exportData = [{scrape_object : scraperInfos, name: name, description: description, runtime: calculateWaitTime({all: true, scrapeIdx: null}), results: {}}];

    if(withRes){ exportData[0].results = results;};

    const saveOperation : SaveScrapeReturnData = await saveScrape({apiKey: "felix12m", userId: User.id, data: exportData});

    navigator.clipboard.writeText(saveOperation.created_id);

    createAlert({context: context, textContent: "Copied ID to clipboard successfully!", duration: 2000, color: "normal"});

    return;
  };

  /** Sends a POST request with scraperInfo or parts of it as the body to the API, which then runs the web-scrape-function depending on the params given in the body and
   * returns then returns the scraped data.
   * PARAMS:
   * - all (Boolean): specifies if all of scraperInfo or only a single scrape should be sent to the API
   * - scrapeIdx (String): the current index in the scraperInfo.all (only used when all=false)
    */
  const newSubmit = async ({all, scrapeIdx} : {all : boolean, scrapeIdx : number}) : Promise<void> => {
    context.setAppContextData((prevAppContextData) => {
      prevAppContextData.overlayChildData.results = emptyResults;
      return prevAppContextData;
    });

    const expectedWaitTime = calculateWaitTime({all: all, scrapeIdx: scrapeIdx})

    showOverlay({type: "results", title: "Scraped data"}, {expectedWaitTime: expectedWaitTime, saveAbility: false})

    let runData : any = {};

    if(all){

      runData = scraperInfos
      runData.args.amount_scrapes_global = amountScrapes; // value is passed to decide if multithreading is 'possible'
      
    }
    else{

      runData = {all : {"0" : scraperInfos?.all[scrapeIdx]}, args : {user_email : User['email'], amount_scrapes_global : ""}}
      runData.args.amount_scrapes_global = 1; // NO multithreading
    }
    
    runData.args.global_expected_runtime = expectedWaitTime;

    const runOperation = await runScrape({apiKey: "felix12m", userId: User.id, data: JSON.stringify(runData)});

    setResults((prevResults) => {
      prevResults = runOperation.results;
      prevResults.empty = false;
      return prevResults;
    });
    
    context.setAppContextData((prevAppContextData) => {
      prevAppContextData.overlayChildData.results = runOperation.results;
      return prevAppContextData;
    });
    context.updateContext((prevUpdate) => { return (prevUpdate +1) % 2});
    return;
  };

  /** Calculates the approximate time the scrape-fetch API call will take. 
   *  PARAMS:
   * - all (Boolean): Decides if all of the scrapes should be included or just a specific one
   * - scrapeIdx (String): the current index in the scraperInfo.all (only used when all=false)
  */
  const calculateWaitTime = ({all, scrapeIdx} : {all : boolean, scrapeIdx : number}) : number => {

    let scraperInfoCopy = scraperInfos;

    if(all){

      const allscrapeIdx = Object.keys(scraperInfoCopy.all);
      let cummWaitTime = 0;

      for(const index of allscrapeIdx){

        cummWaitTime += Number(calculateWaitTime({all: false, scrapeIdx: Number(index)}));
      }

      return Number(cummWaitTime);
    }
    else{
     
      let waitTime = Number(scraperInfoCopy.all[scrapeIdx].global_params.wait_time) + 5; // +5 for return and runtime reasons
      const allWorkflowKeys = Object.keys(scraperInfoCopy.all[scrapeIdx].workflow);

      
      for(const wIndex of allWorkflowKeys){

        const workflowType = scraperInfoCopy.all[scrapeIdx].workflow[wIndex][0];
        const workflowData = scraperInfoCopy.all[scrapeIdx].workflow[wIndex][1];

        if(workflowType === "scrape-action"){ waitTime += 1; }

        else if(workflowType === "btn-press"){ waitTime += (Number(workflowData.wait_after) + 1); } // +1 because of button press

        else if(workflowType === "input-fill"){ waitTime += 1; }

        else if(workflowType === "wait-time"){ waitTime += Number(workflowData.time_to_wait); }
      }

      if(scraperInfoCopy.all[scrapeIdx].loop.created){
        
        const loopStart = Number(scraperInfoCopy.all[scrapeIdx].loop.loop_start_end[0]);
        const loopEnd = Number(scraperInfoCopy.all[scrapeIdx].loop.loop_start_end[1]);
        const loopIterations = Number(scraperInfoCopy.all[scrapeIdx].loop.iterations);

        let oneLoopTime = 0;

        for(let loopIndex = (loopStart - 1); loopIndex < loopEnd; loopIndex += 1){  // no -1 at loopEnd because last number is exclusive

          const workflowType = scraperInfoCopy.all[scrapeIdx].workflow[loopIndex][0];
          const workflowData = scraperInfoCopy.all[scrapeIdx].workflow[loopIndex][1];

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

  const showOverlay = ({type, title} : {type : string, title : string} , kwargs : any) => {

    const overlayContentContainer = window.document.getElementById("document-overlay-container");
    if(overlayContentContainer === null){return;}
    const setContext = context.setAppContextData;

    setContext((prevContextData) => {

      if(type === "results"){
        prevContextData.overlayChild = <ScrapedDataOverlay expectedWaitTime={kwargs.expectedWaitTime} saveAbility={kwargs.saveAbility} />
      }
      else if(type === "save"){
        prevContextData.overlayChild = <SaveScrapeDialog results={kwargs.results} generateExport={generateExport} />
      }
      else if(type === "load"){
        prevContextData.overlayChild = <LoadScrapeDialog load={kwargs.loadScrape} />
      }

      prevContextData.overlayChildTitle = title;

      return prevContextData;
    });
    showHideElement({elementId: "document-overlay-container"});
    context.updateContext((prevUpdate) => { return (prevUpdate +1) % 2});

  };

  return ( 
    <div id="wsform-container" className="flex flex-row flex-grow items-start justify-start w-full min-h-[100dvh] max-h-[100dvh]" >
      <section id={"wsform-sideNav"} className="flex flex-col items-center min-w-[270px] max-w-[350px] w-full h-full overflow-auto bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg p-4 " >

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
                      onClick={() => { deleteLastScrape(); }}
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
                readiness.all ? 
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
              <div onClick={() => { setScrapeInfos((prevScraperInfos) => {
                    prevScraperInfos.args.global_undetected = !returnInputElementChecked({elementId: "global-undetected-switch"});
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
              onClick={() => {resetPage()}}
            />

          </div>

          <hr id="wsform-sideNav-options-separator-1" className="my-2 max-h-[1px] w-full border-black dark:border-white opacity-10" />
          
          <div id={"save-scraper-option-container"} className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

            <h2 id={"save-scraper-option-heading"} className="font-inter text-[18px]" > {`Save your Scraper:`} </h2>
            
            <div id={"save-scraper-option-wrapper"} className="flex flex-row items-center gap-x-2 w-auto h-auto" >
              {
                readiness.all ? 
                  (
                    <Image
                      src={"/assets/icons/scrape/save.svg"}
                      alt={"Save scraper"}
                      id="save-scraper"
                      width={40}
                      height={40}
                      className="cursor-pointer"
                      onClick={() => { showOverlay({type: "save", title: "Save a Scraper!"}, {results: results, generateExport: generateExport}) }}
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
              onClick={() => { showOverlay({type: "load", title: "Load a Scraper!"}, {loadScrape : loadScrape})}}                       
            />
          </div>

          <hr id="wsform-sideNav-options-separator-2" className="my-2 max-h-[1px] w-full border-black dark:border-white opacity-10" />

          <div id={"show-results-option-container"} className="flex flex-row items-center justify-between w-full h-auto gap-x-4" >

            <h2 id={"show-results-option-heading"} className="font-inter text-[18px]" > {`Show scraped data:`} </h2>
            
            <div id={"show-results-option-wrapper"} className="flex flex-row items-center gap-x-2 w-auto h-auto" >
              {
                !context.appContextData.overlayChildData?.results?.empty ? 
                  (
                    <Image
                      src={"/assets/icons/generic/data.svg"}
                      alt={"Show scraped data"}
                      id="show-scraped-data"
                      width={40}
                      height={40}
                      className="cursor-pointer"
                      onClick={() => {    showOverlay({type: "results", title: "Scraped data"}, {results: results, saveAbility: false})}}                       />
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

      <hr id="wsform-sideNav-separator" className="w-[2px] h-[100dvh] bg-gray-400 " /> 

      <div id={"wsform-all-scrapes-container"} className="scraper_grid p-5 mt-5 w-full h-full max-h-[100dvh] mx-[1%] overflow-auto" >
        {   
          Array.from(Array(amountScrapes).keys()).map((index) => {

            if(scraperInfos?.all[index] === undefined){
              return(<></>)
            }

            return(
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

                    {
                      readiness[index] ? 
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

                    <hr className="h-[38px] w-[2px] bg-gray-400 " />

                    {
                      amountScrapes > 1 ?
                        (
                          <Image id={`delete-scrape-${index}`} src='/assets/icons/scrape/trash_can.svg' onClick={() => { deleteSpecificScrape({deleteScrapeIdx: index}); }} 
                            width={40} height={40} alt="delete button" className="cursor-pointer" /> 
                        )
                        :
                        (
                          <Image id={`delete-scrape-${index}_disabled`} src='/assets/icons/scrape/trash_can.svg' 
                            width={40} height={40} alt="delete button" className="opacity-50 cursor-not-allowed" />
                        )
                    }

                    <Image id={`reset-scrape-${index}`} onClick={() => { resetScrape({resetScrapeIdx: index}); }} src='/assets/icons/scrape/reset.svg' 
                      width={38} height={38} alt="reset button" className="cursor-pointer" />
                    
                    <Image 
                      className="cursor-pointer rotate-180" width={40} height={40} 
                      src="/assets/icons/generic/updownarrow.svg" 
                      id={`toggle-scrape-visibility-${index}`}  
                      alt={"hide form icon"}
                      onClick={() => { showHideElement({elementId: `scrape-form-${index}`}); rotateElement({elementId: `toggle-scrape-visibility-${index}`, degrees: "180"}); }}
                    />
                        
                  </div>

                </aside>

                <form id={`scrape-form-${index}`} className="px-2 min-w-[600px] flex flex-col items-center h-full w-auto justify-around gap-y-2 mb-2" >

                  <div id={`global-params-container-${index}`} className=" flex flex-col items-center min-h-[40px] h-auto gap-y-1 w-full justify-evenly mt-1" >

                    <div id={`url-param-container-${index}`} className="w-full h-[44px] flex flex-row items-center gap-x-4 px-2" >
                      <h3 id={`url-param-heading-${index}`} className="text-[18px] font-[600] w-[70px] text-start " >URL</h3>
                      <div  id={`url-param-wrapper-${index}`} className="relative flex flex-row items-center w-[calc(55%+142px)] h-[40px] rounded-xl bg-purple-400 dark:bg-purple-300 mr-[6px] " >
                        <input type="text"
                          required 
                          placeholder="https://example.com"
                          value={scraperInfos?.all?.[index].global_params.website_url}
                          id={`url-param-${index}`} 
                          className='text-[16px] pl-2 h-[calc(100%-6px)] w-[calc(100%-32px)] focus:outline-none text-start pr-2 m-[3px] autofill:delay-[9999s] focus:delay-[9999s] hover:delay-[9999s] active:delay-[9999s] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark' 
                          onChange={(e) => { handleGlobalParamChange({scrapeIdx: index, paramName: "website_url", value: e.target.value}); }} 
                        />

                        <div  id={`url-param-tooltip-container-${index}`} className="group flex items-center justify-center min-w-[30px] h-full" >

                          <div id={`url-param-tooltip-wrapper-${index}`} className="h-auto w-auto hidden group-hover:flex " >
                            <Tooltip content={"Any valid URL. Must be https."} /> 
                          </div>

                          <Image id={`url-param-tooltip-toggle-${index}`} src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} />

                        </div>
                      </div>
                    </div>

                    <div id={`browser-and-wait-param-container-${index}`} className="w-full h-[44px] flex flex-row items-center gap-x-4 px-2" >

                      <h3 id={`browser-param-heading-${index}`} className="text-[18px] font-[600] w-[70px] text-start" >Browser</h3>
                      <div id={`browser-param-wrapper-${index}`} className="relative flex flex-row items-center w-[calc(30%+12px)] h-[40px] rounded-xl bg-purple-400 dark:bg-purple-300 mr-[6px] " >
                        <input type="text" 
                          className='text-[16px] pl-2 h-[calc(100%-6px)] w-[calc(100%-32px)] focus:outline-none text-start pr-2 m-[3px] autofill:delay-[9999s] focus:delay-[9999s] hover:delay-[9999s] active:delay-[9999s] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark' 
                          required 
                          placeholder="Browser"
                          value={scraperInfos?.all?.[index].global_params.browser_type}
                          id={`browser-param-${index}`}
                          onChange={(e) => { handleGlobalParamChange({scrapeIdx: index, paramName: "browser_type", value: e.target.value}); }} 
                        />

                        <div id={`browser-param-tooltip-container-${index}`} className="group flex items-center justify-center min-w-[30px] h-full" >

                          <div id={`browser-param-tooltip-wrapper-${index}`} className="h-auto w-auto hidden group-hover:flex " >
                            <Tooltip content={"Can be 'chrome', 'safari', 'edge' or 'firefox'."} /> 
                          </div>

                          <Image id={`browser-param-tooltip-toggle-${index}`} src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} />

                        </div>
                      </div>

                      <h3 id={`wait-param-heading-${index}`} className="text-[18px] font-[600] w-[80px] text-start ml-[7%]" >load time</h3>
                      <div id={`wait-param-wrapper-${index}`} className="relative flex flex-row items-center w-[calc(18%+12px)] h-[40px] rounded-xl bg-purple-400 dark:bg-purple-300 mr-[6px] " >
                        <input type="number" 
                          min={5}
                          className='text-[16px] pl-2 h-[calc(100%-6px)] w-[calc(100%-32px)] focus:outline-none text-start pr-2 m-[3px] autofill:delay-[9999s] focus:delay-[9999s] hover:delay-[9999s] active:delay-[9999s] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark' 
                          required 
                          value={scraperInfos?.all?.[index].global_params.wait_time}
                          id={`wait-param-${index}`} 
                          onChange={(e) => { handleGlobalParamChange({scrapeIdx: index, paramName: "wait_time", value: Number(e.target.value)}); }} 
                        />

                        <div id={`wait-param-tooltip-container-${index}`} className="group flex items-center justify-center min-w-[30px] h-full" >

                          <div id={`wait-param-tooltip-wrapper-${index}`} className="h-auto w-auto hidden group-hover:flex " >
                            <Tooltip content={"Enter a valid integer between 0-25."} /> 
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
                          scraperInfos?.all[index] !== undefined && scraperInfos?.all[index] !== null  && Object.keys(scraperInfos?.all[index].workflow).length > 1 ?
                            (

                              <button id={`pop-scrape-${index}`} className="row_options_button bg-[#bd3030]"  
                                onClick={(e) => { e.preventDefault(); removeLastWorkflow({scrapeIdx: index}); }} >
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
                          onClick={(e) => { e.preventDefault(); appendScrapeActionWorkflow({scrapeIdx: index}); }} >
                          + Scrape
                        </button>

                        <button id={`add-button-action-${index}`} className="row_options_button bg-[#003314cc] " 
                          onClick={(e) => { e.preventDefault(); appendBtnPressWorkflow({scrapeIdx: index}); }} >
                          + Button
                        </button>

                        <button id={`add-input-action-${index}`} className="row_options_button bg-[#003314cc] " 
                          onClick={(e) => { e.preventDefault(); appendInputFillWorkflow({scrapeIdx: index}); }} >
                          + Input
                        </button>

                        <button id={`add-wait-action-${index}`} className="row_options_button bg-[#003314cc] " 
                          onClick={(e) => { e.preventDefault(); appendWaitTimeWorkflow({scrapeIdx: index}); }} >
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
                              <button id={`toggle-loop-visibility-${index}`} className="row_options_button bg-purple-500 dark:bg-purple-700" 
                                onClick={(e) => { e.preventDefault(); showHideElement({elementId: `loop-container-${index}`}); showHideElement({elementId: `actions-loop-separator-${index}`}); rerenderPage(); }}  >
                                {
                                  isElementVisible({elementId: `loop-container-${index}`}) ? 
                                    (
                                      "Show loop"
                                    )
                                    :
                                    (
                                      "Hide loop"
                                    )
                                }
                              </button>
                            )
                        }

                        <button id={`toggle-workflow-container-visibility-${index}`} className="row_options_button bg-purple-500 dark:bg-purple-700 min-w-[80px] " 
                          onClick={(e) => { e.preventDefault(); showHideElement({elementId: `workflow-container-${index}`}); }} >
                          {
                            // So that the button switches text depending on workflow-container-visibility
                            isElementVisible({elementId: `workflow-container-${index}`}) ? 
                              ( "Show WF" ) : ( "Hide WF" )
                          }
                        </button>

                        <button id={`add-sample-${index}`} className="row_options_button bg-purple-500 dark:bg-purple-700" 
                          onClick={(e) => { e.preventDefault(); generateSampleWorkflow({scrapeIdx: index}); }} >
                          Sample 
                        </button>

                    </div>

                    <div id={`actions-container-${index}`} className="rows_grid w-auto h-auto gap-y-1 p-2 " >
                      {
                        scraperInfos?.all?.[index] !== undefined &&
                          (
                            <>
                              { 
                                Object.keys(scraperInfos?.all?.[index].workflow).map((rowIndex) => {

                                  return (
                                    <div id={`action-${rowIndex}`} className="relative flex flex-row items-center justify-start pr-2 " key={`workflow-action-${rowIndex}`} >

                                      <h4 id={`action-heading-${rowIndex}`} className="text-start text-[14px] font-[Helvetica] font-[600] object-contain max-h-[40px] min-w-[80px] max-w-[80px] break-words pr-2" > {`${(Number(rowIndex) + 1)}: ${(scraperInfos?.all?.[index].workflow[rowIndex][0].at(0).toUpperCase() + scraperInfos?.all?.[index].workflow[rowIndex][0].slice(1))}`} </h4>

                                      <WorkflowAction 
                                        handleChange={handleNormalChange} 
                                        scraperInfos={scraperInfos} 
                                        setScrapeInfos={setScrapeInfos} 
                                        rerenderPage={rerenderPage}
                                        type={scraperInfos?.all?.[index].workflow[rowIndex][0]}
                                        scrapeIdx={index} 
                                        rowIndex={Number(rowIndex)}  />
                                    
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

                  <div id={`loop-container-${index}`} className={" hidden w-[90%] h-fit flex flex-col gap-y-2 my-3 items-center relative justify-start p-2 shadow-lg rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg border-gray-600 dark:border-gray-300 border-2  "} >

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
                            value={scraperInfos?.all[index].loop.loop_start_end[0]}
                            className={"w-full rounded-lg border-2 border-gray-600 dark:border-gray-300 text-[18px] px-1 justify-center h-10 bg-gray-300 dark:bg-gray-600 font-[700]"}
                            onChange={(e) => { handleLoopChange({scrapeIdx: index, paramName: "elementsStart", value: Number(e.target.value)}); }}
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
                            value={scraperInfos?.all[index].loop.loop_start_end[1]}
                            className={"w-full rounded-lg border-2 border-gray-600 dark:border-gray-300 text-[18px] px-1 justify-center h-10 bg-gray-300 dark:bg-gray-600 font-[700]"}
                            onChange={(e) => { handleLoopChange({scrapeIdx: index, paramName: "elementsEnd", value: Number(e.target.value)}); }}
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

                  <div id={`workflow-container-${index}`} className="hidden p-3 border-[black] border-2 rounded-md min-h-[40px] h-auto w-full mt-8" >

                    <div id={`workflow-content-wrapper-${index}`} className="workflow_grid" >

                      {
                        [...Object.keys(scraperInfos?.all[index].workflow)].map((workflowIndex) => {

                          return (

                              <WorkflowElement
                                key={workflowIndex} 
                                scraperInfos={scraperInfos} 
                                rerenderPage={rerenderPage} 
                                setScrapeInfos={setScrapeInfos} 
                                scrapeIdx={index} 
                                workflowIndex={Number(workflowIndex)}
                              />

                          );
                        })
                      }
                    </div>
                  </div>
                </form>
              </section>
            );

          })
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
"use client"; // IMPORTANT!!!

/** IMPORTS */
import { useState, useEffect } from "react";
import Image from "next/image";
import ResultOverlay from '@components/ResultOverlay'
import { pullFromDb, runScrape, saveScrape } from "@utils/api_funcs";
import DialogOverlay from "@components/DialogOverlay";
import RowTypeComponent from "./RowTypeComponent";
import WorkflowElement from '@components/small_components/WorkflowElement';
import { ClockLoader } from "react-spinners";
import { isElementVisible } from "@utils/generalFunctions";

const WSForm = ({ User }) => {

  const emptyResults : ScraperInfoResults = {
    0 : {
      scrape_runs : {0 : []}
    }
  }

  const defScrapeInfoObject : { workflow : WorkflowObject, global_params : GlobalParamsObject, loop : LoopObject, } = {
    workflow : { 
      0 : ["scrape-action", {css_selector: ""}] 
    },
    global_params:{
      website_url : "", wait_time : 5, amount_actions_local : 1, use_undetected: false
    },
    loop: {
      loop_start_end: [1, 1], iterations: 2, created: false,
    },
  };

  const defScraperInfos : ScraperInfos = {
    all: { 0 : defScrapeInfoObject }, 
    args: { user_email: User['email'], amount_scrapes_global: 1, global_expected_runtime: 10 }
  };


  const [ scraperInfos, setScrapeInfos ]   = useState(defScraperInfos);
  const [ amountScrapes, setAmountScrapes ] = useState(1);
  const [ results, setResults ] = useState(emptyResults);

  const [ expectedLoadingTime, setExpectedLoadingTime ] = useState(10);
  const [ loadingOverlay, setLoadingOverlay ] = useState(true);
  const [ currentOverlay, setCurrentOverlay ] = useState("dialog");
  const [ currentPopUpText, setCurrentPopUpText ] = useState("Copied ID to clipboard successfully!");

  const [ readiness, setReadiness ] = useState({all: false, 1: false});
  
  const [ update, setUpdate ] = useState(2);

    /** Only for dev!!! */
  useEffect(() => {

    console.log("Rerender...")
    console.log("Current info:", scraperInfos);
  });

  useEffect(() => {
    
    const useIt = Boolean(Number(window.sessionStorage.getItem("usePassed")));
     
    if(useIt){
      const possiblePassedObject : ScraperInfos = JSON.parse(window.sessionStorage.getItem("passedSavedObject"));

      if(possiblePassedObject !== null){
        setScrapeInfos(possiblePassedObject);
        setAmountScrapes(Object.keys(possiblePassedObject.all).length);
        window.sessionStorage.setItem("usePassed", "0")
      }
    }
    const handleWindowClose = (e : BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
      return e.returnValue
    };

    window.addEventListener('beforeunload', handleWindowClose);

    setUpdate((prevUpdate) => {return (prevUpdate +1 ) % 2});
    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
    };
  }, [])

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

    // need to work out better pop-up technique

    assertReadiness()
    
    setCurrentPopUpText("Set Object succesfully!");

    showHideElement({elementId: "alert-container"});

    setTimeout(() => {showHideElement({elementId: "alert-container"});}, 3000);

    showHideElement({elementId: "overlay-section"});
    

    return;
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

  const assertReadiness = () => {

    let tempObj = {all: false, 1: false}

    for(let i = 0; i < amountScrapes; i++){
      tempObj[i] = check_ready({scrapeIdx: i, all: false});
    }
    if(!Object.values(tempObj).includes(false)){
      tempObj.all = true;
    }
    setReadiness(tempObj);
  };
  
  /** Checks if the current scrapeIdx data is valid to send to the API.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   * - all (Boolean): decides if all scrapes should be checked or only a specific one
   */
  const check_ready = ({scrapeIdx, all} : {scrapeIdx : number, all : boolean}) => {

    console.log("accesed")

    if(scraperInfos?.all === undefined || scraperInfos?.all === null){return;}
    
    if(all){

      const allScrapeIdx = Object.keys(scraperInfos?.all);

      for(const idx of allScrapeIdx){

        // recursion
        if(!check_ready({scrapeIdx: Number(idx), all: false})){
          return false;
        }
      }

      return true;
    }   
    else if(!all){

      if(scraperInfos?.all[scrapeIdx] === undefined ||window.document.getElementById(`global-param-wait-time-input-${scrapeIdx}`) === null){return;}

      var returnValue = true;

      let scrapeUrl = String(scraperInfos?.all?.[scrapeIdx].global_params.website_url);
      /** 
      let browserType = String(scraperInfos?.all?.[scrapeIdx].global_params.browser_type);
      const possibleBrowserTypes = ["edge", "firefox", "chrome", ""];

      if(!possibleBrowserTypes.includes(browserType.toLowerCase())){
        window.document.getElementById(`global-param-browser-type-input-${scrapeIdx}`).classList.remove("border-green-800");
        returnValue = false;
      }
      else{window.document.getElementById(`global-param-browser-type-input-${scrapeIdx}`).classList.add("border-green-800");}
      */

      if(scraperInfos?.all[scrapeIdx].loop.created){

        const loopStart = Number(scraperInfos?.all[scrapeIdx].loop.loop_start_end[0]) - 1;
        const loopEnd = Number(scraperInfos?.all[scrapeIdx].loop.loop_start_end[1]) - 1;
        const loopIterations = Number(scraperInfos?.all[scrapeIdx].loop.iterations);
        const allPossibleWorkflowIndexes = Object.keys(scraperInfos?.all[scrapeIdx].workflow);

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

        window.document.getElementById(`global-param-wait-time-input-${scrapeIdx}`).classList.remove("border-green-800");
        returnValue = false;
      }
      else{
        window.document.getElementById(`global-param-wait-time-input-${scrapeIdx}`).classList.add("border-green-800");
      }

      if((scrapeUrl.includes("https://") && scrapeUrl.length > 13 && scrapeUrl.includes(".") && !scrapeUrl.includes(" "))){

        window.document.getElementById(`global-param-website-url-input-${scrapeIdx}`).classList.add("border-green-800");
      }
      else{

        window.document.getElementById(`global-param-website-url-input-${scrapeIdx}`).classList.remove("border-green-800");
        returnValue = false;
      }

      // Array of keys to the values of workflow actions in the current scrape.
      let allWorkflowActionKeys = Object.keys(scraperInfos?.all[scrapeIdx].workflow);

      for(const actionIndex of allWorkflowActionKeys){

        // A workflow object always has index key and a array value, that's why we to array-indexing here.
        const action_type = scraperInfos?.all[scrapeIdx].workflow[actionIndex][0];
        const action_data = scraperInfos?.all[scrapeIdx].workflow[actionIndex][1];


        if(action_type === 'scrape-action'){

          if(window.document.getElementById(`class-input-${scrapeIdx}-${actionIndex}-container`) === null){return;}

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

          if(window.document.getElementById(`btn-selector-input-${scrapeIdx}-${actionIndex}-container`) === null){return;}

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

          if(window.document.getElementById(`input-selector-input-${scrapeIdx}-${actionIndex}-container`) === null){return;}

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
    
    setUpdate((prevUpdate) => { return (prevUpdate +1 ) % 2});

    return;
  };

  /** Rotates a element by a specified number of degrees.!!! Could be abused if different degree numbers get entered again and again, so should add a check !!!
   * PARAMS:
   * - elementId (String): Id of the html to operate on
   * - degreed (String): number of degrees to rotate by
   */
  const rotateElement = ({elementId, degrees} : {elementId : string, degrees : string}) : void => {

    const possibledegreeRotations = ["rotate-180, rotate-90, rotate-45, rotate-135, rotate-270, rotate-315"]
    let classList = window.document.getElementById(elementId).classList;

    if(classList.contains(`rotate-${degrees}`)){  classList.remove(`rotate-${degrees}`); }
    else{ classList.add(`rotate-${degrees}`); }

    return;
  };
  
  /** Resets a particular scrape to the defScrapeInfoObject through setState.
   * PARAMS:
   * - resetScrapeIdx (String): the current index in the scraperInfo.all of the scrape to be reset
   */
  const resetScrape = ({resetScrapeIdx} : {resetScrapeIdx: number}) : void => {

    const confirmation = confirm("Do you want to reset the current scrape?");

    if(!confirmation){return; }

    let scraperInfoCopy = scraperInfos;

    scraperInfoCopy.all[resetScrapeIdx] = defScrapeInfoObject;

    const loopContainer = window.document.getElementById(`loop-container-${resetScrapeIdx}`)

    if(!loopContainer.classList.contains("hidden")){
      loopContainer.classList.add("hidden");
    }

    setScrapeInfos(scraperInfoCopy);
    assertReadiness()
    setUpdate((prevUpdate) => { return (prevUpdate + 1) % 2});
    
    return;
  };

  /** Deletes a particular scrape in scraperInfo.all 
   * PARAMS:
   * - deleteScrapeIdx (String): the current index in the scraperInfo.all of the scrape to be deleted
  */
  const deleteSpecificScrape = ({deleteScrapeIdx} : {deleteScrapeIdx : number}) : void => {

    const confirmation = confirm("Do you want to delete the current scrape?");

    if(!confirmation){return; }

    const allScrapeIdx = Object.keys(scraperInfos?.all);
    let scraperInfoCopy = scraperInfos;

    // intermediate storage
    let container = {};

    for(const scrapeIdx of allScrapeIdx){

      if (scrapeIdx !== String(deleteScrapeIdx)){

        // will always equal the next index that is 'empty/undefined'
        let appendScrapeIndex = Object.keys(container).length;

        container[appendScrapeIndex] = scraperInfos?.all[scrapeIdx];
      }
    }

    scraperInfoCopy.all = container;

    setScrapeInfos(scraperInfoCopy);
    assertReadiness()
    setAmountScrapes((prevAmountScrapes) => { return (prevAmountScrapes - 1) });
    
    return;
  };

  /** Deletes the last scrape in scraperInfo.all 
  */
  const deleteLastScrape = () : void => {

    let scraperInfoCopy = scraperInfos;

    // '-1' important, so it equals the last index in scraperInfo.all which is defined (computers start counting at zero)
    const lastScrapeIdx = Object.keys(scraperInfoCopy.all).length - 1; 

    delete scraperInfoCopy.all[lastScrapeIdx];

    setScrapeInfos(scraperInfoCopy);
    assertReadiness()
    setAmountScrapes((prevAmountScrapes) => { return (prevAmountScrapes - 1) });

    return;
  };

  /** Appends a scrape to scraperInfo.all 
   */
  const appendScrape = () : void => {

    let scraperInfoCopy = scraperInfos;
    const appendScrapeIdx = Object.keys(scraperInfoCopy.all).length;
    scraperInfoCopy.all[appendScrapeIdx] = defScrapeInfoObject;

    setScrapeInfos(scraperInfoCopy);
    assertReadiness()
    setAmountScrapes((prevAmountScrapes) => { return (prevAmountScrapes + 1) });

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
    assertReadiness()
    setUpdate((prevUpdate) => { return (prevUpdate +1) % 2});

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
    assertReadiness()
    setUpdate((prevUpdate) => { return (prevUpdate +1) % 2});

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
    assertReadiness()
    setUpdate((prevUpdate) => { return (prevUpdate +1) % 2});

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
    assertReadiness()
    setUpdate((prevUpdate) => { return (prevUpdate +1) % 2});

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

        setCurrentPopUpText("Iterations can be a maximum of 10 on this plan!");
        showHideElement({elementId: "alert-container"});
        setTimeout(() => {showHideElement({elementId: "alert-container"});}, 1500); 
      }

      scraperInfoCopy.all[scrapeIdx].loop.iterations = value;
    }
    else{

      const workflowLength = Object.keys(scraperInfoCopy.all[scrapeIdx].workflow).length;

      if(value > workflowLength){

        setCurrentPopUpText("There isn't an element with this Index!");
        showHideElement({elementId: "alert-container"});
        setTimeout(() => {showHideElement({elementId: "alert-container"});}, 1500);
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
    assertReadiness()
    setUpdate((prevUpdate) => {return (prevUpdate + 1) % 2});

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
    showHideElement({elementId: `loop-hr-sep-${scrapeIdx}`});

    setScrapeInfos(scraperInfoCopy);
    assertReadiness()
    setUpdate((prevUpdate) => { return ( prevUpdate + 1) % 2});

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

    delete scraperInfoCopy.all[scrapeIdx].workflow[removeIdx];

    setScrapeInfos(scraperInfoCopy);
    assertReadiness()
    setUpdate((prevUpdate) => { return (prevUpdate +1) % 2});

    return;
  };

  // sometimes doesent work why tf
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
    assertReadiness();
    setUpdate((prevUpdate) => {return (prevUpdate +1) % 2});
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
    setUpdate((prevUpdate) => { return (prevUpdate + 1) % 2}); 

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
    assertReadiness()
    setUpdate((prevUpdate) => {return (prevUpdate + 1) % 2});

    return;
  };

  const handleUndetectedParamChange = ({scrapeIdx} : {scrapeIdx : number}) => {

    let scraperInfoCopy = scraperInfos;
    const currentValue = scraperInfoCopy.all[scrapeIdx].global_params.use_undetected;

    scraperInfoCopy.all[scrapeIdx].global_params.use_undetected = !currentValue;

    // sets the amount of scrapes can be moved to a useEffect
    scraperInfoCopy.all[scrapeIdx].global_params.amount_actions_local = Object.keys(scraperInfoCopy.all[scrapeIdx].workflow).length;

    setScrapeInfos(scraperInfoCopy);
    setUpdate((prevUpdate) => {return (prevUpdate + 1) % 2});

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
    assertReadiness()
    setUpdate((prevUpdate) => {return (prevUpdate + 1) % 2});

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

    showHideElement({elementId: "overlay-section"});
    setCurrentPopUpText("Copied ID to clipboard succesfully!");
    showHideElement({elementId: "alert-container"});
    setTimeout(() => {showHideElement({elementId: "alert-container"});}, 3000);

    return;
  };

  /** Sends a POST request with scraperInfo or parts of it as the body to the API, which then runs the web-scrape-function depending on the params given in the body and
   * returns then returns the scraped data.
   * PARAMS:
   * - all (Boolean): specifies if all of scraperInfo or only a single scrape should be sent to the API
   * - scrapeIdx (String): the current index in the scraperInfo.all (only used when all=false)
    */
  const newSubmit = async ({all, scrapeIdx} : {all : boolean, scrapeIdx : number}) : Promise<void> => {

    const expectedWaitTime = calculateWaitTime({all: all, scrapeIdx: scrapeIdx})
    // prepare the user
    setLoadingOverlay(true);
    setCurrentOverlay("results");
    showHideElement({elementId: "overlay-section"});
    setExpectedLoadingTime(expectedWaitTime);

    // add Countdown

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

    setResults(runOperation.results);
    setLoadingOverlay(false);
    setCurrentOverlay("results");
    
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

          console.log("WorkflowType:", workflowType)
          console.log("WorkflowData:", workflowData)

          if(workflowType === "scrape-action"){ oneLoopTime += 1; }

          else if(workflowType === "btn-press"){ oneLoopTime += (Number(workflowData.wait_after) + 1); } // +1 because of button press

          else if(workflowType === "input-fill"){ oneLoopTime += 1; }

          else if(workflowType === "wait-time"){ oneLoopTime += Number(workflowData.time_to_wait); }

        }

        console.log("OneloopTime:", oneLoopTime)
        waitTime += (oneLoopTime * (loopIterations - 1));

        console.log("Wait time:", waitTime)
      }

      return waitTime;
    }
  };

  /** Returned jsx */
  return (
    <>
      {/** The div on the very top of the page used for 'alerts'. */}
      <div id={"alert-container"} className="flex items-center hidden justify-center fixed w-[90dvw] h-[5dvh] z-10 bg-blue-500 rounded-md left-[5dvw] top-2 opacity-75" >

        <p id={"alert-text"} className="f_black_Inter text-black" >
          {currentPopUpText}
        </p>

      </div>
      
      {/** The section containing the current overlay. Used for showing the scraped data or loading the link etc. */}
      <section id={"overlay-section"} className={"fixed top-[5dvh] left-[7.5dvw] w-[85dvw] h-auto hidden z-[15] bg-zinc-200 rounded-xl px-5 pb-5 overflow-auto opacity-100 flex flex-col items-center justify-start border-[5px] border-[blueviolet] "} >
        
        {/** Options for interacting with the overlay(closing etc...) */}
        <aside id={`dialog-ov-main-options-bar`} className="w-[100%] h-[60px] c_row_elm justify-end mt-5 gap-x-3 p-1 " >

          <button id={`close-ov-btn`} className="purple_btn " onClick={() => { showHideElement({elementId : "overlay-section"}); }} >
            Close
          </button>

        </aside>
        {
          /** Checks if the data is still loading and if yess display a loader with some metadata. */
          loadingOverlay ? 
            (
              <div className="c_col_elm w-[90%] h-full justify-center" >
                
                <ClockLoader size={150} speedMultiplier={2} />
                <h3 className="head_text" > Getting your data... </h3>
                <p className="text-[18px] font-[600] " > 
                  Expected Runtime: { expectedLoadingTime } 

                </p>

              </div>
            )
            :
            (
              /** Checks which overlay is the currenty used one and shows the right one. */
              currentOverlay === 'results' ? 
                (
                  // for scraped data
                  <ResultOverlay results={results} saveAbility={false} />
                )
                :
                (
                    // for loading the link or other things
                  <DialogOverlay results={results} load={loadScrape} type={currentOverlay} generateExport={generateExport} />
                )
            )
        }

      </section>
      
      {/** Options for the whole page. */}
      <aside id={"main-options-bar"} className="new_options_nav c_row_elm" >

        <div className="w-[50%] h-auto c_row_elm gap-x-5 justify-start" >
          {
            // checks if the scrape is valid, so that the 'Scrape' is either hidden or shown, depending on the validity
            readiness.all ? 
              (
                <button id={`generate-export-btn`} className="purple_btn" onClick={() => { setLoadingOverlay(false); setCurrentOverlay("exportScrape"); showHideElement({elementId: "overlay-section"}) }} >
                  Save
                </button>
              )
              :
              (
                <button id={`generate-export-btn`} className="purple_btn brightness-75 cursor-not-allowed " disabled >
                  Save
                </button>
              )
          }

          <button id={`load-export-btn`} className="purple_btn" 
            onClick={() => { setLoadingOverlay(false); setCurrentOverlay("loadScrape"); showHideElement({elementId: 'overlay-section'}); }} >
            Load export
          </button>


          {
            /** Will disable the button if results are none. */
            results[0].scrape_runs[0].length !== 0 ? 
              (
                <button className="purple_btn " onClick={() => {setCurrentOverlay(() => {return 'results'}); showHideElement({elementId: 'overlay-section'})}} 
                  id={"show-result-overlay-btn"}
                  >
                  Show data
                </button>
              )
              :
              (
                <button className="purple_btn brightness-75 cursor-not-allowed" disabled
                  id={"show-result-overlay-btn_disabled"}
                  >
                  Show data
                </button>
              )
          }
        </div>
          
        <div className={"w-[50%] h-auto c_row_elm gap-x-5 justify-end"} >
          {
            /** Checks if all scrapes are ready and shows/hides the 'Scrape all' button depending on it. */
            readiness.all ? 
              (
                <button className="purple_btn" onClick={() => { newSubmit({all: true, scrapeIdx: null}); }}
                  id={"start-all-scrapes-btn"} 
                >
                  Scrape all
                </button>
              ) 
              : 
              (
                <button className="purple_btn brightness-75 cursor-not-allowed" disabled
                  id={"start-all-scrapes-btn_disabled"} >
                  Scrape all
                </button>
              )
          }

          {
            /** Checks if the amount of scrapes is bigger than one and shows/hides the 'Remove scrape' btn depending on it, so that there always is at least one scrape. */
            amountScrapes > 1 ? 
              (
                <button className="purple_btn" onClick={() => { deleteLastScrape(); }}
                  id={"remove-last-scrape-sec"}>
                  - Scrape
                </button>
              )
              :
              (
                <button className="purple_btn brightness-75 cursor-not-allowed" disabled
                  id={"remove-last-scrape-sec_disabled"}>
                  - Scrape
                </button>
              ) 
          }

          <button className="purple_btn" onClick={() => { appendScrape(); }}
            id={"add-new-scrape-sec"}>
            + Scrape
          </button>
        </div>

        

      </aside>
      
      {/** Contains all individual scrapes. */}
      <div id={"all-scape-sec-container"} className="c_col_elm overflow-auto max-h-[150dvh] p-5 mt-5 scale-x-[-1] h-full gap-y-10 w-[calc(90%+40px)] " >
        
        {   
          Array.from(Array(amountScrapes).keys()).map((index) => {

            return(
              scraperInfos?.all[index] !== undefined &&
                (
                  /** The actual scrape. */
                  <section key={`scrape-sec-${index}`} id={`scrape-sec-${index}`} className='new_scrape_sec c_col_elm ' > 
                    
                    {/** Options for the current scrape like delete, reset etc.. */}
                    <aside id={`scrape-sec-options-bar-${index}`} className="new_scrape_info_options c_row_elm" >

                      <div className="c_row_elm gap-x-2" id={"validation-conatainer"} >

                        <h3 className="font-inter text-[20px] "  >

                          {`Scrape ${index + 1}:` /** Because index starts at 0 */}

                        </h3>

                        {
                          // Visual clue showing wether the scrape is valid to submit or not.
                          readiness[index] ? 
                            (
                              <>
                                <h3 className="font-inter text-[20px] text-[green]" >
                                  VALID
                                </h3>

                                <Image width={40} height={40} src="/assets/icons/tick_g.svg" alt="valid tick" />
                              </>
                            ) 
                            :
                            (
                              <>
                                <h3 className="font-inter text-[20px] text-[red]" >
                                  INVALID
                                </h3>

                                <Image width={40} height={40} src="/assets/icons/cross_r.svg" alt="invalid cross" />
                              </>
                            )
                        }

                      </div>

                      <div id={`scrape-options-conatiner-${index}`} className="c_row_elm justify-end gap-x-2" >

                        <div className="c_col_elm justify-center h-[60px] w-fit " >

                          {
                            scraperInfos.all[index].global_params.use_undetected ?
                              (
                                <Image id={`undetected-icon-${index}`} 
                                  src={"assets/icons/undetected_icon.svg"} 
                                  alt="use undetected mode" className="cursor-pointer brightness-100" 
                                  width={48} height={48} 
                                  onClick={(e) => { handleUndetectedParamChange({ scrapeIdx: index }); }} 
                                />
                              )
                              :
                              (
                                <Image id={`undetected-icon-${index}`} 
                                  src={"assets/icons/undetected_icon.svg"} 
                                  alt="use undetected mode" className="cursor-pointer brightness-50" 
                                  width={48} height={48} 
                                  onClick={(e) => { handleUndetectedParamChange({ scrapeIdx: index }); }} 
                                />
                              )
                          }
                          

                        </div>

                        {
                          // Checks if the current scrape is valid to submit 
                          readiness[index] ? 
                            (
                              <button id={"start-scrape-btn"} className="purple_btn" onClick={() => { newSubmit({all: false, scrapeIdx: index}); }} >
                                Submit
                              </button>
                            )
                            :
                            (
                              <button id={"start-scrape-btn_disabled"} className="purple_btn brightness-75 cursor-not-allowed" disabled >
                                Submit
                              </button>
                            )
                        }

                        {
                          /** So there is always at least one scrape */
                          amountScrapes > 1 ?
                            (
                              <Image id={"delete-scrape-btn"} src='/assets/icons/trash_can.svg' onClick={() => { deleteSpecificScrape({deleteScrapeIdx: index}); }} 
                                width={50} height={50} alt="delete button" className="cursor-pointer" /> 
                            )
                            :
                            (
                              <Image id={"delete-scrape-btn_disabled"} src='/assets/icons/trash_can.svg' 
                                width={50} height={50} alt="delete button" className="opacity-50 cursor-not-allowed" />
                            )
                        }

                        {/** Reset scrape icon.*/}
                        <Image id={"reset-scrape-icon"} onClick={() => { resetScrape({resetScrapeIdx: index}); }} src='/assets/icons/reset.svg' 
                          width={46} height={46} alt="reset button" className="cursor-pointer" />
                        
                        {/** Toggle form visibility icon.*/}
                        <Image 
                          className="cursor-pointer rotate-180 " width={50} height={50} 
                          src="/assets/icons/updownarrow.svg" 
                          id={`hide-show-form-icon-${index}`}  
                          alt={"hide form icon"}
                          onClick={() => { showHideElement({elementId: `scrape-sec-form-${index}`}); rotateElement({elementId: `hide-show-form-icon-${index}`, degrees: "180"}); }}
                        />
                            
                      </div>

                    </aside>

                    {/** The form element with all inputs, workflows and editing capabilities. */}
                    <form id={`scrape-sec-form-${index}`} className="flex flex-col items-center h-full w-full justify-around gap-y-2 p-1 mb-2" >

                      {/** Contains tooltips for the inputs of url, wait-time etc.. */}
                      <div id={`global-params-tooltips-container-${index}`} className="new_part_of_form justify-evenly c_row_elm mt-2" >

                        
                        <div className=" w-[50%] c_row_elm text-start justify-center h-10 gap-x-1 " > 

                          <span id={`url-tooltip-${index}`} 
                            className={"tooltip hidden top-[-18px] "} >
                            
                            <span className="tooltip_text_main" >Please prefix your url with 'https://'. Also, due to security concerns, ONLY https Urls are allowed.</span>
                            <br />
                            <span className="tooltip_option_text" >OPTIONS:</span> any valid HTTPS url (ONLY SSL certified domains are allowed)
                            
                          </span>

                          <p className=" font-[Arial] text-[20px] font-[500]" >
                            Url<span className="text-[purple]" >*</span>
                          </p>

                          <Image src='/assets/icons/info.svg' alt='url tooltip icon' width={20} height={20} 
                            onMouseOver={() => { showHideElement({elementId: `url-tooltip-${index}`}); }}
                            onMouseOut={() => { showHideElement({elementId: `url-tooltip-${index}`}); }} 
                              
                          />

                        </div>

                        <div className=" w-[20%] c_row_elm text-start justify-center h-10 gap-x-1" >

                          <span id={`glob-wait-time-tooltip-${index}`} 
                            className={"tooltip hidden top-[-18px]"} >
                            
                            <span className="tooltip_text_main" >(OPTIONAL) Amount of time the programm waits on page load in SECONDS.</span>
                            <br />
                            <span className="tooltip_option_text" >OPTIONS:</span> any positive integer less than 50 (default is 10)
                            
                          </span> 

                          <p className="font-[Arial] text-[20px] font-[500]" >
                            Page load time
                          </p>

                          <Image src='/assets/icons/info.svg' alt='page load time tooltip icon' width={20} height={20}                               
                            onMouseOver={() => { showHideElement({elementId: `glob-wait-time-tooltip-${index}`}); }}
                            onMouseOut={() => { showHideElement({elementId: `glob-wait-time-tooltip-${index}`}); }}
                          />

                        </div>

                        {/**
                         * <div className=" w-[20%] c_row_elm text-start justify-center h-10 gap-x-1">

                          <span id={`browser-type-tooltip-${index}`} 
                            className={"tooltip hidden top-[-18px] right-3 "} >
                            
                            <span className="tooltip_text_main" >(OPTIONAL) Specifies the browser-type used in the execution of the programm.</span>
                            <br />
                            <span className="tooltip_option_text" >OPTIONS:</span> 'Firefox', 'Edge', 'Chrome' (default is Edge)
                            
                          </span> 

                          <p className="font-[Arial] text-[20px] font-[500]" >
                            Browser type
                          </p>

                          <Image src='/assets/icons/info.svg' alt='browser type tooltip icon' width={20} height={20}  
                            onMouseOver={() => { showHideElement({elementId: `browser-type-tooltip-${index}`}); }}
                            onMouseOut={() => { showHideElement({elementId: `browser-type-tooltip-${index}`}); }}
                          />

                        </div>
                         */}

                      </div>
                      
                      {/** Contains the input elements for url, wait-time etc..  */}
                      <div id={`global-params-inputs-container-${index}`} className="new_part_of_form justify-evenly c_row_elm mt-1" >

                        {/** WEBSITE URL INPUT */}
                        <input type="text" 
                          className="rounded-xl border-2 border-black text-[16px] pl-2 justify-center h-10 bg-zinc-200 w-[50%] text-start " 
                          required 
                          placeholder="https://example.com"
                          value={scraperInfos?.all?.[index].global_params.website_url}
                          id={`global-param-website-url-input-${index}`} 
                          onChange={(e) => { handleGlobalParamChange({scrapeIdx: index, paramName: "website_url", value: e.target.value}); }} 
                        />

                        {/** WAIT TIME INPUT */}
                        <input type="number" 
                          min={5}
                          className="rounded-xl border-2 border-black text-[16px] pl-2 justify-center h-10 bg-zinc-200 w-[20%] text-start pr-1 " 
                          required 
                          value={scraperInfos?.all?.[index].global_params.wait_time}
                          id={`global-param-wait-time-input-${index}`} 
                          onChange={(e) => { handleGlobalParamChange({scrapeIdx: index, paramName: "wait_time", value: Number(e.target.value)}); }} 
                        />

                        {/** BROWSER INPUT */}
                        {/**
                         * <input type="text" 
                          className="rounded-xl border-2 border-black text-[16px] pl-2 justify-center h-10 bg-zinc-200 w-[20%] text-start " 
                          required 
                          placeholder="Edge"
                          value={scraperInfos?.all?.[index].global_params.browser_type}
                          id={`global-param-browser-type-input-${index}`} 
                          onChange={(e) => { handleGlobalParamChange({scrapeIdx: index, paramName: "browser_type", value: e.target.value}); }} 
                        />
                         */}
                        
                          
                      </div>
                      
                      {/** kinda random but in my opinion neccesary hr */}
                      <hr className="w-[98%] h-[2px] bg-black " />

                      {/** Contains the workflow options (adding one removing one...). */}
                      <div id={`workflow-options-container-${index}`} className="c_row_elm gap-x-3 pb-5 "  >

                          {
                            // So that there is always at least one workflow element.
                            scraperInfos?.all[index] !== undefined && scraperInfos?.all[index] !== null  && Object.keys(scraperInfos?.all[index].workflow).length > 1 ?
                              (

                                <button id={"remove-workflow-btn"} className="row_options_button border-[#500000] bg-[#F14B4B]"  
                                  onClick={(e) => { e.preventDefault(); removeLastWorkflow({scrapeIdx: index}); }} >
                                  - last Action
                                </button>
                              )
                              :
                              (
                                <button id={"remove-row-btn_disabled"} disabled className="row_options_button brightness-75 border-black bg-zinc-200 cursor-not-allowed " >
                                  - last Action
                                </button>
                              )
                          }

                          <button id={"add-scrape-action-workflow-btn"} className="row_options_button border-[#004600] bg-green-400 " 
                            onClick={(e) => { e.preventDefault(); appendScrapeActionWorkflow({scrapeIdx: index}); }} >
                            + Scrape
                          </button>

                          <button id={"add-btn-press-workflow-btn"} className="row_options_button border-[#004600] bg-green-400 " 
                            onClick={(e) => { e.preventDefault(); appendBtnPressWorkflow({scrapeIdx: index}); }} >
                            + Button-press
                          </button>

                          <button id={"add-input-fill-workflow-btn"} className="row_options_button border-[#004600] bg-green-400 " 
                            onClick={(e) => { e.preventDefault(); appendInputFillWorkflow({scrapeIdx: index}); }} >
                            + Input-fill
                          </button>

                          <button id={"add-wait-time-workflow-btn"} className="row_options_button border-[#004600] bg-green-400 " 
                            onClick={(e) => { e.preventDefault(); appendWaitTimeWorkflow({scrapeIdx: index}); }} >
                            + Wait-time
                          </button>

                          {
                            scraperInfos?.all[index].loop.created === false ?

                              (
                                <button id={"add-sample-workflow-btn"} className="row_options_button border-purple-900 bg-purple-400 min-w-[95px] " 
                                  onClick={(e) => { e.preventDefault(); createLoop({scrapeIdx: index}); showHideElement({elementId: `loop-container-${index}`}); showHideElement({elementId: `loop-hr-sep-${index}`}); }} >
                                  + Loop
                                </button>
                              )
                              :
                              (
                                <button id={"add-sample-workflow-btn"} className="row_options_button border-purple-900 bg-purple-400 min-w-[95px] " 
                                  onClick={(e) => { e.preventDefault(); showHideElement({elementId: `loop-container-${index}`}); showHideElement({elementId: `loop-hr-sep-${index}`}); setUpdate((prevUpdate) => { return ( prevUpdate + 1) % 2}); }}  >
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

                          <button id={"toggle-workflow-container-visibility"} className="row_options_button border-purple-900 bg-purple-400 min-w-[80px] " 
                            onClick={(e) => { e.preventDefault(); showHideElement({elementId: `workflow-container-${index}`}); }} >
                            {
                              // So that the button switches text depending on workflow-container-visibility
                              isElementVisible({elementId: `workflow-container-${index}`}) ? 
                                ( "Show WF" ) : ( "Hide WF" )
                            }
                          </button>

                          <button id={"add-sample-workflow-btn"} className="row_options_button border-purple-900 bg-purple-400 " 
                            onClick={(e) => { e.preventDefault(); generateSampleWorkflow({scrapeIdx: index}); }} >
                            Sample 
                          </button>

                      </div>

                      {/** Contains the loop element. */}
                      <div id={`loop-container-${index}`} className={" hidden w-[90%] h-fit mt-[-10px] flex flex-row gap-x-8 my-3 items-center relative justify-start p-2 shadow-lg rounded-lg bg-zinc-200 border-black border-2  "} >

                          <p className="text-[20px] font-[600] " >
                            {"Please, define your loop here:"}
                          </p>

                          <label className="text-[18px] h-fit w-fit c_row_elm " >  Start: 
                            
                            <input
                              type="number"
                              min={1}
                              placeholder="start index"
                              id={`loop-start-index-input-${index}`}
                              value={scraperInfos?.all[index].loop.loop_start_end[0]}
                              className={"w-[60px] rounded-xl border-2 border-black text-[16px] pl-2 justify-center h-10 bg-zinc-200 mx-2 font-[800] pr-1 "}
                              onChange={(e) => { handleLoopChange({scrapeIdx: index, paramName: "elementsStart", value: Number(e.target.value)}); }}
                            />

                            <Image
                              src='/assets/icons/start.svg'
                              alt='loop start icon'
                              width={40} height={40}
                            />
                          
                          </label>


                          <label className="text-[18px] h-fit w-fit c_row_elm " >  End: 
                            <input
                              type="number"
                              min={1}
                              placeholder="end index"
                              id={`loop-end-index-input-${index}`}
                              value={scraperInfos?.all[index].loop.loop_start_end[1]}
                              className={"w-[60px] rounded-xl border-2 border-black text-[16px] pl-2 justify-center h-10 bg-zinc-200 mx-2 font-[800] pr-1 "}
                              onChange={(e) => { handleLoopChange({scrapeIdx: index, paramName: "elementsEnd", value: Number(e.target.value)}); }}
                            />

                            <Image
                              src='/assets/icons/end.svg'
                              alt='loop start icon'
                              width={40} height={40}
                            />

                          </label>
                        
                          <label className="text-[18px] h-fit w-fit c_row_elm "  > Iterations: 
                            
                            <input
                              type="number"
                              min={2}
                              max={10}
                              className={"w-[60px] rounded-xl border-2 border-black text-[16px] pl-2 justify-center h-10 bg-zinc-200 mx-2 font-[800] pr-1 "} 
                              placeholder="Iterations"
                              value={scraperInfos?.all[index].loop.iterations}
                              onChange={(e) => { handleLoopChange({scrapeIdx: index, paramName: "iterations", value: Number(e.target.value)}); }}
                            />

                            <Image
                              src='/assets/icons/recycle.svg'
                              alt='iterations icon'
                              width={45} height={45}
                            />

                          </label>

                          <Image 
                            src={"/assets/icons/trash_can.svg"} 
                            alt="delete loop button" 
                            width={50} 
                            height={50} 
                            className="absolute right-0 cursor-pointer"
                            onClick={() => { deleteLoop({scrapeIdx: index}); }}
                             />
                        
                      </div>

                      {/** Loop hr separator */}
                      <hr id={`loop-hr-sep-${index}`} className="bg-black w-[98%] h-[2px] hidden " />
                      
                      {/** Contains all workflow actions/rows. */}
                      <div id={`workflow-actions-container-${index}`} className="rows_grid w-[100%] h-auto gap-y-1 p-2 " >
                        {
                          // shows the needed workflow
                          scraperInfos?.all?.[index] !== undefined &&
                            (
                              <>
                                { 
                                  Object.keys(scraperInfos?.all?.[index].workflow).map((rowIndex) => {

                                    return (
                                      <div id={`workflow-${rowIndex}`} className=" relative new_part_of_form justify-start c_row_elm pr-1 " key={`row-${rowIndex}`} >

                                        <h4 className="new_action_text text-start " > {`${(Number(rowIndex) + 1)}: ${(scraperInfos?.all?.[index].workflow[rowIndex][0].at(0).toUpperCase() + scraperInfos?.all?.[index].workflow[rowIndex][0].slice(1))}`}  </h4>

                                        <RowTypeComponent 
                                          showHideElement={showHideElement} 
                                          handleChange={handleNormalChange} 
                                          scraperInfos={scraperInfos} 
                                          setScrapeInfos={setScrapeInfos} 
                                          setUpdate={setUpdate}
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
                      
                      {/** Contains all workflows, visualized in a chronological grid. */}
                      <div id={`workflow-container-${index}`} className="hidden p-3 border-[black] border-2 rounded-md min-h-[40px] h-auto w-full mt-8" >

                        <div id={`workflow-content-container-${index}`} className="workflow_grid" >

                        
                          {
                            [...Object.keys(scraperInfos?.all[index].workflow)].map((workflowIndex) => {

                              return (


                                  <WorkflowElement
                                    key={workflowIndex} 
                                    scraperInfos={scraperInfos} 
                                    setUpdate={setUpdate} 
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
                )
            );
          })
        }
      </div>
    </>
  );
};

export default WSForm;
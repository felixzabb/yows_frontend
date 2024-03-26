"use client";

import Image from "next/image";
import Link from "next/link";
import Tooltip from "@components/custom/Tooltip";
import ChangeDataInterpretationDropdown from "@components/dropdowns/ChangeDataInterpretationDropdown";
import { PossibleCssSelectorDataTypes, PossibleUrlDataTypes, ScraperInfos } from "@custom-types";
import { rotateElement, showHideElement } from "@utils/elementFunction";


const ScrapeParamsComponent = ({ scrapeIdx, scraperInfos, handleUrlTypeChange, handleGlobalParamChange, deleteLoop, urlValid} : 
  { 
    scrapeIdx : number
    scraperInfos : ScraperInfos
    handleUrlTypeChange : ({id, scrapeIdx} : { id: PossibleCssSelectorDataTypes | PossibleUrlDataTypes, scrapeIdx? : number }) => void | null
    handleGlobalParamChange : ({scrapeIdx, paramName, value} : {scrapeIdx: number, paramName: string, value: string | boolean}) => void | null
    deleteLoop : ({ scrapeIdx } : {scrapeIdx : number}) => void | null
    urlValid: boolean
  }) => {


  return (
    <div id={`global-params-container-${scrapeIdx}`} className=" flex flex-col items-start min-h-[40px] h-auto gap-y-1 w-full justify-evenly mt-1 p-2" >

      <div id={`execution-type-param-container-${scrapeIdx}`} className="w-full h-auto flex flex-col items-center " >

        <h3 id={`execution-type-param-heading-${scrapeIdx}`} className="w-full h-auto text-start pb-2 text-[18px] font-[500]" >
          Execution type <Link href="/docs#scrape-execution-type" rel="noopener noreferrer" target="_blank" className="text-[12px] underline text-blue-500" > learn more </Link>
        </h3>

        <div id={`execution-type-param-wrapper-${scrapeIdx}`} className="w-full h-auto flex flex-row items-center justify-between gap-x-4" >
          <div className="flex flex-row items-center px-2 border border-gray-600 rounded-md dark:border-gray-300 w-[48%] cursor-pointer relative">
            <input 
              id={`execution-type-sequential-${scrapeIdx}`}
              defaultChecked
              type="radio" 
              value="" 
              name={`execution-type-${scrapeIdx}`} 
              className="focus:outline-none w-8 h-8 cursor-pointer"
              onChange={(e) => { handleGlobalParamChange({scrapeIdx: scrapeIdx, paramName: "exec_type", value: "sequential"}); }}
            />
            <label htmlFor={`execution-type-sequential-${scrapeIdx}`} className="w-full py-2 text-[16px] font-[600] cursor-pointer">
              Sequential
              <div  id={`execution-type-sequential-tooltip-container-${scrapeIdx}`} className="group absolute right-1 -top-[5px] flex items-center justify-center min-w-[30px] h-full mt-[6px]" >

                <div id={`execution-type-sequential-tooltip-wrapper-${scrapeIdx}`} className="h-auto w-auto hidden group-hover:flex " >
                  <Tooltip yOrientation="bottom" content={"This will execute all actions sequentially for every provided URL, meaning every action will be executed for every URL."} /> 
                </div>

                <Image id={`execution-type-sequential-tooltip-toggle-${scrapeIdx}`} src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} />

              </div>
            </label>
          </div>

          <div className="flex flex-row items-center px-2 border border-gray-600 rounded-md dark:border-gray-300 w-[48%] relative">
            <input 
              id={`execution-type-looping-${scrapeIdx}`} 
              type="radio"
              value=""
              name={`execution-type-${scrapeIdx}`} 
              className="focus:outline-none w-8 h-8 cursor-pointer"
              onChange={(e) => { deleteLoop({scrapeIdx : scrapeIdx}); handleGlobalParamChange({scrapeIdx: scrapeIdx, paramName: "exec_type", value: "looping"}); }}
            />
            <label htmlFor={`execution-type-looping-${scrapeIdx}`} className="w-full py-2 text-[16px] font-[600] cursor-pointer">
              Looping
              <div  id={`execution-type-looping-tooltip-container-${scrapeIdx}`} className="group absolute right-1 -top-[5px] flex items-center justify-center min-w-[30px] h-full mt-[6px]" >

                <div id={`execution-type-looping-tooltip-wrapper-${scrapeIdx}`} className="h-auto w-auto hidden group-hover:flex " >
                  <Tooltip yOrientation="bottom" content={"This will execute all actions in a looping manner, meaning the first action will be executed for every URL."} /> 
                </div>

                <Image id={`execution-type-looping-tooltip-toggle-${scrapeIdx}`} src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} />

              </div>
            </label>
          </div>
        </div>

      </div>

      <button 
        onClick={(e) => { 
          e.preventDefault(); 
          showHideElement({elementId: `advanced-options-container-${scrapeIdx}`}); 
          rotateElement({elementId: `toggle-advanced-options-visibility-${scrapeIdx}`, degrees: "180"});
        }} 
        className="text-[14px] flex flex-row gap-x-1 items-center font-[400] ml-2 " >
        Advanced options
        <Image
          id={`toggle-advanced-options-visibility-${scrapeIdx}`}
          src={"/assets/icons/generic/small_arrow.svg"}
          alt={"show/hide advanced options"}
          className="-mb-[3px]"
          width={20}
          height={20}
        />
      </button>
      <div id={`advanced-options-container-${scrapeIdx}`} className="hidden flex flex-row items-start justify-start p-2 gap-x-2 w-full h-auto min-h-[60px]" >

        
        <label className="w-auto h-auto flex flex-row items-center gap-x-2" >
          <input
            type="checkbox"
            id={`swallow-errors-${scrapeIdx}`}
            className="h-4 w-4 rounded-lg"
            onChange={(e) => { handleGlobalParamChange({scrapeIdx: scrapeIdx, paramName: "swallow_errors", value: e.target.checked}) }}
          />
          Swallow errors
        </label>
      </div>

      <hr id={`global-params-execType/url-separator-${scrapeIdx}`} className="w-[98%] h-[2px] my-1 bg-black " />

      <div id={`browser-param-container-${scrapeIdx}`} className="w-full h-auto flex flex-col items-start gap-y-1 " >

        <h3 id={`browser-param-heading-${scrapeIdx}`} className="text-[18px] font-[600] w-[70px] text-start" >Browser</h3>
            
        <div id={`browser-param-wrapper-${scrapeIdx}`} className="relative flex flex-row items-center justify-between w-full h-[40px] gap-x-4" >

          {
            ["edge", "chrome", "firefox", "safari"].map((browserType) => (

              <div key={browserType} className="flex flex-row items-center px-1 border border-gray-600 rounded-md dark:border-gray-300 w-[18%] cursor-pointer relative">
                <input 
                  id={`browser-${browserType}-${scrapeIdx}`}
                  defaultChecked={browserType === "edge"}
                  type="radio" 
                  value="" 
                  name={`browser-param-${scrapeIdx}`} 
                  className="focus:outline-none w-4 h-4 cursor-pointer"
                  onChange={() => { handleGlobalParamChange({scrapeIdx: scrapeIdx, paramName: "browser_type", value: browserType}); }}
                />
                <label htmlFor={`browser-${browserType}-${scrapeIdx}`} className="w-full py-1 text-[16px] font-[500] cursor-pointer">
                  {browserType}
                </label>
              </div>

            ))
          }

        </div>

      </div>

      <div id={`url-param-container-${scrapeIdx}`} className="w-full h-auto flex flex-col items-start gap-y-1" >
        
        <div className="flex flex-row gap-x-1 w-full relative" >
          <h3 id={`url-param-heading-${scrapeIdx}`} className="text-[16px] font-[600] w-auto text-start " >URLs</h3>

          <div  id={`url-param-tooltip-container-${scrapeIdx}`} className="relative group flex items-center mt-[2px]" >

            <Tooltip xOrientation="light" yOrientation="bottom" content={"Any valid URL. Must be https."} /> 

            <Image id={`url-param-tooltip-toggle-${scrapeIdx}`} src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={16} height={16} />

          </div>

          <div className="absolute right-1 top-0" >
            <ChangeDataInterpretationDropdown
              thingToClick={
                <Image
                  id={`url-data-types-icon-${scrapeIdx}`}
                  alt="url data type options"
                  src={"/assets/icons/generic/3_dots.svg"}
                  className="cursor-pointer"
                  height={30}
                  width={30}
                />
              }
              handleTypeSelection={handleUrlTypeChange}
              scrapeIdx={scrapeIdx}
              options={[{name : "As TEXT", id: "text"}, {name : "As CSV", id: "csv"}, {name : "As JSON-array", id: "json"}]}
            />
          </div>

        </div>

        {
          scraperInfos?.all[scrapeIdx].scrape_params.url_as !== "text" ?
            (
              <textarea
                required 
                placeholder="https://example.com"
                value={scraperInfos?.all[scrapeIdx].scrape_params.website_url}
                id={`url-param-${scrapeIdx}`} 
                className={`text-[16px] px-2 min-h-[40px] h-min pt-1 w-full break-words border-2 text-start rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg  ${
                  scraperInfos.all[scrapeIdx].scrape_params.website_url === "" ? "border-gray-600 dark:border-gray-300" : (urlValid ? "border-green-500" : "border-red-500")
                } `}
                onChange={(e) => { handleGlobalParamChange({scrapeIdx: scrapeIdx, paramName: "website_url", value: e.target.value}); }} 
              />
            )
            :
            (
              <input type="text"
                required 
                placeholder="https://example.com"
                value={scraperInfos?.all[scrapeIdx].scrape_params.website_url}
                id={`url-param-${scrapeIdx}`} 
                className={`text-[16px] pl-2 h-[40px] w-full text-start pr-2 rounded-lg border-2 bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg ${
                  scraperInfos.all[scrapeIdx].scrape_params.website_url === "" ? "border-gray-600 dark:border-gray-300" : (urlValid ? "border-green-500" : "border-red-500")
                }`}
                onChange={(e) => { handleGlobalParamChange({scrapeIdx: scrapeIdx, paramName: "website_url", value: e.target.value}); }} 
              />
            )
        }
      </div>

      

    </div>
  );
};

export default ScrapeParamsComponent;
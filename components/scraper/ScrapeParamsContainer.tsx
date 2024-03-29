"use client";

import Image from "next/image";
import Link from "next/link";
import Tooltip from "@components/custom/Tooltip";
import ChangeDataTypeDropdown from "@components/dropdowns/ChangeDataTypeDropdown";
import { rotateElement, showHideElement } from "@utils/htmlAbstractions";
import { validateUrl } from "@utils/customValidation";
import ScrapeParamsJsonEditor from "@components/codeEditors/ScrapeParamsJsonEditor";


const ScrapeParamsContainer = ({ scrapeIdx, scraper, handleScrapeParamsChange, resetLoopByIndex } : 
  { 
    scrapeIdx : number
    scraper : ScraperData
    handleScrapeParamsChange : ({ scrapeIdx, paramName, value } : { scrapeIdx : number, paramName : string, value : string | string[] | number | boolean }) => void
    resetLoopByIndex : ({ scrapeIdx } : { scrapeIdx : number }) => void | null
  }) => {
  
  const handleUrlTypeChange = ({ type } : { type: string} ) : void => {
    handleScrapeParamsChange({ scrapeIdx: scrapeIdx, paramName: "url_as", value: type });
  };

  return (
    <div id={`global-params-container-${scrapeIdx}`} className=" flex flex-col items-start min-h-[40px] h-auto gap-y-1 w-full justify-evenly mt-1 p-2" >

      <div className="w-full h-auto flex flex-col items-center " >

        <h3 className="w-full h-auto text-start pb-2 text-[18px] font-[500]" >
          Execution type <Link href="/docs#scrape-execution-type" rel="noopener noreferrer" target="_blank" className="text-[12px] underline text-blue-500" > learn more </Link>
        </h3>

        <div className="w-full h-auto flex flex-row items-center justify-between gap-x-4" >

          <div className="flex flex-row items-center px-2 border border-gray-600 rounded-md dark:border-gray-300 w-[48%] cursor-pointer">

            <input type="radio"
              id={`execution-type-sequential-${scrapeIdx}`}
              defaultChecked
              value="" 
              name={`execution-type-${scrapeIdx}`} 
              className="focus:outline-none w-8 h-8 "
              onChange={(e) => { handleScrapeParamsChange({ scrapeIdx: scrapeIdx, paramName: "exec_type", value: "sequential" }); }}
            />

            <label htmlFor={`execution-type-sequential-${scrapeIdx}`} className="w-full relative py-2 text-[16px] font-[600] text-center ">
              
              Sequential

              <div className="group absolute right-1 -top-[5px] flex items-center justify-center min-w-[30px] h-full mt-[6px]" >

                <Tooltip yOrientation="bottom" content={"This will execute all actions sequentially for every provided URL, meaning every action will be executed for every URL."} /> 

                <Image 
                  src='/assets/icons/generic/tooltip_purple.svg' 
                  alt='Tooltip toggle' 
                  width={26} height={26} 
                />

              </div>

            </label>

          </div>

          <div className="flex flex-row items-center px-2 border border-gray-600 rounded-md dark:border-gray-300 w-[48%] cursor-pointer">

            <input 
              id={`execution-type-looping-${scrapeIdx}`} 
              type="radio"
              value=""
              name={`execution-type-${scrapeIdx}`} 
              className="focus:outline-none w-8 h-8"
              onChange={(e) => { resetLoopByIndex({ scrapeIdx : scrapeIdx }); handleScrapeParamsChange({ scrapeIdx: scrapeIdx, paramName: "exec_type", value: "looping" }); }}
            />

            <label htmlFor={`execution-type-looping-${scrapeIdx}`} className="w-full py-2 text-[16px] font-[600] text-center relative">
              
              Looping

              <div className="group absolute right-1 -top-[5px] flex items-center justify-center min-w-[30px] h-full mt-[6px]" >

                <Tooltip yOrientation="bottom" content={"This will execute all actions in a looping manner, meaning the first action will be executed for every URL."} /> 

                <Image 
                  src='/assets/icons/generic/tooltip_purple.svg' 
                  alt='Tooltip toggle' 
                  width={26} height={26} 
                />

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
        className="text-[14px] flex flex-row gap-x-1 items-center font-[400] " 
      >
        Advanced options

        <Image
          src={"/assets/icons/generic/small_arrow.svg"}
          alt={"Toggle advanced options"}
          className="-mb-[3px]"
          width={20} height={20}
        />

      </button>

      <div className="hidden flex flex-col items-start justify-start p-1 gap-x-2 w-full h-auto min-h-[60px]" >

        <div className="w-full h-auto flex flex-row gap-x-2" >

          <label className="w-auto h-auto flex flex-row items-center gap-x-2 text-[16px] font-[500]" >
            <input
              type="checkbox"
              id={`swallow-errors-${scrapeIdx}`}
              className="h-4 w-4 rounded-lg"
              onChange={(e) => { handleScrapeParamsChange({ scrapeIdx: scrapeIdx, paramName: "swallow_errors", value: e.target.checked }); }}
            />
            Swallow errors
          </label>

        </div>
        
        <div className="w-full h-auto flex flex-row items-center gap-x-1 " >

          <h3 className="text-[16px] font-[600] w-[70px] text-start" >Browser</h3>
              
          <div className="relative flex flex-row items-center justify-end w-full h-[40px] gap-x-4" >

            {
              ["Chrome", "Edge", "Firefox", "Safari"].map((browserType) => (

                <div key={browserType} className="flex flex-row items-center  px-1 border border-gray-600 rounded-md dark:border-gray-300 w-[18%] cursor-pointer">
                  <input 
                    id={`browser-${browserType}-${scrapeIdx}`}
                    defaultChecked={browserType === "Chrome"}
                    type="radio" 
                    value="" 
                    name={`browser-param-${scrapeIdx}`} 
                    className="focus:outline-none w-3 h-3"
                    onChange={() => { handleScrapeParamsChange({ scrapeIdx: scrapeIdx, paramName: "browser", value: browserType.toLowerCase() }); }}
                  />
                  <label htmlFor={`browser-${browserType}-${scrapeIdx}`} className="w-full text-center text-[16px] font-[400]">
                    {browserType}
                  </label>
                </div>
              ))
            }

          </div>

        </div>
      </div>

      <hr className="w-[100%] h-[2px] my-1 bg-black " />

      <div className="w-full h-auto flex flex-col items-start gap-y-1" >
        
        <div className="flex flex-row gap-x-1 w-full relative" >

          <h3 className="text-[16px] font-[600] w-auto text-start " >URLs</h3>

          <div className="relative group flex items-center mt-[2px]" >

            <Tooltip xOrientation="light" yOrientation="bottom" content={"Any valid URL. Must be https."} /> 

            <Image 
              src='/assets/icons/generic/tooltip_purple.svg' 
              alt='Url tooltip toggle' 
              width={16} height={16} 
            />

          </div>

          <div className="absolute right-1 top-0" >

            <ChangeDataTypeDropdown
              thingToClick={
                <Image
                  alt="URL data type options"
                  src={"/assets/icons/generic/3_dots.svg"}
                  height={30} width={30}
                />
              }
              handleTypeChange={handleUrlTypeChange}
            />

          </div>

        </div>

        {
          [scraper?.scrapes[scrapeIdx].scrape_params.url_as].map((urlAs) => {
            
            const urlValue = scraper?.scrapes[scrapeIdx].scrape_params.url;
            const urlValid = validateUrl({ input: urlValue, as: urlAs });

            if(urlAs === "json"){

              return (
                <ScrapeParamsJsonEditor 
                  key={`url-param-${urlAs}-${scrapeIdx}`} 
                  scraper={scraper} 
                  scrapeIdx={scrapeIdx} 
                  handleScrapeParamsChange={handleScrapeParamsChange}
                  paramName="url"
                  valid={urlValid}
                />
              )
            }
            else if(urlAs === "csv"){
              
              return (
                <textarea required
                  key={`url-param-${urlAs}-${scrapeIdx}`}
                  placeholder="https://example.com"
                  value={urlValue}
                  className={`wsform_bg text-[16px] px-2 rounded-lg min-h-[40px] py-1 h-fit text-start border-2 w-full ${ urlValue === "" ? "action_neutral" : (urlValid ? "action_valid" : "action_invalid")}`}
                  onChange={(e) => { handleScrapeParamsChange({ scrapeIdx: scrapeIdx, paramName: "url", value: e.target.value }); }}
                />
              )
            }
            else if(urlAs === "text"){
              return(
                <input type="text"
                  key={`url-param-${urlAs}-${scrapeIdx}`}
                  required
                  placeholder="https://example.com"
                  value={urlValue}
                  className={`wsform_bg text-[16px] px-2 rounded-lg min-h-[40px] py-1 h-fit text-start border-2 w-full ${ urlValue === "" ? "action_neutral" : (urlValid ? "action_valid" : "action_invalid")}`}
                  onChange={(e) => { handleScrapeParamsChange({ scrapeIdx: scrapeIdx, paramName: "url", value: e.target.value }); }}
                />
              ); 
            }
          })
        }
      </div>
      
    </div>
  );
};

export default ScrapeParamsContainer;
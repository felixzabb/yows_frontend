"use client";

import Image from "next/image";
import { useState } from "react";
import { ScraperInfos } from "@custom-types";
import PreviewWorkflowElement from "./PreviewWorkflowType";
import PreviewWorkflowAction from "./PreviewWorkflowAction";
import { isElementVisible } from "@utils/elementFunction";
import { showHideElement, rotateElement } from "@utils/elementFunction";

const WSForm =  ({previewData} : {previewData : ScraperInfos}) => {

  const amountScrapes = previewData.all.length

  return (
    <div id={"PREVIEW-wsform-all-scrapes-container"} className="flex flex-col items-center justify-start gap-y-6 p-5 mt-5 min-w-[620px] h-full max-h-[100dvh] mx-[1%] overflow-auto" >
      {   
        Array.from(Array(amountScrapes).keys()).map((index) => {

          if(!previewData?.all[index]){ return; };

          return(
            <section key={`PREVIEW-scrape-${index}`} id={`PREVIEW-scrape-${index}`} className='gap-y-2 flex flex-col items-center h-min justify-between rounded-xl w-min border-[3px] bg-header-light-bg dark:bg-header-dark-bg border-purple-500 dark:border-purple-300 shadow-[0px_0px_10px_#000000] dark:shadow-[0px_0px_10px_#FFFFFF] ' > 
              
              <aside id={`PREVIEW-scrape-options-container-${index}`} className="flex flex-row items-center justify-between min-w-[600px] p-2 w-full h-[70px] rounded-xl shadow-[0px_2px_2px_darkslateblue] bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg " >

                <div id={`PREVIEW-scrape-validity-container-${index}`} className="relative flex flex-row items-center gap-x-2"  >
                  
                  <Image id={`PREVIEW-scrape-valid-${index}`} width={40} height={40} src="/assets/icons/scrape/valid.svg" alt="Scrape valid" />

                  <h3 id={`PREVIEW-scrape-index-${index}`} className="absolute left-[48px] w-max font-inter text-[18px]"  >
                    {`Scrape: ${index + 1}`}
                  </h3>

                </div>

                <div id={`PREVIEW-scrape-interactive-options-container-${index}`} className="c_row_elm justify-end gap-x-2" >

                  <Image
                    src={"/assets/icons/scrape/rocket.svg"}
                    id={`run-scrape-${index}_disabled`}
                    alt={"Run scraper (disabled)"}
                    width={40}
                    height={40}
                    className="cursor-not-allowed opacity-50"
                  />

                  <hr className="h-[38px] w-[2px] bg-gray-400 " />

                  <Image id={`delete-scrape-${index}_disabled`} src='/assets/icons/scrape/trash_can.svg' 
                          width={40} height={40} alt="delete button" className="opacity-50 cursor-not-allowed" />

                  <Image id={`reset-scrape-${index}`}  src='/assets/icons/scrape/reset.svg' 
                    width={38} height={38} alt="reset button" />
                  
                  <Image 
                    className="cursor-pointer rotate-180" width={40} height={40} 
                    src="/assets/icons/generic/updownarrow.svg" 
                    id={`toggle-scrape-visibility-${index}`}  
                    alt={"hide form icon"}
                    onClick={() => { showHideElement({elementId: `PREVIEW-scrape-form-${index}`}); rotateElement({elementId: `toggle-scrape-visibility-${index}`, degrees: "180"}); }}
                  />
                      
                </div>

              </aside>

              <form id={`PREVIEW-scrape-form-${index}`} className="px-2 min-w-[600px] flex flex-col items-center h-full w-auto justify-around gap-y-2 mb-2" >

                <div id={`global-params-container-${index}`} className=" flex flex-col items-center min-h-[40px] h-auto gap-y-1 w-full justify-evenly mt-1" >

                  <div id={`url-param-container-${index}`} className="w-full h-[44px] flex flex-row items-center gap-x-4 px-2" >
                    <h3 id={`url-param-heading-${index}`} className="text-[18px] font-[600] w-[70px] text-start " >URL</h3>
                    <div  id={`url-param-wrapper-${index}`} className="relative flex flex-row items-center w-[calc(49%+142px)] h-[40px] rounded-xl bg-purple-400 dark:bg-purple-300 mr-[6px] " >
                      <input readOnly type="text"
                        required 
                        placeholder="https://example.com"
                        value={previewData.all[index].scrape_params.website_url}
                        id={`url-param-${index}`} 
                        className='text-[16px] pl-2 h-[calc(100%-6px)] w-[calc(100%-32px)] focus:outline-none text-start pr-2 m-[3px] autofill:delay-[9999s] focus:delay-[9999s] hover:delay-[9999s] active:delay-[9999s] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark' 
                      />

                      <div  id={`url-param-tooltip-container-${index}`} className="group flex items-center justify-center min-w-[30px] h-full" >

                        <Image id={`url-param-tooltip-toggle-${index}`} src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} />

                      </div>
                    </div>
                  </div>

                  <div id={`browser-and-wait-param-container-${index}`} className="w-full h-[44px] flex flex-row items-center gap-x-4 px-2" >

                    <h3 id={`browser-param-heading-${index}`} className="text-[18px] font-[600] w-[70px] text-start" >Browser</h3>
                    <div id={`browser-param-wrapper-${index}`} className="relative flex flex-row items-center w-[calc(30%+12px)] h-[40px] rounded-xl bg-purple-400 dark:bg-purple-300 mr-[6px] " >
                      <input readOnly type="text" 
                        className='text-[16px] pl-2 h-[calc(100%-6px)] w-[calc(100%-32px)] focus:outline-none text-start pr-2 m-[3px] autofill:delay-[9999s] focus:delay-[9999s] hover:delay-[9999s] active:delay-[9999s] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark' 
                        required 
                        placeholder="Browser"
                        value={previewData.all[index].scrape_params.browser_type}
                        id={`browser-param-${index}`}
                      />

                      <div id={`browser-param-tooltip-container-${index}`} className="group flex items-center justify-center min-w-[30px] h-full" >

                        <Image id={`browser-param-tooltip-toggle-${index}`} src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} />

                      </div>
                    </div>

                  </div>
                </div>

                <hr id={`global-params-actions-separator-${index}`} className="w-[98%] h-[2px] bg-black " />

                <div id={`workflow-options-actions-container-${index}`} className="w-full h-full flex flex-row items-start gap-x-4" >

                  <div id={`workflow-options-wrapper-${index}`} className="flex flex-col items-start gap-y-1 pb-5 "  >

                      <button id={`pop-scrape-${index}_disabled`} disabled className="row_options_button brightness-50 bg-gray-300 dark:bg-gray-600 cursor-not-allowed " >
                        - last
                      </button>

                      <button id={`add-scrape-action-${index}`} className="row_options_button bg-[#003314cc]" >
                        + Scrape
                      </button>

                      <button id={`add-button-action-${index}`} className="row_options_button bg-[#003314cc] " >
                        + Button
                      </button>

                      <button id={`add-input-action-${index}`} className="row_options_button bg-[#003314cc] " >
                        + Input
                      </button>

                      <button id={`add-wait-action-${index}`} className="row_options_button bg-[#003314cc] " >
                        + Wait
                      </button>

                      {
                        previewData.all[index].loop.created === false ?

                          (
                            <button id={`create-loop-${index}`} className="row_options_button bg-purple-500 dark:bg-purple-700" >
                              + Loop
                            </button>
                          )
                          :
                          (
                            <button id={`toggle-loop-visibility-${index}`} className="row_options_button bg-purple-500 dark:bg-purple-700" >
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

                      <button id={`toggle-workflow-container-visibility-${index}`} className="row_options_button bg-purple-500 dark:bg-purple-700 min-w-[80px] " >
                        {
                          // So that the button switches text depending on workflow-container-visibility
                          isElementVisible({elementId: `workflow-container-${index}`}) ? 
                            ( "Show WF" ) : ( "Hide WF" )
                        }
                      </button>

                      <button id={`add-sample-${index}`} className="row_options_button bg-purple-500 dark:bg-purple-700"  >
                        Sample 
                      </button>

                  </div>

                  <div id={`actions-container-${index}`} className="rows_grid w-auto h-auto gap-y-1 p-2 " >
                    {
                      previewData.all[index] !== undefined &&
                        (
                          <>
                            { 
                              Array.from(previewData.all[index].workflow.keys()).map((rowIndex) => {

                                return (
                                  <div id={`action-${rowIndex}`} className="relative flex flex-row items-center justify-start pr-2 " key={`workflow-action-${rowIndex}`} >

                                    <h4 id={`action-heading-${rowIndex}`} className="text-start text-[14px] font-[Helvetica] font-[600] object-contain max-h-[40px] min-w-[80px] max-w-[80px] break-words pr-2" > {`${(Number(rowIndex) + 1)}: ${(previewData.all[index].workflow[rowIndex].type.at(0).toUpperCase() + previewData.all[index].workflow[rowIndex].type.slice(1))}`} </h4>

                                    <PreviewWorkflowAction
                                      scraperInfos={previewData}
                                      type={previewData.all[index].workflow[rowIndex][0]}
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
                        
                        <input readOnly
                          type="number"
                          min={1}
                          id={`loop-start-index-${index}`}
                          value={previewData.all[index].loop.start}
                          className={"w-full rounded-lg border-2 border-gray-600 dark:border-gray-300 text-[18px] px-1 justify-center h-10 bg-gray-300 dark:bg-gray-600 font-[700]"}
                        />

                      </div>

                      <div id="loop-end-wrapper" className="w-[50px] h-fit flex flex-col items-center " >

                        <h3 id="loop-end-heading" className="w-full text-[18px] text-center" >End: </h3>  
                        
                        <input readOnly
                          type="number"
                          min={1}
                          id={`loop-end-index-${index}`}
                          value={previewData.all[index].loop.end}
                          className={"w-full rounded-lg border-2 border-gray-600 dark:border-gray-300 text-[18px] px-1 justify-center h-10 bg-gray-300 dark:bg-gray-600 font-[700]"}
                        />

                      </div>

                      <div id="loop-iterations-wrapper" className="w-[80px] h-fit flex flex-col items-center " >

                        <h3 id="loop-iterations-header" className="w-full text-[18px] text-center" > Iterations: </h3>  
                        
                        <input readOnly
                          type="number"
                          min={2}
                          max={10}
                          id={`loop-iterations-${index}`}
                          className={"w-full rounded-lg border-2 border-gray-600 dark:border-gray-300 text-[18px] px-1 justify-center h-10 bg-gray-300 dark:bg-gray-600 font-[700]"}
                          value={previewData.all[index].loop.iterations}
                        />

                      </div>

                      <Image 
                        src={"/assets/icons/scrape/trash_can.svg"} 
                        alt="delete loop" 
                        id="delete-loop"
                        width={40} 
                        height={40} 
                        className="absolute right-2 top-2 cursor-pointer mb-[-5px]"
                        />

                    </div>
                  
                </div>

                <div id={`workflow-container-${index}`} className="hidden p-3 border-[black] border-2 rounded-md min-h-[40px] h-auto w-full mt-8" >

                  <div id={`workflow-content-wrapper-${index}`} className="workflow_grid" >

                    {
                      Array.from(previewData.all[index].workflow.keys()).map((workflowIndex) => {

                        return (

                            <PreviewWorkflowElement
                              key={workflowIndex} 
                              scraperInfos={previewData} 
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
  );
};

export default WSForm;
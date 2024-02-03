"use client"; // IMPORTANT!!!

/** IMPORTS */
import Image from "next/image";
import PreviewRowType from "./PreviewRowType";
import PreviewWorkflowType from "./PreviewWorkflowType"
import { useState } from "react";
import { showHideElement, rotateElement, isElementVisible } from "@utils/generalFunctions";

/** Actual function component. Maybe too 'clean' :( */
const PreviewWS = ({ previewData, theIndex }) => {

  const [update, setUpdate ] = useState(3);

  /** Returned jsx */
  return (
    <>
      
      {/** Options for the whole page. */}
      <aside id={"main-options-bar"} className="new_options_nav c_row_elm" >

        <div className="w-[50%] h-auto c_row_elm gap-x-5 justify-start" >
          
          <button id={`generate-export-btn`} className="purple_btn brightness-75" disabled >
            Export
          </button>

          <button id={`load-export-btn`} className="purple_btn brightness-75" disabled >
            Load export
          </button>

        </div>
          
        <div className={"w-[50%] h-auto c_row_elm gap-x-5 justify-end"} >
          
          <button className="purple_btn brightness-75" disabled
            id={"start-all-scrapes-btn_disabled"} >
            Scrape all
          </button>

          <button className="purple_btn brightness-75 " disabled
            id={"remove-last-scrape-sec_disabled"}>
            - Scrape
          </button>

          <button className="purple_btn brightness-75" disabled 
            id={"add-new-scrape-sec"}>
            + Scrape
          </button>

        </div>

      </aside>
      
      {/** Contains all individual scrapes. */}
      <div id={"all-scape-sec-container"} className="c_col_elm overflow-auto max-h-[150dvh] p-5 mt-5 scale-x-[-1] h-full gap-y-10 w-[calc(90%+40px)] " >
        
        {   
          Array.from(Array(previewData.amount).keys()).map((index) => {

            return(
              previewData.info.all[index] !== undefined &&
                (
                  /** The actual scrape. */
                  <section key={`scrape-sec-${index}`} id={`scrape-sec-${index}`} className='new_scrape_sec c_col_elm ' > 
                    
                    {/** Options for the current scrape like delete, reset etc.. */}
                    <aside id={`scrape-sec-options-bar-${index}`} className="new_scrape_info_options c_row_elm" >

                      <div className="c_row_elm gap-x-2" id={"validation-conatainer"} >

                        <h3 className="font-inter text-[20px] "  >

                          {`Scrape ${index + 1}:` /** Because index starts at 0 */}

                        </h3>

                        <h3 className="font-inter text-[20px] text-[green]" >
                          VALID
                        </h3>

                        <Image width={40} height={40} src="/assets/icons/tick_g.svg" alt="valid tick" />
                              
                      </div>

                      <div id={`scrape-options-conatiner-${index}`} className="c_row_elm justify-end gap-x-2" >

                        <div className="c_col_elm justify-center h-[60px] w-fit " >

                          {
                            previewData.info.all[index].global_params.use_undetected ?
                              (
                                <Image id={`undetected-icon-${index}`} 
                                  src={"assets/icons/undetected_icon.svg"} 
                                  alt="use undetected mode"   // may need to adjust
                                  width={48} height={48} 
                                />
                              )
                              :
                              (
                                <Image id={`undetected-icon-${index}`} 
                                  src={"assets/icons/undetected_icon.svg"} 
                                  alt="use undetected mode" className=" brightness-50"  // may need to adjust
                                  width={48} height={48} 
                                />
                              )
                          }

                        </div>

                        
                        <button id={"start-scrape-btn_disabled"} className="purple_btn brightness-75" disabled >
                          Submit
                        </button>

                        
                        <Image id={"delete-scrape-btn_disabled"} src='/assets/icons/trash_can.svg' 
                          width={50} height={50} alt="delete button" className="brightness-75" />

                        {/** Reset scrape icon.*/}
                        <Image id={"reset-scrape-icon"}  src='/assets/icons/reset.svg' 
                          width={46} height={46} alt="reset button" className=" brightness-75" />
                        
                        {/** Toggle form visibility icon.*/}
                        <Image 
                          className="cursor-pointer rotate-180 " width={50} height={50} 
                          src="/assets/icons/updownarrow.svg" 
                          id={`hide-show-form-icon-${theIndex}`}  
                          alt={"hide form icon"}
                          onClick={() => { showHideElement({elementId: `scrape-sec-form-${theIndex}`}); rotateElement({elementId: `hide-show-form-icon-${theIndex}`, degrees: "180"}); }}
                        />
                            
                      </div>

                    </aside>

                    {/** The form element with all inputs, workflows and editing capabilities. */}
                    <form id={`scrape-sec-form-${theIndex}`} className="flex flex-col items-center h-full w-full justify-around gap-y-2 p-1 mb-2" >

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

                        <div className=" w-[20%] c_row_elm text-start justify-center h-10 gap-x-1">

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

                      </div>
                      
                      {/** Contains the input elements for url, wait-time etc..  */}
                      <div id={`global-params-inputs-container-${index}`} className="new_part_of_form justify-evenly c_row_elm mt-1" >

                        {/** WEBSITE URL INPUT */}
                        <input type="text" 
                          className="rounded-xl border-2 border-black text-[16px] pl-2 justify-center h-10 bg-zinc-200 w-[50%] text-start " 
                          disabled
                          value={previewData.info.all?.[index].global_params.website_url}
                          id={`global-param-website-url-input-${index}`} 
                        />

                        {/** WAIT TIME INPUT */}
                        <input type="number" 
                          min={5}
                          className="rounded-xl border-2 border-black text-[16px] pl-2 justify-center h-10 bg-zinc-200 w-[20%] text-start pr-1 " 
                          disabled 
                          value={previewData.info.all?.[index].global_params.wait_time}
                          id={`global-param-wait-time-input-${index}`} 
                        />

                        {/** BROWSER INPUT */}
                        <input type="text" 
                          className="rounded-xl border-2 border-black text-[16px] pl-2 justify-center h-10 bg-zinc-200 w-[20%] text-start " 
                          disabled
                          value={previewData.info.all?.[index].global_params.browser_type}
                          id={`global-param-browser-type-input-${index}`} 
                        />
                          
                      </div>
                      
                      {/** kinda random but in my opinion neccesary hr */}
                      <hr className="w-[98%] h-[2px] bg-black " />

                      {/** Contains the workflow options (adding one removing one...). */}
                      <div id={`workflow-options-container-${index}`} className="c_row_elm gap-x-3 pb-5 "  >

                          
                          <button id={"remove-row-btn_disabled"} disabled className="row_options_button brightness-75 border-black bg-zinc-200 " >
                            - last Action
                          </button>

                          <button id={"add-scrape-action-workflow-btn"} className="row_options_button border-[#004600] bg-green-400 brightness-75" 
                            disabled  >
                            + Scrape
                          </button>

                          <button id={"add-btn-press-workflow-btn"} className="row_options_button border-[#004600] bg-green-400 brightness-75" 
                            disabled >
                            + Button-press
                          </button>

                          <button id={"add-input-fill-workflow-btn"} className="row_options_button border-[#004600] bg-green-400 brightness-75" 
                            disabled >
                            + Input-fill
                          </button>

                          <button id={"add-wait-time-workflow-btn"} className="row_options_button border-[#004600] bg-green-400 brightness-75" 
                            disabled >
                            + Wait-time
                          </button>

                          {
                            previewData.info.all[index].loop.created === false ?

                              (
                                <button id={"add-sample-workflow-btn"} className="row_options_button border-purple-900 bg-purple-400 min-w-[95px] brightness-75 " 
                                  disabled  >
                                  + Loop
                                </button>
                              )
                              :
                              (
                                <button id={"add-sample-workflow-btn"} className="row_options_button border-purple-900 bg-purple-400 min-w-[95px] " 
                                  onClick={(e) => { e.preventDefault(); showHideElement({elementId: `loop-container-${theIndex}`}); showHideElement({elementId: `loop-hr-sep-${index}`}); setUpdate((prevUpdate) => { return ( prevUpdate + 1) % 2}); }}  >
                                  {
                                    isElementVisible({elementId: `loop-container-${theIndex}`}) ? 
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
                            onClick={(e) => { e.preventDefault(); showHideElement({elementId: `workflow-container-${theIndex}`}); }} >
                            {
                              // So that the button switches text depending on workflow-container-visibility
                              isElementVisible({elementId: `workflow-container-${theIndex}`}) ? 
                                ( "Show WF" ) : ( "Hide WF" )
                            }
                          </button>

                          <button id={"add-sample-workflow-btn"} className="row_options_button border-purple-900 bg-purple-400 brightness-75" 
                            disabled  >
                            Sample 
                          </button>

                      </div>

                      {/** Contains the loop element. */}
                      <div id={`loop-container-${theIndex}`} className={" w-[90%] h-fit mt-[-10px] flex flex-row gap-x-8 my-3 items-center relative justify-start p-2 shadow-lg rounded-lg bg-zinc-200 border-black border-2 hidden "} >

                          <p className="text-[20px] font-[600] " >
                            {"Please, define your loop here:"}
                          </p>

                          <label className="text-[18px] h-fit w-fit c_row_elm " >  Start: 
                            
                            <input
                              type="number"
                              min={1}
                              disabled
                              id={`loop-start-index-input-${index}`}
                              value={previewData.info.all[index].loop.loop_start_end[0]}
                              className={"w-[60px] rounded-xl border-2 border-black text-[16px] pl-2 justify-center h-10 bg-zinc-200 mx-2 font-[800] pr-1 "}
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
                              disabled
                              id={`loop-end-index-input-${index}`}
                              value={previewData.info.all[index].loop.loop_start_end[1]}
                              className={"w-[60px] rounded-xl border-2 border-black text-[16px] pl-2 justify-center h-10 bg-zinc-200 mx-2 font-[800] pr-1 "}
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
                              className={"w-[60px] rounded-xl border-2 border-black text-[16px] pl-2 justify-center h-10 bg-zinc-200 mx-2 font-[800] pr-1 "} 
                              disabled
                              value={previewData.info.all[index].loop.iterations}
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
                            className="absolute right-0 brightness-75"
                          />
                        
                      </div>

                      {/** Loop hr separator */}
                      <hr id={`loop-hr-sep-${index}`} className="bg-black w-[98%] h-[2px] hidden " />
                      
                      {/** Contains all workflow actions/rows. */}
                      <div id={`workflow-actions-container-${index}`} className="rows_grid w-[100%] h-auto gap-y-1 p-2 " >
                        {
                          // shows the needed workflow
                          previewData.info.all?.[index] !== undefined &&
                            (
                              <>
                                { 
                                  Object.keys(previewData.info.all?.[index].workflow).map((rowIndex) => {

                                    return (
                                      <div id={`workflow-${rowIndex}`} className=" relative new_part_of_form justify-start c_row_elm pr-1 " key={`row-${rowIndex}`} >

                                        <h4 className="new_action_text text-start " > {`${(Number(rowIndex) + 1)}: ${(previewData.info.all?.[index].workflow[rowIndex].at(0).at(0).toUpperCase() + previewData.info.all?.[index].workflow[rowIndex][0].slice(1))}`}  </h4>

                                        <PreviewRowType 
                                          showHideElement={showHideElement} 
                                          scraperInfos={previewData.info}
                                          type={previewData.info.all?.[index].workflow[rowIndex].at(0)}
                                          scrapeIdx={index} 
                                          rowIndex={Number(rowIndex)}
                                          theIndex={theIndex}  />
                                      
                                      </div>
                                    )
                                  })
                                }
                              </>
                            )
                        }
                      </div>
                      
                      {/** Contains all workflows, visualized in a chronological grid. */}

                      <div id={`workflow-container-${theIndex}`} className="hidden p-3 border-[black] border-2 rounded-md min-h-[40px] h-auto w-full mt-8" >

                        <div id={`workflow-content-container-${index}`} className="workflow_grid" >

                        
                          {
                            [...Object.keys(previewData.info.all[index].workflow)].map((workflowIndex) => {

                              return (
                                  <PreviewWorkflowType
                                    scraperInfos={previewData.info}
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

export default PreviewWS;

/** IMPORTS */
import Image from "next/image";
import { Fragment } from "react";

/** Actual function component. */
const WorkflowElement = ({scraperInfos, scrapeIdx, workflowIndex } : {scraperInfos : ScraperInfos, scrapeIdx : number, workflowIndex : number }) => {

  return (

    <div id={`workflow-action-wrapper-${workflowIndex}`} className="c_row_elm workflow_action_wrapper gap-x-1 " >

      {
        /**  == for string to int  */
        scraperInfos.all[scrapeIdx].loop.created && workflowIndex == Number(scraperInfos.all[scrapeIdx].loop.loop_start_end.at(0)) - 1 &&
          (
            <>
              <div className="bg-black w-[3px] h-full max-h-[188px] " />
              <p className="w-3 break-words text-[14px] font-[600] max-h-[188px]" >
                LOOP START
              </p>
            </>

          )
      }

      {/** Sits under the div with the actual workflow action info, so that it feels more like dropping the div into something. */}
      <div id={"workflow-action-drop-container"} className="c_row_elm workflow_action_drop_container" >

        {/** Contauins the actual workflow action info */}
        <div id={`workflow-action-info-container-${workflowIndex}`} 
          className={` flex flex-col gap-y-1 items-start justify-start w-full h-[100%] min-h-[190px] p-[6px] rounded-md bg-stone-300 cursor-grab active:cursor-grabbing `}  >

          <div className="c_row_elm w-full justify-between" >

            <h4 className="font-inter text-[14px] font-[800] " > Action {workflowIndex + 1}: </h4>

            <Image src='/assets/icons/cross_r.svg' alt="delete workflow object (disabled)" width={20} height={20} className="opacity-30" />

          </div>
          
          {/** Specifies the type of the workflow-action */}
          <p className="max-h-[30px]" >

            <span className="font-inter text-[14px] font-[600] underline " >
              {"type: "} 
            </span>

            <span className="font-inter text-[14px] font-[600]" >
              {`${scraperInfos.all[scrapeIdx].workflow[workflowIndex][0]}`}
            </span>
            
          </p>

          { 
            [...Object.keys(scraperInfos.all[scrapeIdx].workflow[workflowIndex].at(1))].map((key) => {

              return (
                scraperInfos.all[scrapeIdx].workflow[workflowIndex].at(1)[key] !== undefined &&
                    (
                      <Fragment key={`data-point-${workflowIndex}-${key}`} >
                        {
                          key === 'tag_name' || key === 'time_to_wait' || key === 'wait_after' ? 
                            (
                              <>
                                <p className="font-[600] text-[14px] underline " >
                                  {`${key}: `} 
                                  <span className={"font-[600]"} > 
                                    {
                                      scraperInfos.all[scrapeIdx].workflow[workflowIndex].at(1)[key].length > 11 ?
                                        (
                                          scraperInfos.all[scrapeIdx].workflow[workflowIndex].at(1)[key].slice(0, 8) + "..." 
                                        )
                                        :
                                        (
                                          scraperInfos.all[scrapeIdx].workflow[workflowIndex].at(1)[key]
                                        )
                                    }
                                  </span>
                                </p>
                              </>
                            )
                            :
                            (
                              <>
                                <p className="font-[600] text-[14px] underline " >
                                  {`${key}: `}
                                </p>
                                <p className="font-[600] min-h-[25px] " >
                                  {
                                    scraperInfos.all[scrapeIdx].workflow[workflowIndex].at(1)[key].length > 12 ?
                                      (
                                        scraperInfos.all[scrapeIdx].workflow[workflowIndex].at(1)[key].slice(0, 9) + "..."
                                      )
                                      :
                                      (
                                        scraperInfos.all[scrapeIdx].workflow[workflowIndex].at(1)[key]
                                      )
                                  }
                                </p>
                              </>
                            ) 
                        }   
                      </Fragment>
                    )
              );
            })
          }
        </div>

      </div>

      {
        /**  == for string to int  */
        scraperInfos.all[scrapeIdx].loop.created && workflowIndex == Number(scraperInfos.all[scrapeIdx].loop.loop_start_end.at(1)) - 1 &&
        (
          <>
            <p className="w-3 break-words text-[14px] font-[600] max-h-[188px] " >
              LOOP END
            </p>
            <div className="bg-black w-[3px] h-full max-h-[188px] " />
          </>

        )
      }

      <p className="font-inter text-[20px] min-w-[20px] h-[60px] mt-[40px]" >
          {"->"}
      </p>
      
    </div>
  );
};

export default WorkflowElement;
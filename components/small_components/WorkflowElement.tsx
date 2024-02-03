
/** IMPORTS */
import Image from "next/image";
import { Fragment } from "react";

/** Actual function component. */
const WorkflowElement = ({scraperInfos, setUpdate, setScrapeInfos, scrapeIdx, workflowIndex } :
                         {scraperInfos : ScraperInfos, setUpdate : any, setScrapeInfos : any, scrapeIdx : number, workflowIndex : number}) => {

  /** FUNCTIONS */

  /** Handles the drop of dragged components (currently only the draggable workflow containers). 
   * PARAMS: 
   * - scrapeIdx (String): the current index in the scraperInfo.all. Basically which 'scrape' it is
   * - localIndex (String): the scrapeIdx of the element that 'received' the drop
   * - dropIndex (String): the scrapeIdx of the element that got 'dropped'
   */
  const handleDrop = ({scrapeIdx, localIndex, dropIndex}  :{scrapeIdx : number, localIndex : number, dropIndex : number}) => {

    const scraperInfoCopy = scraperInfos.all[scrapeIdx].workflow;

    // Assigns the data of the two workflow objects which need to switch places.
    const firstDataPoint = scraperInfoCopy[localIndex];
    const secondDataPoint = scraperInfoCopy[dropIndex];

    // Nessecary use of setState because of interfernece between the scraperInfoCopy and the actual scraperInfo.
    setScrapeInfos((prevScrapeInfos) => {

      prevScrapeInfos.all[scrapeIdx].workflow[localIndex] = secondDataPoint;
      prevScrapeInfos.all[scrapeIdx].workflow[dropIndex] = firstDataPoint;

      return prevScrapeInfos;
    });

    setUpdate((prevUpdate) => { return (prevUpdate +1) % 2});

    return;
  };

  /** Removes a specific workflow of the current scrape.
   * PARAMS:
   * - scrapeIdx (String): the current index in the scraperInfo.all Basically which 'scrape' it is
   */
  const removeSpecificWorkflow = ({scrapeIdx, deleteWorkflowIndex} : {scrapeIdx : number, deleteWorkflowIndex : number}) => {

    let scraperInfoCopy = scraperInfos;
    const allWorkflowKeys = Object.keys(scraperInfoCopy.all[scrapeIdx].workflow);
    let container = {};

    for(const workflowKey of allWorkflowKeys){

      if (workflowKey !== String(deleteWorkflowIndex)){

        let insertKey = Number(Object.keys(container).length);

        container[insertKey] = scraperInfoCopy.all[scrapeIdx].workflow[workflowKey];
      }
    }

    scraperInfoCopy.all[scrapeIdx].workflow = container;

    setScrapeInfos(scraperInfoCopy);

    setUpdate((prevUpdate) => { return (prevUpdate + 1) % 2 })

    return;
  };

  return (

    <div id={`workflow-action-wrapper-${workflowIndex}`} className="c_row_elm workflow_action_wrapper gap-x-1 " >

      {
        /**  == for string to int  */
        scraperInfos.all[scrapeIdx].loop.created && workflowIndex == Number(scraperInfos.all[scrapeIdx].loop.loop_start_end[0]) - 1 &&
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
      <div id={"workflow-action-drop-container"} className="c_row_elm workflow_action_drop_container" onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => {e.preventDefault(); let dropIdx = e.dataTransfer.getData("droppedWorkflowIndex"); handleDrop({scrapeIdx: scrapeIdx, localIndex: workflowIndex, dropIndex: Number(dropIdx)});   }} >

        {/** Contauins the actual workflow action info */}
        <div id={`workflow-action-info-container-${workflowIndex}`} draggable onDragStart={(e) => { e.dataTransfer.setData("droppedWorkflowIndex", String(workflowIndex));  }} 
          className={` flex flex-col gap-y-1 items-start justify-start w-full h-[100%] min-h-[190px] p-[6px] rounded-md bg-stone-300 cursor-grab active:cursor-grabbing `}  >

          <div className="c_row_elm w-full justify-between" >

            <h4 className="font-inter text-[14px] font-[800] " > Action {Number(workflowIndex) + 1}: </h4>

            {
              Object.keys(scraperInfos.all[scrapeIdx].workflow).length > 1 ?
                (
                  <Image src='/assets/icons/cross_r.svg' alt="delete workflow object" width={20} height={20} className="cursor-pointer" onClick={() => { removeSpecificWorkflow({scrapeIdx: scrapeIdx,deleteWorkflowIndex: workflowIndex})}} />
                )
                :
                (
                  <Image src='/assets/icons/cross_r.svg' alt="delete workflow object (disabled)" width={20} height={20} className="opacity-30" />
                )
            }

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
            [...Object.keys(scraperInfos.all[scrapeIdx].workflow[workflowIndex][1])].map((key) => {

              return (
                scraperInfos.all[scrapeIdx].workflow[workflowIndex][1][key] !== undefined &&
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
                                      scraperInfos.all[scrapeIdx].workflow[workflowIndex][1][key].length > 11 ?
                                        (
                                          scraperInfos.all[scrapeIdx].workflow[workflowIndex][1][key].slice(0, 8) + "..." 
                                        )
                                        :
                                        (
                                          scraperInfos.all[scrapeIdx].workflow[workflowIndex][1][key]
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
                                    scraperInfos.all[scrapeIdx].workflow[workflowIndex][1][key].length > 12 ?
                                      (
                                        scraperInfos.all[scrapeIdx].workflow[workflowIndex][1][key].slice(0, 9) + "..."
                                      )
                                      :
                                      (
                                        scraperInfos.all[scrapeIdx].workflow[workflowIndex][1][key]
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
        scraperInfos.all[scrapeIdx].loop.created && workflowIndex == Number(scraperInfos.all[scrapeIdx].loop.loop_start_end[1]) - 1 &&
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
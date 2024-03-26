import Image from "next/image";
import Tooltip from "../design/Tooltip";
import { ScraperInfos } from "@custom-types";

const WorkflowAction = ({ handleChange, scraperInfos, type, scrapeIdx, removeSpecificWorkflow, rowIndex, valid, actions }:
  {
    handleChange: ({ scrapeIdx, workflowIndex, paramName, value }: { scrapeIdx: number, workflowIndex: number, paramName: string, value: any }) => void
    scraperInfos: ScraperInfos
    removeSpecificWorkflow: ({ scrapeIdx, workflowIndex }: { scrapeIdx: number, workflowIndex: number }) => void
    type: string
    scrapeIdx: number
    rowIndex: number
    valid: boolean
    actions: any
  }) => {

  
  
  return (
    <>
      <div className="flex flex-col items-center justify-start w-full h-full gap-y-2 pr-1 ">
        {
          actions[type].map((actionData) => (
            (actionData.pName === "css_selector" && scraperInfos.all[scrapeIdx].workflow[rowIndex].data.as !== "text") || actionData.pName === "fill_content" ?
              (
                <textarea required
                  placeholder={`${actionData.placeholder}`}
                  value={scraperInfos.all[scrapeIdx].workflow[rowIndex].data[actionData.pName]}
                  id={`${type}-${actionData.pName}-${scrapeIdx}-${rowIndex}`}
                  className={`text-[16px] px-2 rounded-lg min-h-[40px] py-1 h-fit text-start border-2 bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg w-full ${
                    scraperInfos.all[scrapeIdx].workflow[rowIndex].data[actionData.pName] === "" ? "border-gray-600 dark:border-gray-300" : (valid ? "border-green-500" : "border-red-500")
                  } `}
                  onChange={(e) => { handleChange({ scrapeIdx: scrapeIdx, workflowIndex: rowIndex, paramName: actionData.pName, value: (e.target.value) }) }}
                />
              )
              :
              (
                <input type={`${actionData.inputType}`} min={actionData?.minValue} max={actionData?.maxValue} required 
                  placeholder={`${actionData.placeholder}`}
                  value={scraperInfos.all[scrapeIdx].workflow[rowIndex].data[actionData.pName]}
                  id={`${type}-${actionData.pName}-${scrapeIdx}-${rowIndex}`}
                  className={`text-[16px] px-2 rounded-lg min-h-[40px] h-fit text-start border-2 bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg w-full ${
                    scraperInfos.all[scrapeIdx].workflow[rowIndex].data[actionData.pName] === "" ? "border-gray-600 dark:border-gray-300" : (valid ? "border-green-500" : "border-red-500")
                  } `}
                  onChange={(e) => { handleChange({ scrapeIdx: scrapeIdx, workflowIndex: rowIndex, paramName: actionData.pName, value: (e.target.value) }) }}
                />
              )
            ))
        }
      </div>
      
      {
        scraperInfos?.all[scrapeIdx].workflow.length > 1 ?
          (
            <Image draggable={false} id={`delete-workflow-action-${scrapeIdx}-${rowIndex}`} src='/assets/icons/scrape/invalid.svg' alt="delete workflow action" width={20} height={20}
              onClick={() => { removeSpecificWorkflow({ scrapeIdx: scrapeIdx, workflowIndex: rowIndex }); }} className="cursor-pointer mt-[10px]"
            />
          )
          :
          (
            <Image draggable={false} id={`delete-workflow-action-${scrapeIdx}-${rowIndex}_disabled`} src='/assets/icons/scrape/invalid.svg' 
              alt="delete workflow action (disabled)" width={20} height={20} className="opacity-30 mt-[10px]" />
          )
      }
      <div  id={`drag-action-tooltip-container-${scrapeIdx}-${rowIndex}`} className="relative group flex items-center justify-center min-w-[30px] h-full mt-[7px]" >

        <div id={`drag-action-tooltip-wrapper-${scrapeIdx}-${rowIndex}`} className="h-auto w-auto hidden group-hover:flex " >
          <Tooltip yOrientation="bottom" content={"Order action."} /> 
        </div>

        <Image
          src={"/assets/icons/generic/order.svg"}
          alt="order action"
          className="ml-2 cursor-grab"
          width={30}
          height={30}
          id={`order-action-${scrapeIdx}-${rowIndex}`}
          draggable={false}
          
        />

      </div>
    </>
  );
};
export default WorkflowAction;

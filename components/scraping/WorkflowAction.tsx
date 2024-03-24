import Image from "next/image";
import Tooltip from "../design/Tooltip";
import { PossibleCssSelectorDataTypes, ScraperInfos } from "@custom-types";
import { SetStateAction, Dispatch } from "react";
import ChangeDataInterpretationDropdown from "../dropdowns/ChangeDataInterpretationDropdown";

const WorkflowAction = ({ handleChange, scraperInfos, setScraperInfos, type, scrapeIdx, removeSpecificWorkflow, rowIndex }:
  {
    handleChange: ({ scrapeIdx, workflowIndex, paramName, value }: { scrapeIdx: number, workflowIndex: number, paramName: string, value: any }) => void
    scraperInfos: ScraperInfos
    setScraperInfos : Dispatch<SetStateAction<ScraperInfos>>
    removeSpecificWorkflow: ({ scrapeIdx, workflowIndex }: { scrapeIdx: number, workflowIndex: number }) => void
    type: string
    scrapeIdx: number
    rowIndex: number
  }) => {
  
  const handleCssSelectorTypeSelection = ({ id } : { id : PossibleCssSelectorDataTypes }) : void => {

    const newAll = scraperInfos.all;
    newAll[scrapeIdx].workflow[rowIndex].data.as = id;

    setScraperInfos((prevScraperInfos) => ({
      ...prevScraperInfos,
      all : newAll,
    }));
  };

  const possibleClasses = ["w-[calc(80%+12px)]", "w-[calc(20%+12px)]", "w-[calc(60%+12px)]"]
  const actions: { [name : string]: { tooltip: string, inputType: string, placeholder: string, pName: string, maxValue?: number, minValue?: number, width: string }[] } = {

    "scrape-action": [
      {
        tooltip: "Enter any valid CSS-selector, of any data point you want to get on the requested page.",
        inputType: "text",
        placeholder: "selector",
        pName: "css_selector",
        width: "80"
      }
    ],
    "btn-press": [
      {
        tooltip: "Enter any valid CSS-selector, that you can find on a button on the requested page.",
        inputType: "text",
        placeholder: "selector",
        pName: "css_selector",
        width: "80"
      }
    ],
    "input-fill": [
      {
        tooltip: "Enter any valid CSS-selector, that you can find on an input on the requested page.",
        inputType: "text",
        placeholder: "selector",
        pName: "css_selector",
        width: "40"
      },
      {
        tooltip: "Enter what should be added to the input.",
        inputType: "text",
        placeholder: "content",
        pName: "fill_content",
        width: "40"
      }
    ],
    "wait-time": [
      {
        tooltip: "Enter a valid integer (0-30)",
        inputType: "number",
        placeholder: "5",
        pName: "time_to_wait",
        minValue: 2,
        maxValue: 30,
        width: "80"
      }
    ],
  };

  return (
    <>
      {
        actions[type].map((actionData) => {

          return (
            <div 
              key={`${type}-${actionData.pName}-${scrapeIdx}-${rowIndex}-container`} 
              id={`${type}-${actionData.pName}-${scrapeIdx}-${rowIndex}-container`}
              className={`flex flex-row items-start w-[calc(${actionData.width}%+12px)] min-h-[40px] h-max rounded-xl bg-purple-400 dark:bg-purple-300 mr-[6px]`} >

              {
                (actionData.pName === "css_selector" && scraperInfos.all[scrapeIdx].workflow[rowIndex].data.as !== "text") || actionData.pName === "fill_content" ?
                  (
                    <textarea required
                      placeholder={`${actionData.placeholder}`}
                      value={scraperInfos.all[scrapeIdx].workflow[rowIndex].data[actionData.pName]}
                      id={`${type}-${actionData.pName}-${scrapeIdx}-${rowIndex}`}
                      className='text-[16px] px-2 min-h-[34px] h-fit py-1 break-words focus:outline-none text-start m-[3px] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark w-[92%]'
                      onChange={(e) => { handleChange({ scrapeIdx: scrapeIdx, workflowIndex: rowIndex, paramName: actionData.pName, value: (e.target.value) }) }}
                    />
                  )
                  :
                  (
                    <input type={`${actionData.inputType}`} min={actionData?.minValue} max={actionData?.maxValue} required 
                      placeholder={`${actionData.placeholder}`}
                      value={scraperInfos.all[scrapeIdx].workflow[rowIndex].data[actionData.pName]}
                      id={`${type}-${actionData.pName}-${scrapeIdx}-${rowIndex}`}
                      className='text-[16px] px-2 min-h-[34px] h-[calc(100%-6px)] focus:outline-none text-start m-[3px] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark w-[92%]'
                      onChange={(e) => { handleChange({ scrapeIdx: scrapeIdx, workflowIndex: rowIndex, paramName: actionData.pName, value: (e.target.value) }) }}
                    />
                  )
              }

              {
                actionData.pName === "css_selector" && (
                  <ChangeDataInterpretationDropdown
                    thingToClick={
                      <Image
                        id={`css_selector-options-${scrapeIdx}-${rowIndex}`}
                        alt="css_selector options"
                        src={"/assets/icons/generic/3_dots.svg"}
                        className="cursor-pointer"
                        height={30}
                        width={30}
                      />
                    }
                    scrapeIdx={null}
                    handleTypeSelection={handleCssSelectorTypeSelection}
                    options={[{name : "As TEXT", id: "text"}, {name : "As CSV", id: "csv"}, {name : "As JSON-array", id: "json"}]}
                  />
                )
              }

              <div className="group flex items-center justify-center min-w-[30px] h-auto mt-[6px]" >

                <div className="h-auto w-auto hidden group-hover:flex " >
                  <Tooltip yOrientation="bottom" content={actionData.tooltip} />
                </div>

                <Image draggable={false} src='/assets/icons/generic/tooltip_purple.svg' alt={`${type}-${actionData.pName}-tooltip`} width={26} height={26} />

              </div>

            </div>
          );
        })
      }
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
      <div  id={`drag-action-tooltip-container-${scrapeIdx}-${rowIndex}`} className="relative group flex items-center justify-center min-w-[30px] h-full mt-[10px]" >

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

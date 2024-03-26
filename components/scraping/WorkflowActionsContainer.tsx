import { PossibleCssSelectorDataTypes, ScraperInfos } from '@custom-types';
import React, { Dispatch, SetStateAction } from 'react'
import WorkflowAction from './WorkflowAction';
import ChangeDataInterpretationDropdown from '@components/dropdowns/ChangeDataInterpretationDropdown';
import Image from 'next/image';
import Tooltip from '@components/custom/Tooltip';

const WorkflowActionsContainer = ({scrapeIdx, scraperInfos, setScraperInfos, validateWorkflowAction, handleDrop, handleWorkflowChange, removeSpecificWorkflow} : 
  {
    scrapeIdx : number
    scraperInfos : ScraperInfos
    setScraperInfos : Dispatch<SetStateAction<ScraperInfos>> | null
    validateWorkflowAction : ({scrapeIdx, workflowIndex} : { scrapeIdx : number, workflowIndex : number}) => boolean | null
    handleDrop : ({scrapeIdx, localIndex, dropIndex} : {scrapeIdx : number, localIndex : number, dropIndex : number}) => void | null
    handleWorkflowChange : ({scrapeIdx, workflowIndex, paramName, value} : {scrapeIdx : number, workflowIndex : number, paramName : string, value : string | number | boolean}) => void | null
    removeSpecificWorkflow : ({scrapeIdx, workflowIndex} : {scrapeIdx: number, workflowIndex: number}) => void | null

  }
  ) => {

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

  const workflowTooltipMap = {
    "scrape-action" : "Scrape any text data by providing one or many css-selectors.",
    "btn-press" : "Press buttons by providing one or many css-selectors.",
    "input-fill" : "Fill inputs by providing a or multiple pairs of css-selectors and contents.",
    "wait-time" : "Halt execution of a scrape(r)."
  };

  return (
    <div id={`actions-container-${scrapeIdx}`} className="flex flex-col items-center gap-y-2  w-full h-auto " >
      { 
        scraperInfos?.all[scrapeIdx] && Array.from(scraperInfos?.all[scrapeIdx].workflow.keys()).map((rowIndex) => {
        
          const workflowType = scraperInfos?.all[scrapeIdx].workflow[rowIndex].type;

          const handleCssSelectorTypeSelection = ({ id } : { id : PossibleCssSelectorDataTypes}) : void => {

            const newAll = scraperInfos.all;
            newAll[scrapeIdx].workflow[rowIndex].data.as = id;
        
            setScraperInfos((prevScraperInfos) => ({
              ...prevScraperInfos,
              all : newAll,
            }));
          };

          return(

            <div 
              id={`action-${rowIndex}` } 
              className="w-full h-auto " 
              key={`workflow-action-${rowIndex}`} 
              onDragOver={(e) => { e.preventDefault(); }} 
              onDrop={(e) => {
                e.preventDefault(); 
                handleDrop({scrapeIdx: scrapeIdx, localIndex: rowIndex, dropIndex: Number(e.dataTransfer.getData("droppedWorkflowIndex"))});
              }} 
            >
              
              <div className='w-full h-auto flex flex-row gap-x-1 relative' >
                
                <h4 id={`action-heading-${rowIndex}`} className="text-start text-[14px] font-[Helvetica] font-[600] w-auto" > {`${(Number(rowIndex) + 1)}: ${(scraperInfos?.all[scrapeIdx].workflow[rowIndex].type.at(0).toUpperCase() + scraperInfos?.all[scrapeIdx].workflow[rowIndex].type.slice(1))}`} </h4>
                
                <div className="relative group flex items-center" >

                  <Tooltip yOrientation="bottom" content={workflowTooltipMap[workflowType]} />

                  <Image draggable={false} src='/assets/icons/generic/tooltip_purple.svg' alt={`-tooltip`} width={16} height={16} />

                </div>

                <div className='absolute right-[60px] -top-[6px]' >
                  {
                    ["scrape-action", "btn-press", "input-fill"].includes(workflowType) && (
                      <ChangeDataInterpretationDropdown
                        thingToClick={
                          <Image
                            id={`css_selector-options-${scrapeIdx}-${rowIndex}`}
                            alt="css_selector options"
                            src={"/assets/icons/generic/3_dots.svg"}
                            className="cursor-pointer"
                            height={32}
                            width={32}
                          />
                        }
                        handleTypeSelection={handleCssSelectorTypeSelection}
                        options={[{name : "As TEXT", id: "text"}, {name : "As CSV", id: "csv"}, {name : "As JSON-array", id: "json"}]}
                      />
                    )
                  }
                </div>
              </div>

              <div id={`action-drag-wrapper-${rowIndex}`} className="flex flex-row items-start justify-start w-full" draggable onDragStart={(e) => { e.dataTransfer.setData("droppedWorkflowIndex", String(rowIndex));}} >

                <WorkflowAction
                  handleChange={handleWorkflowChange} 
                  scraperInfos={scraperInfos}
                  removeSpecificWorkflow={removeSpecificWorkflow}
                  type={workflowType}
                  scrapeIdx={scrapeIdx} 
                  rowIndex={Number(rowIndex)}
                  valid={validateWorkflowAction({scrapeIdx: scrapeIdx, workflowIndex: rowIndex})}
                  actions={actions}
                />
              </div>
            </div>
          )
        })
      }
    </div>
  );
};

export default WorkflowActionsContainer;
import WorkflowAction from './WorkflowAction';
import ChangeDataTypeDropdown from '@components/dropdowns/ChangeDataTypeDropdown';
import Image from 'next/image';
import Tooltip from '@components/custom/Tooltip';

const WorkflowActionsContainer = ({ scrapeIdx, scraper, switchTwoScrapes, handleActionChange, removeActionByIndex } : 
  {
    scrapeIdx : number
    scraper : ScraperData
    switchTwoScrapes : ({ scrapeIdx, localIndex, dropIndex } : {scrapeIdx : number, localIndex : number, dropIndex : number }) => void | null
    handleActionChange : ({ scrapeIdx, workflowIndex, paramName, value, as } : { scrapeIdx : number, workflowIndex : number, paramName? : string, value? : string | string[] | number, as? : ScraperDataType }) => void
    removeActionByIndex : ({ scrapeIdx, workflowIndex } : { scrapeIdx: number, workflowIndex: number }) => void | null

  }
  ) => {

  const workflowTooltipMap = {
    "scrape" : "Scrape any text data by providing one or many css-selectors.",
    "button-press" : "Press buttons by providing one or many css-selectors.",
    "input-fill" : "Fill inputs by providing a or multiple pairs of css-selectors and contents.",
    "wait" : "Halt execution of a scrape(r)."
  };

  return (
    <div className="flex flex-col items-center gap-y-2  w-full h-auto " >
      { 
        Array.from(scraper?.scrapes[scrapeIdx].workflow.keys()).map((actionIndex) => {
        
          const workflowType = scraper?.scrapes[scrapeIdx].workflow[actionIndex].type;

          const handleDataTypeSelection = ({ type } : { type : ScraperDataType }) : void => {
            handleActionChange({ scrapeIdx: scrapeIdx, workflowIndex: actionIndex, as: type});
          };

          return(

            <div key={`workflow-action-${actionIndex}`} className="w-full h-auto " onDragOver={(e) => { e.preventDefault(); }} 
              onDrop={(e) => {
                e.preventDefault(); 
                switchTwoScrapes({ scrapeIdx: scrapeIdx, localIndex: actionIndex, dropIndex: Number(e.dataTransfer.getData("droppedWorkflowIndex")) });
              }} 
            >
              
              <div className='w-full h-auto flex flex-row gap-x-1 relative' >
                
                <h4 className="text-start text-[14px] font-[Helvetica] font-[600] w-auto" > {`${(Number(actionIndex) + 1)}: ${(scraper?.scrapes[scrapeIdx].workflow[actionIndex].type.at(0).toUpperCase() + scraper?.scrapes[scrapeIdx].workflow[actionIndex].type.slice(1))}`} </h4>
                
                <div className="relative group flex items-center" >

                  <Tooltip yOrientation="bottom" content={workflowTooltipMap[workflowType]} />

                  <Image 
                    draggable={false} 
                    src='/assets/icons/generic/tooltip_purple.svg' 
                    alt="Action tooltip" 
                    width={16} height={16} 
                  />

                </div>

                <div className='absolute right-[60px] -top-[6px]' >
                  
                  <ChangeDataTypeDropdown
                    thingToClick={
                      <Image
                        alt="data type options"
                        src={"/assets/icons/generic/3_dots.svg"}
                        height={32} width={32}
                      />
                    }
                    handleTypeChange={handleDataTypeSelection}
                  />

                </div>

              </div>

              <div className="flex flex-row items-start justify-start w-full" draggable onDragStart={(e) => { e.dataTransfer.setData("droppedWorkflowIndex", String(actionIndex));}} >

                <WorkflowAction
                  handleActionChange={handleActionChange} 
                  scraper={scraper}
                  removeActionByIndex={removeActionByIndex}
                  type={workflowType}
                  scrapeIdx={scrapeIdx} 
                  actionIndex={actionIndex}
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
import Image from "next/image";
import Tooltip from "../custom/Tooltip";
import ActionDataJsonEditor from "@components/codeEditors/ActionDataJsonEditor";
import { validateCssSelector, validateFillContent, validateWaitTime } from "@utils/customValidation";

const WorkflowAction = ({ handleActionChange, scraper, type, scrapeIdx, removeActionByIndex, actionIndex } :
  {
    handleActionChange: ({ scrapeIdx, workflowIndex, paramName, value, as }: { scrapeIdx: number, workflowIndex: number, paramName?: string, value?: string | string[] | number, as?: ScraperDataType }) => void
    scraper: ScraperData
    removeActionByIndex: ({ scrapeIdx, workflowIndex }: { scrapeIdx: number, workflowIndex: number }) => void
    type: string
    scrapeIdx: number
    actionIndex: number
  }) => {

  const actions: { [name : string]: { inputType: string, placeholder: string | number, pName: string, maxValue?: number, minValue?: number, }[] } = {

    "scrape": [
      {
        inputType: "text",
        placeholder: "selector",
        pName: "css_selectors",
      }
    ],
    "button-press": [
      {
        inputType: "text",
        placeholder: "selector",
        pName: "css_selectors",
      }
    ],
    "input-fill": [
      {
        inputType: "text",
        placeholder: "selector",
        pName: "css_selectors",
      },
      {
        inputType: "text",
        placeholder: "content",
        pName: "fill_content",
      }
    ],
    "wait": [
      {
        inputType: "number",
        placeholder: 5,
        pName: "time",
        minValue: 2,
        maxValue: 10,
      }
    ],
  };
  
  return (
    <>
      <div className="flex flex-col items-center justify-start w-full h-full gap-y-2 pr-1 ">
        {
          actions[type].map((actionData) => {

            const actionValue : string | number = scraper.scrapes[scrapeIdx].workflow[actionIndex].data[actionData.pName]
            const actionAs = scraper.scrapes[scrapeIdx].workflow[actionIndex].as;

            let actionValid;

            if(actionData.pName === "css_selectors"){
              actionValid = validateCssSelector({ input: actionValue as string, as: actionAs });
            }
            else if(actionData.pName === "fill_content"){
              actionValid = validateFillContent({ input: actionValue as string | string[], as: actionAs });
            }
            else if(actionData.pName === "time"){
              actionValid = validateWaitTime({ input: actionValue, as: actionAs });
            }

            if(actionAs === "json"){

              return (
                <ActionDataJsonEditor 
                  key={`${type}-${actionData.pName}-${scrapeIdx}-${actionIndex}`} 
                  scraper={scraper} 
                  scrapeIdx={scrapeIdx} 
                  workflowIndex={actionIndex} 
                  handleActionChange={handleActionChange}
                  paramName={actionData.pName}
                  valid={actionValid}
                />
              )
            }
            else if(actionAs === "csv"){
              
              return (
                <textarea required
                  key={`${type}-${actionData.pName}-${scrapeIdx}-${actionIndex}`}
                  placeholder={`${actionData.placeholder}`}
                  value={actionValue}
                  className={`wsform_bg text-[16px] px-2 rounded-lg min-h-[40px] py-1 h-fit text-start border-2 w-full ${ actionValue === "" ? "action_neutral" : (actionValid ? "action_valid" : "action_invalid")}`}
                  onChange={(e) => { handleActionChange({ scrapeIdx: scrapeIdx, workflowIndex: actionIndex, paramName: actionData.pName, value: (e.target.value) }) }}
                />
              )
            }
            else if(actionAs === "text"){
              return(
                <input required
                  type={`${actionData.inputType}`} 
                  min={actionData?.minValue} max={actionData?.maxValue} 
                  key={`${type}-${actionData.pName}-${scrapeIdx}-${actionIndex}`}
                  placeholder={`${actionData.placeholder}`}
                  value={actionValue}
                  className={`wsform_bg text-[16px] px-2 rounded-lg min-h-[40px] py-1 h-fit text-start border-2 w-full ${ actionValue === "" ? "action_neutral" : (actionValid ? "action_valid" : "action_invalid")}`}
                  onChange={(e) => { handleActionChange({ scrapeIdx: scrapeIdx, workflowIndex: actionIndex, paramName: actionData.pName, value: (e.target.value) }); }}
                />
              ); 
            }
          })
        }
      </div>
      
      {
        scraper?.scrapes[scrapeIdx].workflow.length > 1 ?
          (
            <Image 
              draggable={false} 
              src='/assets/icons/scrape/invalid.svg' 
              alt="Remove action" 
              width={20} height={20}
              onClick={() => { removeActionByIndex({ scrapeIdx: scrapeIdx, workflowIndex: actionIndex }); }} 
              className="mt-[10px]"
            />
          )
          :
          (
            <Image 
              draggable={false} 
              src='/assets/icons/scrape/invalid.svg' 
              alt="delete workflow action (disabled)" 
              width={20} height={20} 
              className="opacity-30 mt-[10px]" 
            />
          )
      }
      
      <div className="relative group flex items-center justify-center min-w-[30px] h-full mt-[7px]" >

        <Tooltip yOrientation="bottom" content={"Order action."} /> 

        <Image
          src={"/assets/icons/generic/order.svg"}
          alt="order action"
          className="ml-2 cursor-grab"
          width={30} height={30}
          draggable={false}
        />

      </div>
    </>
  );
};
export default WorkflowAction;

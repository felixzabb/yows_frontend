import Image from "next/image";
import Tooltip from "../design/Tooltip";
import { ScraperInfos } from "@custom-types";

const WorkflowAction = ({ handleChange, scraperInfos, type, scrapeIdx, removeSpecificWorkflow, rowIndex }:
  {
    handleChange: ({ scrapeIdx, workflowIndex, paramName, value }: { scrapeIdx: number, workflowIndex: number, paramName: string, value: any }) => void,
    scraperInfos: ScraperInfos,
    removeSpecificWorkflow: ({ scrapeIdx, workflowIndex }: { scrapeIdx: number, workflowIndex: number }) => void,
    type: string,
    scrapeIdx: number,
    rowIndex: number
  }) => {


  const actions: { [index: string]: { tooltip: string, inputType: string, placeholder: string, pName: string, maxValue?: number, minValue?: number }[] } = {

    "scrape-action": [
      {
        tooltip: "Enter any valid CSS-selector, that you can find on a button on the requested page.",
        inputType: "text",
        placeholder: "selector",
        pName: "css_selector",
      }
    ],
    "btn-press": [
      {
        tooltip: "Enter any valid CSS-selector, that you can find on a button on the requested page.",
        inputType: "text",
        placeholder: "selector",
        pName: "css_selector",
      },
      {
        tooltip: "Enter a valid integer(0-10).",
        inputType: "number",
        placeholder: "wait",
        pName: "wait_after",
        minValue: 2,
        maxValue: 10
      }
    ],
    "input-fill": [
      {
        tooltip: "Enter any valid CSS-selector, that you can find on a button on the requested page.",
        inputType: "text",
        placeholder: "selector",
        pName: "css_selector",
      },
      {
        tooltip: "Enter what should be added to the input.",
        inputType: "text",
        placeholder: "content",
        pName: "fill_content",
      }
    ],
    "wait-time": [
      {
        tooltip: "Enter a valid integer (0-30)",
        inputType: "number",
        placeholder: "5",
        pName: "time_to_wait",
        minValue: 2,
        maxValue: 30
      }
    ],
  };

  return (
    <>
      {
        actions[type].map((actionData) => {

          return (
            <div key={`${type}-${actionData.pName}-${scrapeIdx}-${rowIndex}-container`} id={`${type}-${actionData.pName}-${scrapeIdx}-${rowIndex}-container`}
              className="flex flex-row items-center w-[calc(80%+12px)] h-[40px] rounded-xl bg-purple-400 dark:bg-purple-300 mr-[6px] " >

              <input type={`${actionData.inputType}`} min={actionData?.minValue} max={actionData?.maxValue} required placeholder={`${actionData.placeholder}`}
                value={scraperInfos.all[scrapeIdx].workflow[rowIndex].data[actionData.pName]}
                id={`${type}-${actionData.pName}-${scrapeIdx}-${rowIndex}-container`}
                className='text-[16px] pl-2 h-[calc(100%-6px)] focus:outline-none text-start pr-2 m-[3px] autofill:delay-[9999s] focus:delay-[9999s] hover:delay-[9999s] active:delay-[9999s] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark w-[92%]'
                onChange={(e) => { handleChange({ scrapeIdx: scrapeIdx, workflowIndex: rowIndex, paramName: actionData.pName, value: (e.target.value) }) }}
              />

              <div className="group flex items-center justify-center min-w-[30px] h-full" >

                <div className="h-auto w-auto hidden group-hover:flex " >
                  <Tooltip content={actionData.tooltip} />
                </div>

                <Image src='/assets/icons/generic/tooltip_purple.svg' alt={`${type}-${actionData.pName}-tooltip`} width={26} height={26} />

              </div>

            </div>
          );
        })
      }
      {
        scraperInfos?.all[scrapeIdx].workflow.length > 1 ?
          (
            <Image id={`delete-workflow-action-${scrapeIdx}-${rowIndex}`} src='/assets/icons/scrape/invalid.svg' alt="delete workflow action" width={20} height={20}
              onClick={() => { removeSpecificWorkflow({ scrapeIdx: scrapeIdx, workflowIndex: rowIndex }); }} className="cursor-pointer"
            />
          )
          :
          (
            <Image id={`delete-workflow-action-${scrapeIdx}-${rowIndex}_disabled`} src='/assets/icons/scrape/invalid.svg' alt="delete workflow action (disabled)" width={20} height={20} className="opacity-30" />
          )
      }
    </>
  );
};
export default WorkflowAction;

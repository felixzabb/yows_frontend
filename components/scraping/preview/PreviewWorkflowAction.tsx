
/** IMPORTS */
import Image from "next/image";
import { ScraperInfos } from "@custom-types";

/** Actual function component. Maybe should have done it with a switch :( */
const PreviewWorkflowAction = ({scraperInfos, type, scrapeIdx, rowIndex} :  { type : string,  scrapeIdx : number, rowIndex : number, scraperInfos : ScraperInfos, }) => {

  /** Will display a scrape-action WF. */
  if(type === 'scrape-action'){

    return (
      <>

        {/** CSS-selector input */}
        <div id={`class-input-${scrapeIdx}-${rowIndex}-container`} 
          	className="flex flex-row items-center w-[calc(80%+12px)] h-[40px] rounded-xl bg-purple-400 dark:bg-purple-300 mr-[6px] " >
          
          <input readOnly type="text" placeholder='selector'
            value={scraperInfos.all[scrapeIdx].workflow[rowIndex][1].css_selector}
            id={`class-input-${scrapeIdx}-${rowIndex}`} 
            className='text-[16px] pl-2 h-[calc(100%-6px)] focus:outline-none text-start pr-2 m-[3px] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark w-[92%]' 
          />

          <div className="group flex items-center justify-center min-w-[30px] h-full" >

            <Image src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} />

          </div>

        </div>

        <Image src='/assets/icons/scrape/invalid.svg' alt="Delete action (disabled)" width={20} height={20} className="opacity-30" />
      </>
    );
  }
  /** Will display a btn-press WF. */
  else if(type === 'btn-press'){    

    return (
      <>

        <div id={`btn-selector-input-${scrapeIdx}-${rowIndex}-container`} 
          	className="flex flex-row items-center w-[calc(70%+12px)] h-[40px] rounded-xl bg-purple-400 dark:bg-purple-300 mr-[6px] " >

          <input readOnly type="text" 
            className='text-[16px] pl-2 h-[calc(100%-6px)] focus:outline-none text-start pr-2 m-[3px] autofill:delay-[9999s] focus:delay-[9999s] hover:delay-[9999s] active:delay-[9999s] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark w-[92%]' 
            placeholder="selector"
            value={scraperInfos.all[scrapeIdx].workflow[rowIndex][1].selector}  
            id={`btn-selector-input-${scrapeIdx}-${rowIndex}`} 
          />

          <div className="group flex items-center justify-center min-w-[30px] h-full" >
            <Image src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} />
          </div>

        </div>

        {/** Button wait after input */}
        <div id={`btn-wait-after-input-${scrapeIdx}-${rowIndex}-container`} 
          	className="flex flex-row items-center w-[calc(30%+12px)] h-[40px] rounded-xl bg-purple-400 dark:bg-purple-300 mr-[6px] " >

            <input readOnly type="number" min={3} required placeholder='wait'
              value={scraperInfos.all[scrapeIdx].workflow[rowIndex][1].wait_after}  
              id={`btn-wait-after-input-${scrapeIdx}-${rowIndex}`} 
              className='text-[16px] pl-2 h-[calc(100%-6px)] focus:outline-none text-start pr-2 m-[3px] autofill:delay-[9999s] focus:delay-[9999s] hover:delay-[9999s] active:delay-[9999s] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark w-[92%]' 
            />

          <div className="group flex items-center justify-center min-w-[30px] h-full" >

            <Image src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} />

          </div>

        </div>

          <Image src='/assets/icons/scrape/invalid.svg' alt="delete row object" width={20} height={20} className="opacity-30" />
      </>
    );
  }
  /** Will display a input-fill WF. */
  else if(type === 'input-fill'){


    return (
      <>

        {/** input selector input */}
        <div id={`input-selector-input-${scrapeIdx}-${rowIndex}-container`}  
          	className="flex flex-row items-center w-[calc(80%+12px)] h-[40px] rounded-xl bg-purple-400 dark:bg-purple-300 mr-[6px] " >

          <input readOnly type="text" 
            className='text-[16px] pl-2 h-[calc(100%-6px)] focus:outline-none text-start pr-2 m-[3px] autofill:delay-[9999s] focus:delay-[9999s] hover:delay-[9999s] active:delay-[9999s] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark w-[92%]' 
            required 
            placeholder="selector"
            value={scraperInfos.all[scrapeIdx].workflow[rowIndex][1].selector}  
            id={`input-selector-input-${scrapeIdx}-${rowIndex}`} 
          />

          <div className="group flex items-center justify-center min-w-[30px] h-full" >
            <Image src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} />
          </div>

        </div>

        {/** input fill content input */}
        <div id={`input-fill-content-input-${scrapeIdx}-${rowIndex}-container`} 
          	className="flex flex-row items-center w-[calc(80%+12px)] h-[40px] rounded-xl bg-purple-400 dark:bg-purple-300 mr-[6px] " >

          <input readOnly type="text" required placeholder='content'
            value={scraperInfos.all[scrapeIdx].workflow[rowIndex][1].fill_content}  
            id={`input-fill-content-input-${scrapeIdx}-${rowIndex}`} 
            className='text-[16px] pl-2 h-[calc(100%-6px)] focus:outline-none text-start pr-2 m-[3px] autofill:delay-[9999s] focus:delay-[9999s] hover:delay-[9999s] active:delay-[9999s] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark w-[92%]' 
          />

          <div className="group flex items-center justify-center min-w-[30px] h-full" >
            <Image src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} />
          </div>

        </div>

        <Image src='/assets/icons/scrape/invalid.svg' alt="delete row object" width={20} height={20} className="opacity-30" />

      </>
    );
  }
  /** Will display a wait-time WF. */
  else if(type === 'wait-time'){

    return (
      <>

        <div id={`btn-selector-input-${rowIndex}-container`} 
          	className="flex flex-row items-center w-[calc(80%+12px)] h-[40px] rounded-xl bg-purple-400 dark:bg-purple-300 mr-[6px] " >

          <input readOnly type="number" min={1} 
            className='text-[16px] pl-2 h-[calc(100%-6px)] focus:outline-none text-start pr-2 m-[3px] autofill:delay-[9999s] focus:delay-[9999s] hover:delay-[9999s] active:delay-[9999s] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg placeholder:text-text-color-light dark:placeholder:text-text-color-dark w-[92%]' 
            required 
            placeholder="wait"
            value={scraperInfos.all[scrapeIdx].workflow[rowIndex][1]["time_to_wait"]}  
            id={`btn-selector-input-${rowIndex}`} 
          />

          <div className="group flex items-center justify-center min-w-[30px] h-full" >
            <Image src='/assets/icons/generic/tooltip_purple.svg' alt='html id name input tooltip icon' width={26} height={26} />
          </div>

        </div>

        <Image src='/assets/icons/scrape/invalid.svg' alt="delete row object" width={20} height={20} />
      </>
    );
  }
};

export default PreviewWorkflowAction;

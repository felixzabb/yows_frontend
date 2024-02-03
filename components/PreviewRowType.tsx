
/** IMPORTS */
import Image from "next/image";

/** Actual function component. Maybe should have done it with a switch :( */
const PreviewRowType = ({showHideElement, scraperInfos, type, scrapeIdx, rowIndex, theIndex} : 
                        {showHideElement : ({elementId} : {elementId : string}) => void, 
                        scraperInfos : ScraperInfos
                        type : string
                        scrapeIdx : number,
                        rowIndex : number
                        theIndex : number
                      }) => {
  
  /** Will display a scrape-action WF. */
  if(type === 'scrape-action'){

    let tagNameOrientation;
    let classOrientation;
    let idOrientation;

    if(rowIndex % 2 === 0){

      tagNameOrientation = "left-[-160px]";
      classOrientation = "left-[-160px]";
      idOrientation = "left-[-170px]";
    }
    else{

      tagNameOrientation = "right-[-160px]";
      classOrientation = "right-[-120px]";
      idOrientation = "right-[-20px]";
    }
    
    return (
      <>

        {/** CSS-selector input */}
        <div id={`class-input-${scrapeIdx}-${rowIndex}-container`} className="flex flex-row items-center w-[calc(80%+12px)] relative border-2 border-black rounded-xl bg-zinc-300 mr-[6px] " >

          <input type="text" placeholder='CSS-selector'
            value={scraperInfos.all[scrapeIdx].workflow[rowIndex][1].css_selector}
            id={`class-input-${scrapeIdx}-${rowIndex}`} className='text-[14px] xl:text-[16px] pl-2 justify-center h-10  text-start pr-2 rounded-ss-xl rounded-es-xl bg-zinc-200 border-black w-full' 
            disabled
          />

          <div className=" flex items-center justify-center relative min-w-[35px] h-10 " >

            <span id={`class-input-tooltip-${theIndex}`} className={`tooltip hidden top-[-80px] ${classOrientation}`} >
            
              <span className="tooltip_text_main" >Specifies the CSS-selector by which the programm will filter.</span>
              <br />
              <span className="tooltip_option_text" >OPTIONS:</span> any valid CSS-selector
        
            </span>

            <Image src='/assets/icons/info.svg' alt='html id name input tooltip icon' width={20} height={20} 
              onMouseOver={() => { showHideElement({elementId: `class-input-tooltip-${theIndex}`}) }}
              onMouseOut={() => { showHideElement({elementId: `class-input-tooltip-${theIndex}`}) }}
            />

          </div>

        </div>

        <Image src='/assets/icons/cross_r.svg' alt="delete row object" width={20} height={20} className="opacity-30"  />
      </>
    );
  }
  /** Will display a btn-press WF. */
  else if(type === 'btn-press'){    

    let btnSelectorOrientation;
    let waitAfterOrientation;
    let loopOrientation;

    if(rowIndex % 2 === 0){

      btnSelectorOrientation = "left-[-160px]";
      waitAfterOrientation = "left-[-160px]";
      loopOrientation = "left-[-120px]";
    }
    else{

      btnSelectorOrientation = "right-[-160px]";
      waitAfterOrientation = "right-[-115px]";
      loopOrientation = "right-[-20px]";
    }

    return (
      <>

        {/** Button selector input */}
        <div id={`btn-selector-input-${scrapeIdx}-${rowIndex}-container`} className="flex flex-row items-center w-[55%] relative border-2 border-black rounded-xl bg-slate-300 mr-[12px] " >

          <input type="text" 
            className="text-[14px] xl:text-[16px] pl-2 justify-center h-10  text-start pr-2 rounded-ss-xl rounded-es-xl bg-zinc-200 border-black w-full" 
            disabled
            value={scraperInfos.all[scrapeIdx].workflow[rowIndex][1].selector}  
            id={`btn-selector-input-${scrapeIdx}-${rowIndex}`} 
            
          />

          <div className="flex items-center justify-center relative min-w-[35px] h-10 " >

            <span id={`btn-selector-input-tooltip-${theIndex}`} className={`tooltip hidden top-[-75px] ${btnSelectorOrientation}`} >
                    
              <span className="tooltip_text_main" >Specifies the CSS-selector of the button the programm will press.</span>
              <br />
              <span className="tooltip_option_text" >OPTIONS:</span> any valid CSS-selector 
        
            </span>

            <Image src='/assets/icons/info.svg' alt='html id name input tooltip icon' width={20} height={20} 
              onMouseOver={() => { showHideElement({elementId: `btn-selector-input-tooltip-${theIndex}`}) }}
              onMouseOut={() => { showHideElement({elementId: `btn-selector-input-tooltip-${theIndex}`}) }}
            />

          </div>

        </div>

        {/** Button wait after input */}
        <div id={`btn-wait-after-input-${scrapeIdx}-${rowIndex}-container`} className="flex flex-row items-center w-[25%] relative border-2 border-green-800 rounded-xl bg-slate-300 mr-[6px] " >

            <input type="number" min={3} required disabled
              value={scraperInfos.all[scrapeIdx].workflow[rowIndex][1].wait_after}  
              id={`btn-wait-after-input-${scrapeIdx}-${rowIndex}`} className="text-[14px] xl:text-[16px] pl-2 justify-center h-10  text-start pr-2 rounded-ss-xl rounded-es-xl bg-zinc-200 border-black w-full" 
              
            />

          <div className=" flex items-center justify-center relative min-w-[35px] h-10 " >

            <span id={`btn-wait-time-after-input-tooltip-${theIndex}`} className={`tooltip hidden top-[-75px] ${waitAfterOrientation}`} >
                  
              <span className="tooltip_text_main" >Specifies the amount of time the programm will wait after pressing the button.</span>
              <br />
              <span className="tooltip_option_text" >OPTIONS:</span> any positive integer less than 50 
        
            </span>

            <Image src='/assets/icons/info.svg' alt='html id name input tooltip icon' width={20} height={20} 
              onMouseOver={() => { showHideElement({elementId: `btn-wait-time-after-input-tooltip-${theIndex}`}) }}
              onMouseOut={() => { showHideElement({elementId: `btn-wait-time-after-input-tooltip-${theIndex}`}) }}
            />

          </div>

        </div>

        
        <Image src='/assets/icons/cross_r.svg' alt="delete row object" width={20} height={20} className="opacity-30" />
            
      </>
    );
  }
  /** Will display a input-fill WF. */
  else if(type === 'input-fill'){

    let inputSelectorOrientation;
    let fillContentOrientation;
    let loopOrientation;

    if(rowIndex % 2 === 0){

      inputSelectorOrientation = "left-[-170px]";
      fillContentOrientation = "left-[-170px]"
      loopOrientation = "";
    }
    else{

      inputSelectorOrientation = "right-[-120px]";
      fillContentOrientation = "right-[-120px]";
      loopOrientation = "right-[-20px]";
    }

    return (
      <>

        {/** input selector input */}
        <div id={`input-selector-input-${scrapeIdx}-${rowIndex}-container`}  className="flex flex-row items-center w-[35%] relative border-2 border-black rounded-xl bg-slate-300 mr-[12px]  " >

          <input type="text" className="text-[14px] xl:text-[16px] pl-2 justify-center h-10  text-start pr-2 rounded-ss-xl rounded-es-xl bg-zinc-200 border-black w-full" 
            required 
            disabled
            value={scraperInfos.all[scrapeIdx].workflow[rowIndex][1].selector}  
            id={`input-selector-input-${scrapeIdx}-${rowIndex}`} 
          />

          <div className=" flex items-center justify-center relative min-w-[35px] h-10 " >

            <span id={`input-selector-tooltip-${theIndex}`} className={`tooltip hidden top-[-75px] ${inputSelectorOrientation}`} >
                  
              <span className="tooltip_text_main" >Specifies the CSS-selector of the input field the programm will fill.</span>
              <br />
              <span className="tooltip_option_text" >OPTIONS:</span> any valid CSS-selector
        
            </span>

            <Image src='/assets/icons/info.svg' alt='html id name input tooltip icon' width={20} height={20} 
              onMouseOver={() => { showHideElement({elementId: `input-selector-tooltip-${theIndex}`}) }}
              onMouseOut={() => { showHideElement({elementId: `input-selector-tooltip-${theIndex}`}) }}
            />

          </div>

        </div>

        {/** input fill content input */}
        <div id={`input-fill-content-input-${scrapeIdx}-${rowIndex}-container`} className="flex flex-row items-center w-[45%] relative border-2 border-black rounded-xl bg-slate-300 mr-[6px] " >

          <input type="text" required disabled
            value={scraperInfos.all[scrapeIdx].workflow[rowIndex][1].fill_content}  
            id={`input-fill-content-input-${scrapeIdx}-${rowIndex}`} className='text-[14px] xl:text-[16px] pl-2 justify-center h-10  text-start pr-2 rounded-ss-xl rounded-es-xl bg-zinc-200 border-black w-full' 
          />

          <div className=" flex items-center justify-center relative min-w-[35px] h-10 " >

            <span id={`input-fill-content-tooltip-${theIndex}`} className={`tooltip hidden top-[-75px] ${fillContentOrientation}`} >
                  
              <span className="tooltip_text_main" >Specifies the CSS-selector of the input field the programm will fill.</span>
                <br />
                <span className="tooltip_option_text" >OPTIONS:</span> any valid text
          
            </span>

            <Image src='/assets/icons/info.svg' alt='html id name input tooltip icon' width={20} height={20} 
              onMouseOver={() => { showHideElement({elementId: `input-fill-content-tooltip-${theIndex}`}) }}
              onMouseOut={() => { showHideElement({elementId: `input-fill-content-tooltip-${theIndex}`}) }}
            />

          </div>

        </div>

        <Image src='/assets/icons/cross_r.svg' alt="delete row object" width={20} height={20} className="opacity-30" />
      </>
    );
  }
  /** Will display a wait-time WF. */
  else if(type === 'wait-time'){

    return (
      <>

        <div id={`btn-selector-input-${rowIndex}-container`} className="flex flex-row items-center w-[calc(80%+12px)] relative border-2  border-green-800 rounded-xl bg-slate-300 mr-[6px] " >

          <input type="number" min={1} className="text-[14px] xl:text-[16px] pl-2 justify-center h-10  text-start pr-2 rounded-ss-xl rounded-es-xl autofill:delay-[9999s] focus:delay-[9999s] hover:delay-[9999s] active:delay-[9999s] bg-zinc-200 border-black w-full" 
            required 
            disabled
            value={scraperInfos.all[scrapeIdx].workflow[rowIndex][1]["time_to_wait"]}  
            id={`btn-selector-input-${rowIndex}`} 
          />

          <div className=" flex items-center justify-center relative min-w-[35px] h-10 " >

            <span id={`input-loop-option-tooltip-${theIndex}`} className={`tooltip hidden top-[-55px] right-0 `} >
                  
              <span className="tooltip_text_main" >Specifies the time the programm will wait.</span>
                <br />
                <span className="tooltip_option_text" >OPTIONS:</span> any integer less than 50
          
            </span>

            <Image src='/assets/icons/info.svg' alt='html id name input tooltip icon' width={20} height={20} 
              onMouseOver={() => { showHideElement({elementId: `input-loop-option-tooltip-${theIndex}`}) }}
              onMouseOut={() => { showHideElement({elementId: `input-loop-option-tooltip-${theIndex}`}) }}
            />

          </div>

        </div>

        <Image src='/assets/icons/cross_r.svg' alt="delete row object" width={20} height={20} className="opacity-30" />
      </>
    );
  }
};

export default PreviewRowType;

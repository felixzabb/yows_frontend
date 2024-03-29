"use client";

import Image from 'next/image'; 
import Tooltip from '@components/custom/Tooltip';
import { rotateElement, showHideElement } from '@utils/htmlAbstractions';

const ScrapedDataOverlay = ({ saveAbility, currentScraperIndex, updateSavedScrapedData, scrapedData } : 
  {
    saveAbility? : boolean, 
    currentScraperIndex? : number, 
    updateSavedScrapedData? : ({ newScrapedData, scraperIdx } : { newScrapedData : ScrapedData, scraperIdx : number }) => void, 
    scrapedData: ScrapedData 
  } ) => {

  const createDownload = ({ whole, scrapeIdx } : { whole?: boolean, scrapeIdx?: number}) : void => {

    const downloadAnchor = document.createElement("a");
            
    whole ? 
      (downloadAnchor.href = URL.createObjectURL( new Blob([JSON.stringify(scrapedData, null, 2)], { type:"application/json" }))) 
      : 
      (downloadAnchor.href = URL.createObjectURL( new Blob([JSON.stringify(scrapedData[scrapeIdx], null, 2)], { type:"application/json" })))
  
    downloadAnchor.download = `ScraperResults-[${Date.now()}].json`; // work on naming
    downloadAnchor.click();
    downloadAnchor.remove();
  }; 

  return (
    <div className='min-w-[1090px] max-w-[1090px] h-auto flex flex-col items-center justify-start max-h-[70dvh] overflow-y-scroll pr-[10px]' >
      
      <aside className="relative w-[100%] min-h-[60px]  c_row_elm justify-start mt-5 gap-x-3 p-1 " >

        <div className='flex flex-row items-center gap-x-4 justify-start'>

          <div className="relative group flex items-center justify-center min-w-[30px] h-full" >

            <Tooltip xOrientation='left' yOrientation="top" content={"Copy ALL"} /> 

            <Image
              src={"/assets/icons/generic/copy.svg"}
              width={36} height={36}
              alt={"Copy all scraped data"}
              onClick={() => { navigator.clipboard.writeText(JSON.stringify(scrapedData, null, 2)); }} 
            />

          </div>

          <div className="relative group flex items-center justify-center min-w-[30px] h-full" >

            <Tooltip xOrientation='left' yOrientation="top" content={"Download ALL"} /> 

            <Image
              src={"/assets/icons/scrape/download.svg"}
              width={36} height={36}
              alt={"Download all scraped data"}
              onClick={() => { createDownload({ whole: true }); }} 
            />

          </div>

        </div> 

        {
          saveAbility &&
            (
              <>
                <hr className="h-[40px] w-[2px] bg-gray-400 " />
                <div className="relative group flex items-center justify-center min-w-[30px] h-full mb-[-2px]" >

                  <Tooltip xOrientation='right' yOrientation="top" content={"Save scraped data."} /> 

                  <Image
                    src={"/assets/icons/scrape/save.svg"}
                    width={40} height={40}
                    alt={"Save all scraped data"}
                    onClick={() => { updateSavedScrapedData({ scraperIdx: currentScraperIndex, newScrapedData: scrapedData }); }} 
                  />

                </div>
              </>
            )
        }

      </aside>

        {
          Array.from(scrapedData.keys()).map((scrapeIdx) => (

            <section key={`scrape-wrapper-${scrapeIdx}`} className=" flex flex-col items-center min-w-full max-w-full h-auto mt-2 p-3 border-[2px] border-black rounded-md" >

              <aside className="c_row_elm justify-between w-full gap-x-5 px-2 rounded-md border-1 border-[black] min-h-[50px] " >

                <div className='flex flex-row items-center gap-x-4 justify-start' >

                  <h3 className="text-[18px] font-[600]" > {`Scrape: ${Number(scrapeIdx) + 1} `}</h3>

                  <h3 className="text-[18px] font-[600]" > {`Runs: ${scrapedData[scrapeIdx].scrape_runs.length} `}</h3>

                  <h3 className="text-[18px] font-[600]" > {`Scrape ${Number(scrapeIdx) + 1}: `}</h3>

                </div>

                <div className=' flex flex-row items-center gap-x-4 justify-start'>

                  <div className="relative group flex items-center justify-center min-w-[30px] h-full" >

                    <Tooltip xOrientation='right' yOrientation='bottom' content={"Copy current scrape"} /> 

                    <Image
                      src={"/assets/icons/generic/copy.svg"}
                      width={36} height={36}
                      alt={"Copy scraped data"}
                      onClick={() => { navigator.clipboard.writeText( JSON.stringify(scrapedData[scrapeIdx])); }} 
                    />

                  </div>

                  <div className="relative group flex items-center justify-center min-w-[30px] h-full" >

                    <Tooltip xOrientation='right' yOrientation='bottom' content={"Download current scrape"} /> 

                    <Image
                      src={"/assets/icons/scrape/download.svg"}
                      width={36} height={36}
                      alt={"Download scraped data"}
                      onClick={() => { createDownload({ scrapeIdx: scrapeIdx }); }} 
                    />

                  </div>

                  <hr className="h-[40px] w-[2px] bg-gray-400 " />

                  <div className="relative group flex items-center justify-center min-w-[30px] h-full" >

                    <Tooltip xOrientation='right' yOrientation='bottom' content={"Toggle visibility"} /> 

                    <Image
                      id={`toggle-dd-btn-${scrapeIdx}`}
                      width={40} height={40} 
                      src="/assets/icons/generic/updownarrow.svg"
                      alt={"Toggle dropdown"}
                      onClick={() => { 
                        showHideElement({elementId: `main-scraped-data-list-${scrapeIdx}`}); 
                        showHideElement({elementId: `meta-data-separator-${scrapeIdx}`}); 
                        rotateElement({elementId : `toggle-dd-btn-${scrapeIdx}`, degrees : "180"}); 
                      }}
                    />

                  </div>

                </div>

              </aside>

              <hr id={`meta-data-separator-${scrapeIdx}`} className='hidden border-[1px] h-[1px] mt-1 border-black dark:border-white w-full rounded-3xl opacity-20' />

              <ul id={`main-scraped-data-list-${scrapeIdx}`} className='w-full h-auto px-3 hidden flex flex-col items-center gap-y-1' >
                {

                  Array.from(scrapedData?.[scrapeIdx].scrape_runs.keys()).map((scrapeIdx) => (

                    <li key={`data-scrape-wrapper-${scrapeIdx}`} className='h-auto w-full flex flex-col items-center' >
                      
                      <ul className='h-auto w-full flex flex-col items-center' >

                        <li className='text-[18px] font-[600] my-3 '>
                          {`RUN ${Number(scrapeIdx) + 1 }`}
                        </li>

                        {
                          Array.from(scrapedData?.[scrapeIdx].scrape_runs[scrapeIdx].keys()).map((dataPoint) => (

                              <li key={`fr-${dataPoint}`} id={`li-${dataPoint}`} className="flex flex-row items-center w-full py-3 border-b-2 border-black" >

                                <h4 className="text-[18px] font-[600] mr-2 text-start pr-2" >
                                  {String(Number(dataPoint) + 1)}:
                                </h4>
                                
                                <h4  className='w-full text-start' >
                                  {scrapedData[scrapeIdx].scrape_runs[scrapeIdx][dataPoint]}
                                </h4>
                              </li>
                            )
                          )
                        }

                      </ul>
                    </li>
                    )
                  )
                }
              </ul>
            </section>
            ) 
          )
        }
    </div>
  );
};

export default ScrapedDataOverlay;
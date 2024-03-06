
import { Fragment, useEffect, useState } from 'react';
import Image from 'next/image'; 
import { putToDb } from '@utils/api_funcs';
import { rotateElement, showHideElement } from '@utils/generalFunctions';
import { ClockLoader } from "react-spinners";
import { useContext } from 'react';
import { appContext } from '@app/layout';
import Tooltip from '@components/design/Tooltip';
import { ScraperInfoResults } from '@custom-types';

const ScrapedDataOverlay = ({ expectedWaitTime, saveAbility, currentScrapeId, currentScrapeIndex, updateSavedData } : 
                        { expectedWaitTime? : number, saveAbility : boolean, currentScrapeId? : string, currentScrapeIndex? : number, updateSavedData? : ({scrapedData, getIdx } : {scrapedData : ScraperInfoResults, getIdx : number}) => void } ) => {

  const context = useContext(appContext);

  const emptyResults : ScraperInfoResults = {
    empty: true,
    0 : {
      scrape_runs : {0 : []}
    }
  };

  const [scrapedData, setScrapedData] = useState<ScraperInfoResults>(emptyResults);

  const saveResults = async () : Promise<void> => {

    if(!saveAbility){ return; }

    const confirmation : boolean = confirm("Are you sure you want to save the data, this will overwrite any existing data?");

    if(!confirmation){return; }

    const putData = {filter : {_id: currentScrapeId}, update : {"$set" : {"results" : scrapedData}}}

    await putToDb({apiKey: "felix12m", dbName: "test_runs", collectionName: "scrape_info_saves", data: putData});
    
    updateSavedData({scrapedData: scrapedData, getIdx: currentScrapeIndex});
    
    return;
  };

  const createDownload = ({all, resIdx} : {all : boolean, resIdx : number}) : void => {

    var downloadAnchor = document.createElement("a");
            
    all ? 
      (downloadAnchor.href = URL.createObjectURL( new Blob( [JSON.stringify(scrapedData)], { type:"application/json" } ) )) 
      : 
      (downloadAnchor.href = URL.createObjectURL( new Blob( [JSON.stringify(scrapedData[resIdx])], { type:"application/json" } ) ))
  
    downloadAnchor.download = `Scraperesults-[${Date.now()}].json`; // work on naming
    downloadAnchor.click();
    downloadAnchor.remove();
  
    return;
  };

  useEffect(() => {
    setScrapedData(context.appContextData.overlayChildData.results)
  }, [context])

  if(scrapedData === undefined || scrapedData === null){return(<></>); }

  if(scrapedData.empty){
    return(
      <>
        <ClockLoader size={200} speedMultiplier={2} />
        <h3>{expectedWaitTime}</h3>
      </>
    );
  };

  return (
    <div id="scrape-results-wrapper" className='min-w-[1090px] max-w-[1090px] h-auto flex flex-col items-center justify-start max-h-[70dvh] overflow-y-scroll pr-[10px]' >
      <aside id={`global-options-wrapper`} className="relative w-[100%] min-h-[60px]  c_row_elm justify-start mt-5 gap-x-3 p-1 " >

        <div id={`global-options`} className='flex flex-row items-center gap-x-4 justify-start'>

          <div className="relative group flex items-center justify-center min-w-[30px] h-full" >

            <div className=" h-auto w-auto hidden group-hover:flex " >
              <Tooltip xOrientation='right' yOrientation="bottom" content={"Copy ALL"} /> 
            </div>

            <Image
              src={"/assets/icons/generic/copy.svg"}
              id={`copy-all-as-json`}
              width={36}
              height={36}
              alt={"Copy all scraped data"}
              className="cursor-pointer" 
              onClick={() => { navigator.clipboard.writeText(JSON.stringify(scrapedData)); }} 
            />

          </div>

          <div className="relative group flex items-center justify-center min-w-[30px] h-full" >

            <div className=" h-auto w-auto hidden group-hover:flex " >
              <Tooltip xOrientation='right' yOrientation="bottom" content={"Download ALL"} /> 
            </div>

            <Image
              src={"/assets/icons/scrape/download.svg"}
              id={`download-all-as-json`}
              width={36}
              height={36}
              alt={"Download all scraped data"}
              className="cursor-pointer" 
              onClick={() => { createDownload({all: true, resIdx : null}); }} 
            />

          </div>
        </div> 

        {
          saveAbility ? 
            (
              <>
                <hr id="scraped-data-global-options-separator" className="h-[40px] w-[2px] bg-gray-400 " />
                <div className="relative group flex items-center justify-center min-w-[30px] h-full mb-[-2px]" >

                  <div className=" h-auto w-auto hidden group-hover:flex " >
                    <Tooltip xOrientation='right' yOrientation="bottom" content={"Save scraped data."} /> 
                  </div>

                  <Image
                    src={"/assets/icons/scrape/save.svg"}
                    id={`save-scraped-data`}
                    width={40}
                    height={40}
                    alt={"Save all scraped data"}
                    className="cursor-pointer" 
                    onClick={() => { saveResults(); }} 
                  />

                </div>
              </>
            )
            :
            ( <></> )
        }

      </aside>

        {
          [...Object.keys(scrapedData)].map((resultIndex) => {

            if(resultIndex === "empty"){return;}
            
            return (

              <section key={`scrape-wrapper-${resultIndex}`} id={`scrape-wrapper-${resultIndex}`} className=" flex flex-col items-center min-w-full max-w-full h-auto mt-2 p-3 border-[2px] border-black rounded-md" >

                <aside id={`scrape-options-and-meta-${resultIndex}`} className="c_row_elm justify-between w-full gap-x-5 px-2 rounded-md border-1 border-[black] min-h-[50px] " >

                  <div id={`scrape-meta-${resultIndex}`} className='flex flex-row items-center gap-x-4 justify-start' >
                    <h3 id={`scrape-index-${resultIndex}`} className="text-[18px] font-[600]" > {`Scrape: ${Number(resultIndex) + 1} `}</h3>
                    <h3 id={`amount-scrape-runs-${resultIndex}`} className="text-[18px] font-[600]" > {`Runs: ${Object.keys(scrapedData[resultIndex].scrape_runs).length} `}</h3>
                    <h3 className="text-[18px] font-[600]" > {`Scrape ${Number(resultIndex) + 1}: `}</h3>
                  </div>

                  <div id={`scrape-meta-options-${resultIndex}`} className='flex flex-row items-center gap-x-4 justify-start'>

                    <div className="relative group flex items-center justify-center min-w-[30px] h-full" >

                      <div className="h-auto w-auto hidden group-hover:flex " >
                        <Tooltip yOrientation='top' content={"Copy current scrape"} /> 
                      </div>

                      <Image
                        src={"/assets/icons/generic/copy.svg"}
                        id={`copy-as-json-${resultIndex}`}
                        width={36}
                        height={36}
                        alt={"Copy scraped data"}
                        className="cursor-pointer" 
                        onClick={() => { navigator.clipboard.writeText( JSON.stringify(scrapedData[resultIndex])); }} 
                      />

                    </div>

                    <div className="relative group flex items-center justify-center min-w-[30px] h-full" >

                      <div className="h-auto w-auto hidden group-hover:flex " >
                        <Tooltip yOrientation='top' content={"Download current scrape"} /> 
                      </div>

                      <Image
                        src={"/assets/icons/scrape/download.svg"}
                        id={`download-as-json-${resultIndex}`}
                        width={36}
                        height={36}
                        alt={"Download scraped data"}
                        className="cursor-pointer" 
                        onClick={() => { createDownload({all: false, resIdx: Number(resultIndex)}); }} 
                      />

                    </div>

                    <hr id={`scraped-data-options-separator-${resultIndex}`} className="h-[40px] w-[2px] bg-gray-400 " />

                    <div className="relative group flex items-center justify-center min-w-[30px] h-full" >

                      <div className="h-auto w-auto hidden group-hover:flex " >
                        <Tooltip content={"Toggle visibility"} /> 
                      </div>

                      <Image 
                        id={`toggle-dd-btn-${resultIndex}`} 
                        className="overlay_toggle_dd_btn cursor-pointer " 
                        width={40} height={40} 
                        src="/assets/icons/generic/updownarrow.svg"
                        alt={"dropwdown image"}
                        onClick={() => { showHideElement({elementId: `main-scraped-data-list-${resultIndex}`}); showHideElement({elementId: `meta-data-separator-${resultIndex}`}); rotateElement({elementId : `toggle-dd-btn-${resultIndex}`, degrees : "180"}); }}
                      />

                    </div>

                  </div>

                </aside>

                <hr id={`meta-data-separator-${resultIndex}`} className='hidden border-[1px] h-[1px] mt-1 border-black dark:border-white w-full rounded-3xl opacity-20' />

                <ul id={`main-scraped-data-list-${resultIndex}`} className='w-full h-auto px-3 hidden flex flex-col items-center gap-y-1' >
                  {

                    [...Object.keys(scrapedData[resultIndex].scrape_runs )].map((scrapeIndex) => {

                      return (
                        <li key={`data-scrape-wrapper-${scrapeIndex}`} id={`data-scrape-wrapper-${scrapeIndex}`} className='h-auto w-full flex flex-col items-center' >
                          <ul key={`data-scrape-${scrapeIndex}`} id={`data-scrape-${scrapeIndex}`} className='h-auto w-full flex flex-col items-center' >

                            <h3 id={`run-index-descriptor-${scrapeIndex}`} className='text-[18px] font-[600] my-3 '  > {`RUN ${Number(scrapeIndex) + 1 }`} </h3>

                            {
                              [...Object.keys( scrapedData[resultIndex].scrape_runs[scrapeIndex] )].map((dataPoint) => {

                                return(
                                  <Fragment key={`fr-${dataPoint}`}>
                                    <li id={`li-${dataPoint}`} className="flex flex-row items-center w-full my-3" >
                                      <h4 className="text-[18px] font-[600] mr-2 text-start pr-2" >
                                        {String(Number(dataPoint) + 1)}:
                                      </h4>
                                      
                                      <h4 id={`data-point-${dataPoint}`} className='w-full text-start' >
                                        {scrapedData[resultIndex].scrape_runs[scrapeIndex][dataPoint]}
                                      </h4>
                                    </li>
                                    <hr className="w-[100%] border-black border-1 " />
                                  </Fragment>
                                )

                              })
                            }

                          </ul>
                        </li>
                      )
                      })
                  }
                </ul>
              </section>
            ) 
          })
        }
    </div>
  );
};

export default ScrapedDataOverlay;
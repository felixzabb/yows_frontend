
import { Fragment } from 'react';
import Image from 'next/image'; 
import { putToDb } from '@utils/api_funcs';
import { rotateElement, showHideElement } from '@utils/generalFunctions';

const ResultOverlay = ( { results, saveAbility, currentScrapeId, getAllSavedScrapes } : 
                        { results : object, saveAbility : boolean, currentScrapeId? : string , getAllSavedScrapes? : () => Promise<void> } ) => {

  const saveResults = async () : Promise<void> => {

    const confirmation : boolean = confirm("Are you sure you want to save the data?");

    if(!confirmation){return; }

    const putData = {filter : {_id: currentScrapeId}, update : {"$set" : {"results" : results}}}

    await putToDb({apiKey: "felix12m", dbName: "test_runs", collectionName: "scrape_info_saves", data: putData});

    window.document.getElementById("overlay-section").classList.add("hidden");
    
    await getAllSavedScrapes();
    
    return;
  };

  const createDownload = ({all, resIdx} : {all : boolean, resIdx : number}) : void => {

    var downloadAnchor = document.createElement("a");
            
    all ? 
      (downloadAnchor.href = URL.createObjectURL( new Blob( [JSON.stringify(results)], { type:"application/json" } ) )) 
      : 
      (downloadAnchor.href = URL.createObjectURL( new Blob( [JSON.stringify(results[resIdx])], { type:"application/json" } ) ))
  
    downloadAnchor.download = `Scraperesults-[${Date.now()}].json`; // work on naming
    downloadAnchor.click();
    downloadAnchor.remove();
  
    return;
  };

  return (
    <>
      <aside id={`result-ov-main-options-bar`} className="w-[100%] h-[60px] c_row_elm justify-start mt-5 gap-x-3 border-2 p-1 rounded-xl border-[purple] " >
        
        <button id={`copy-all-btn`} className="text-[#043cf3] sub_text " onClick={() => { navigator.clipboard.writeText(JSON.stringify(results)); }} >
          Copy ALL
        </button>

        <button id={`download-all-btn`} className="text-[#043cf3] sub_text " onClick={() => { createDownload({all: true, resIdx : null}); }} >
          Download ALL
        </button>

        {
          saveAbility ? 
            (
              <button className='purple_btn' onClick={(e) => {saveResults();}} >
                Save Results
              </button>
            )
            :
            ( <></> )
        }

      </aside>

        {
          [...Object.keys(results)].map((resultIndex) => {
            
            return (

              <section id={`result-${resultIndex}`} className="c_col_elm w-full mt-3 p-3 border-[2px] border-black rounded-md" key={`result-${resultIndex}`} >

                <aside id={`options-bar`} className="c_row_elm justify-between w-full gap-x-5 px-2 rounded-md border-1 border-[black] min-h-[50px] " >

                  <p className="sub_text" > {`Scrape ${Number(resultIndex) + 1}: `}</p>

                  <button id={`copy-btn`} className="text-[#043cf3] sub_text " onClick={() => { navigator.clipboard.writeText( JSON.stringify(results[resultIndex])); }} >
                    Copy
                  </button>

                  <button id={`download-btn`} className="text-[#043cf3] sub_text " onClick={() => { createDownload({all: false, resIdx: Number(resultIndex)}); }} >
                    Download
                  </button>

                  <Image id={`toggle-dd-btn-${resultIndex}`} 
                    className="overlay_toggle_dd_btn cursor-pointer " 
                    width={40} height={40} 
                    src="/assets/icons/updownarrow.svg"
                    alt={"dropwdown image"}
                    onClick={() => { showHideElement({elementId: `result-item-list-${resultIndex}`}); rotateElement({elementId : `toggle-dd-btn-${resultIndex}`, degrees : "180"}); }}
                  />

                </aside>

                <ul id={`result-item-list-${resultIndex}`} className='w-auto h-auto px-3 hidden' >
                  {

                    [...Object.keys( results[resultIndex].scrape_runs )].map((scrapeIndex) => {

                      return (
                        <Fragment key={`fragment-${scrapeIndex}`} >

                            <h2 className='text-[28px] font-[600] my-3 '  > {`Scrape-run: ${Number(scrapeIndex) + 1 }`} </h2>

                            {
                              [...Object.keys( results[resultIndex].scrape_runs[scrapeIndex] )].map((dataPoint) => {

                                return(
                                  <>
                                    <li id={`li-${dataPoint}`} className="c_row_elm items-center w-full my-3" key={`li-${dataPoint}`} >
                                      <p className="sub_text mr-2 text-start  pr-2" >
                                        {String(Number(dataPoint) + 1)}:
                                      </p>
                                      
                                      <p id={`data-point-${dataPoint}`} className='w-full text-start' >
                                        {results[resultIndex].scrape_runs[scrapeIndex][dataPoint]}
                                      </p>
                                    </li>
                                    <hr className="w-[100%] border-black border-1 " />
                                  </>
                                )

                              })
                            }

                        </Fragment>
                      )
                      })
                  }
                </ul>
              </section>
            ) 
          })
        }
    </>
  );
};

export default ResultOverlay;
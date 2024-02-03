"use client";

import { putToDb, deleteScrape, pullSavedScrapes, runScrape } from "@utils/api_funcs";
import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ScaleLoader } from "react-spinners";
import PreviewWS from "./PreviewWS";
import ResultOverlay from "./ResultOverlay";
import { adjustTextareaHeight, showHideElement } from "@utils/generalFunctions";
import { emptyResults } from "@utils/defObjects";


const SavedScrapes = ({ User }) => {

  const [ data, setData ] = useState(null);
  const [ update, setUpdate ] =useState(1);
  const [ maxScrapes, setMaxScrapes ] = useState("");
  const [ runResults, setRunResults ] = useState(emptyResults);
  const [ currentPreview, setCurrentPreview ] = useState("");
  const [ currentScrapeId, setCurrentScrapeId ] = useState("");

  const { push } = useRouter();

  const useScraper = ({useIdx} : {useIdx : number}) : void => {

    window.sessionStorage.setItem("passedSavedObject", JSON.stringify(data[useIdx].scrape_object))
    window.sessionStorage.setItem("usePassed", "1")

    push(`/new-scraper`);

    return;
  };

  const closeAllPreviews = () : void => {

    const possiblePreview = window.document.getElementById(`preview-${currentPreview}`);

    if(possiblePreview === null){return;}
    if(!possiblePreview.classList.contains("hidden")){
      possiblePreview.classList.add("hidden");
    }

    return;
  };

  const deleteSavedScrape = async ({getIdx} : {getIdx : number}) : Promise<void> => {

    const confirmation = confirm("Are you sure you want to delete this scrape?");

    if(!confirmation){return;}
      
    await deleteScrape({apiKey: "felix12m", scrapeId: data[getIdx]._id, userId: User.id});

    await getAllSavedScrapes();

    setUpdate((prevUpdate) => { return (prevUpdate +1 ) % 2});

    return;
  };

  const getAllSavedScrapes = async () : Promise<void> => {

    const pull_operation = await pullSavedScrapes({apiKey: "felix12m", userId: User.id});

    setData(pull_operation.found);
    setMaxScrapes(pull_operation.max_scrapes);

    return;
  };

  const copyScrapeId = ({getIdx} : {getIdx : number}) : void => {

    const idToCopy = data[getIdx]._id;

    navigator.clipboard.writeText(String(idToCopy));

    return;
  };

  const editScrape = async ({getIdx} : {getIdx : number}) : Promise<void> => {

    const put_data = {filter : {_id : data[getIdx]._id}, update: {"$set" : {"name" : data[getIdx].name, "description" : data[getIdx].description}}};

    await putToDb({apiKey: "felix12m", dbName: "test_runs", collectionName: "scrape_info_saves", data: put_data});

    return;
  };

  const handleScrapeChange = ({getIdx, pName, value} : {getIdx : number, pName : string, value : any}) : void => {

    let dataCopy = data;

    dataCopy[getIdx][pName] = value;

    setData(dataCopy);

    if(data != undefined && data != null){

      const allKeys = Object.keys(data);
      
      for (const key of allKeys){

        adjustTextareaHeight({elementId: `desc-textarea-${key}`});
      }}

    
    setUpdate((prevUpdate) => { return (prevUpdate +1 ) % 2});

    return;
  };

  const runWebScrape = async ({getIdx} : {getIdx : number}) : Promise<void> => {
    
    // prepare the user by showing loading overlay here

    setCurrentScrapeId(data[getIdx]._id);

    const apiKey = 'felix12m';
    const url = `http://localhost:8000/api/getdata/webscrape/${apiKey}`;

    let bodyData = data[getIdx].scrape_object;
    bodyData.args.amount_scrapes_global = Object.keys(data[getIdx].scrape_object.all).length; // value is passed to decide if multithreading is 'possible'

    bodyData = JSON.stringify(bodyData);

    const run_operation = await runScrape({apiKey: "felix12m", userId: User.id, data: bodyData})

    setRunResults(run_operation.results); 
    showHideElement({elementId: "overlay-section"});
    setUpdate((prevUpdate) => { return (prevUpdate +1 ) % 2});
    
    return;
  };
  
  var savedScrapesInitialFetch = true;

  useEffect(() => {
    
    if (savedScrapesInitialFetch){
      getAllSavedScrapes();
      savedScrapesInitialFetch = false;
    }

    if(data === undefined || data === null){return; }

    const allKeys = Object.keys(data);
    
    for (const key of allKeys){ adjustTextareaHeight({elementId: `desc-textarea-${key}`}); }

  }, []);


  if(data !== null && data?.[0] === undefined){
    return (
      <div className="c_col_elm w-full h-auto " >
        <h1 className="subhead_text pb-1" > You have no saved scrapes</h1>

        <hr className="w-[95%] bg-black h-[2px] mb-4 " />
      </div>

    );
  }

  return (

    <div className="c_col_elm w-full h-auto " >

      <section id={"overlay-section"} className={"fixed top-[5dvh] left-[5dvw] w-[90dvw] h-[90dvh] hidden z-[15] bg-zinc-200 rounded-xl px-5 pb-5 overflow-auto opacity-100 flex flex-col items-center justify-start border-[5px] border-[blueviolet] "} >
        
        {/** Options for interacting with the overlay(closing etc...) */}
        <aside id={`dialog-ov-main-options-bar`} className="w-[100%] h-[60px] c_row_elm justify-end mt-5 gap-x-3 p-1 " >

          <button id={`close-ov-btn`} className="purple_btn " onClick={() => { showHideElement({elementId: "overlay-section"}); setUpdate((prevUpdate) => { return (prevUpdate +1 ) % 2});}} >
            Close
          </button>

        </aside>

        <ResultOverlay results={runResults} saveAbility={true} currentScrapeId={currentScrapeId} getAllSavedScrapes={getAllSavedScrapes} />

      </section>

      <h1 className="subhead_text" >
        {
          data === null ?
            (
              "Pulling saved scrapes..."
            )
            :
            (
              "All your saved scrapes"
            )
        }
      </h1>

      <div className="c_row_elm w-full justify-start px-[2.5%] mb-1 gap-x-5 " >
        {
          data !== null && 
            (
              <h2 className="sub_text px-1" >
                <span className="font-[700] " > Amount: </span> { Object.keys(data).length } <span> {`of ${maxScrapes}`}</span>
              </h2>
            )
        }
      </div>

      <hr className="w-[95%] bg-black h-[2px] mb-4 " />

      <div className="c_col_elm w-full h-auto gap-y-5 " >

        {
          data === null && (

            <ScaleLoader height={50} width={4} margin={3} speedMultiplier={2} color="#8A2BE2"  />
          )
        }
        
        {
          data !== null && [...data.keys()].map((saveIdx) => {

            return(
              <section className=" relative w-[90%] h-auto c_col_elm border-[3px] border-[blueviolet] bg-stone-50 rounded-xl px-2 " key={saveIdx} >

                <aside className="c_row_elm w-full h-[60px] gap-x-5 " >

                  <button onClick={() => { showHideElement({elementId: `data-pack-${saveIdx}`}); setUpdate((prevUpdate) => { return (prevUpdate +1 ) % 2});}} className="bg-purple-400  p-1 px-2 rounded-[6px] h-[48px] text-[16px] font-[600] w-[95px] " >
                    {
                      window.document.getElementById(`data-pack-${saveIdx}`) != undefined ?
                        (
                          window.document.getElementById(`data-pack-${saveIdx}`).classList.contains("hidden") ? 
                          (
                            <>
                              {"Show Data"}
                            </>
                          )
                          :
                          (
                            <>
                              {"Hide Data"}
                            </>
                          
                          )
                        )
                        :
                        (<>{"Show Data"}</>)
                    }
                  </button>

                  <button onClick={() => { copyScrapeId({getIdx: saveIdx}); }} className="purple_btn" >
                    Copy ID
                  </button>


                  <button onClick={() => { useScraper({useIdx: saveIdx}); }} className="purple_btn">
                    Edit
                  </button>

                  <button onClick={() => { closeAllPreviews(); showHideElement({elementId: `preview-${saveIdx}`}); setUpdate((prevUpdate) => { return (prevUpdate +1 ) % 2}); setCurrentPreview(saveIdx); }} className="purple_btn">
                    Show preview
                  </button>

                  {
                    Object.keys(data[saveIdx].results).length == 0 ?
                      (
                        <button className="purple_btn brightness-75" disabled >
                          Results
                        </button>
                      )
                      :
                      (
                        <button className="purple_btn" onClick={() => { setRunResults(data[saveIdx].results); showHideElement({elementId: "overlay-section"}); setUpdate((prevUpdate) => { return (prevUpdate +1 ) % 2});}} >
                          Results
                        </button>
                      )
                  }

                  <button className="purple_btn" onClick={() => { runWebScrape({getIdx: saveIdx}); }} >
                    Run
                  </button>

                  <Image src='/assets/icons/edit.svg' alt="delete saved scrape icon" width={35} height={35} className=" cursor-pointer"
                    onClick={() => { editScrape({getIdx: saveIdx}); }} 
                  />

                  <h2 className="text-[18px] font-[Arial] w-fit  text-start c_row_elm whitespace-pre-wrap " > <p className="font-[600]" >{"Name: "} </p>  {data[saveIdx].name}</h2>


                  

                  <Image src='/assets/icons/trash_can.svg' alt="delete saved scrape icon" width={40} height={40} className="absolute right-2 cursor-pointer"
                    onClick={() => { deleteSavedScrape({getIdx: saveIdx}); }} 
                  />

                </aside>

                <div id={`data-pack-${saveIdx}`} className="flex flex-col items-start w-full h-auto gap-x-4 justify-evenly hidden py-3 " >
                    <h2 className="text-[18px] font-[Inter] w-[90px] text-start c_row_elm whitespace-pre-wrap " > <p className="font-[600]" >{"Scrape: "} </p>  

                      {String(Number(saveIdx) + 1)}

                    </h2>
                    <br />
                    <h2 className="text-[18px] font-[Arial] w-full text-start c_row_elm whitespace-pre-wrap " > <p className="font-[600]" >{"Name: "} </p>
                    
                      <input maxLength={32} value={data[saveIdx].name} className="w-full text-start px-2 bg-transparent" onChange={(e) => { handleScrapeChange({getIdx: saveIdx, pName: "name", value: e.target.value}); }} />
                      
                    </h2>
                    <br />
                    <h2 className="text-[18px] font-[Arial] w-[95%] h-auto text-start pl-1 flex flex-col items-start whitespace-pre-wrap break-all " > <p className=" ml-[-4px] font-[600] min-w-[80px]" >{"Description: "} </p>   
                      
                      <textarea maxLength={512} id={`desc-textarea-${saveIdx}`} className="w-full text-start px-1 bg-transparent " value={data[saveIdx].description} onChange={(e) => { handleScrapeChange({getIdx: saveIdx, pName: "description", value: e.target.value}); }} />
                    
                    </h2>
                    <br />
                    <h2 className="text-[18px] font-[Arial] w-full text-start c_row_elm whitespace-pre-wrap " > <p className="font-[600]" >{"Runtime: "} </p>  {data[saveIdx].runtime + "sec"}</h2>
                    
                </div>

                <div id={`preview-${saveIdx}`} className="absolute top-1 flex flex-col items-center w-fit max-w-[90dvw] min-w-[80dvw] h-auto max-h-[75dvh] p-3 bg-zinc-200 shadow-[0px_3px_20px_#555150] hidden overflow-auto rounded-xl z-10 " >

                  <Image src={"/assets/icons/cross_r.svg"} alt="close preview btn" width={40} height={40} className="mb-3 cursor-pointer "  onClick={ () => { showHideElement({elementId: `preview-${saveIdx}`}); setUpdate((prevUpdate) => { return (prevUpdate +1 ) % 2});}} />
                  <PreviewWS theIndex={saveIdx}  previewData={{info: data[saveIdx].scrape_object, amount: Object.keys(data[saveIdx].scrape_object.all).length}} />
                  
                </div>
                     
              </section>
            );

          })
        }
      </div>
    </div>
    
  );
};

export default SavedScrapes;
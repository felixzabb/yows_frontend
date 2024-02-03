"use client"

import { useState } from "react";

const DialogOverlay = ({ results, load, type, generateExport } : {results : object, 
                                                                  load : ({id, resultsNeeded, confimNeeded} : {id : string | (() => string), resultsNeeded : boolean, confimNeeded : boolean}) => Promise<void>, 
                                                                  type : string, 
                                                                  generateExport : ({name, description, withRes} : {name : string | (() => string), description : string | (() => string), withRes : boolean}) => Promise<void>}) => {

  const [ withResults, setWithResults ] = useState(false);
  const [ loadWithResults, setLoadWithResults ] = useState(false);


  const adjustTextareaHeight = ({elementId} : {elementId : string}) => {

    const element = document.getElementById(elementId)

    element.style.height = "1px"
    element.style.height = (element.scrollHeight + 25)+"px";

    return;
  };

  const returnInputElementValue = ({elementId} : {elementId : string}) : string => {

    const inputElement = window.document.getElementById(elementId) as HTMLInputElement | HTMLTextAreaElement;
    return inputElement.value;
  }

  if (type == "loadScrape") return (

    <div id={`dialog-ov-container`} className='c_col_elm gap-y-3 mt-3' >

      <form id={`input-form`} className="c_col_elm justify-start gap-y-8 " >

        <p className="text-[20px] font-[600] " >
          To retrieve an export, please enter the ID given to you.
        </p>

        <div className="c_row_elm w-full h-auto gap-x-4 p-1" >
          <input id={`dialog-ov-id-input`} className='w-[50%] text-start border-2 border-black rounded-lg bg-stone-200 p-1 h-[40px]   ' required placeholder='ID' />

          <label className="text-[16px] font-[600] c_row_elm gap-3 justify-center" > Load results (if possible):
            <input id={"dialog-ov-results-needed-input"}  type="checkbox" className="w-[20px] h-[20px]" onChange={(e) => { setLoadWithResults(e.target.checked); }} />
          </label>
        </div>
        
        <button id={`submit-link-btn`} className='purple_btn' onClick={(e) => { e.preventDefault(); load({id: returnInputElementValue({elementId: "dialog-ov-id-input"}), resultsNeeded: loadWithResults, confimNeeded: true});}} >
          Submit
        </button>
      </form>

    </div>
  )

  else if (type == "exportScrape") 
  {
    if(results === null || results === undefined){ return;}
    return (
    
    <form id={`input-form`} className="c_col_elm justify-start gap-y-8 mt-3 w-full h-full " >

      <h2 className="text-[20px] font-[600] " >
        Please fill in the information.
      </h2>

      <input maxLength={32} placeholder={"Name"} id={"export-scrape-ov-name"} className='min-w-[60%] w-auto text-start border-2 border-black rounded-lg bg-stone-200 p-1 h-[40px]' required  />
      
      <textarea maxLength={512}
        placeholder={"Description"} 
        id={"export-scrape-ov-description"} 
        className="min-w-[60%] w-auto h-auto min-h-[40%] text-start p-1 bg-stone-300 border-black rounded-s-none rounded-es-lg rounded-se-lg " 
        onChange={(e) => { adjustTextareaHeight({elementId: e.target.id}); }} />
      {
        Object.keys(results).length == 0 ? 
          (
            <label className="text-[16px] font-[600] c_row_elm gap-3 justify-center" > Save Results:
              <input id={"dialog-ov-save-results-input"}  type="checkbox" className="w-[20px] h-[20px] brightness-50 cursor-not-allowed " disabled  />
            </label>
          )

          :

          (
            <label className="text-[16px] font-[600] c_row_elm gap-3 justify-center" > Save Results:
              <input id={"dialog-ov-save-results-input"}  type="checkbox" className="w-[20px] h-[20px] " onChange={(e) => {setWithResults(e.target.checked); }}  />
            </label>
          )
      }
      
      <button id={`submit-link-btn`} className='purple_btn' onClick={(e) => { e.preventDefault(); generateExport({ name: returnInputElementValue({elementId: "export-scrape-ov-name"}), description: returnInputElementValue({elementId: "export-scrape-ov-description"}), withRes: withResults});}} >
        Submit
      </button>

    </form>
  )}
};

export default DialogOverlay;

import { ScraperInfos } from "@custom-types";
import Image from "next/image";

const LoopContainer = ({scrapeIdx, scraperInfos, handleLoopChange, deleteLoop } : 
  { 
    scrapeIdx : number
    scraperInfos : ScraperInfos
    handleLoopChange : ({scrapeIdx, paramName, value} : {scrapeIdx : number, paramName : string, value : number}) => void
    deleteLoop : ({scrapeIdx} : {scrapeIdx : number}) => void
  }) => {

  

  return (
    <div id={`loop-container-${scrapeIdx}`} className={" hidden w-[90%] h-fit flex flex-col gap-y-2 my-3 items-center relative justify-start p-2 shadow-lg rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg border-gray-600 dark:border-gray-300 border-2"} >

      <h3 id="loop-heading" className="text-[20px] font-[600] " >
        {"Please, define your loop here:"}
      </h3>

      <div id="loop-wrapper" className="w-full h-full flex flex-row items-end gap-x-6 justify-center" >

        <div id="loop-start-wrapper" className="w-[50px] h-fit flex flex-col items-center " >

          <h3 id="loop-start-heading" className="w-full text-[18px] text-center" >Start: </h3>  
          
          <input
            type="number"
            min={1}
            id={`loop-start-scrapeIdx-${scrapeIdx}`}
            value={scraperInfos?.all[scrapeIdx].loop.start}
            className={"w-full rounded-lg border-2 border-gray-600 dark:border-gray-300 text-[18px] px-1 justify-center h-10 bg-gray-300 dark:bg-gray-600 font-[700]"}
            onChange={(e) => { handleLoopChange({scrapeIdx: scrapeIdx, paramName: "start", value: Number(e.target.value)}); }}
          />

        </div>

        <div id="loop-end-wrapper" className="w-[50px] h-fit flex flex-col items-center " >

          <h3 id="loop-end-heading" className="w-full text-[18px] text-center" >End: </h3>  
          
          <input
            type="number"
            min={1}
            id={`loop-end-scrapeIdx-${scrapeIdx}`}
            value={scraperInfos?.all[scrapeIdx].loop.end}
            className={"w-full rounded-lg border-2 border-gray-600 dark:border-gray-300 text-[18px] px-1 justify-center h-10 bg-gray-300 dark:bg-gray-600 font-[700]"}
            onChange={(e) => { handleLoopChange({scrapeIdx: scrapeIdx, paramName: "end", value: Number(e.target.value)}); }}
          />

        </div>

        <div id="loop-iterations-wrapper" className="w-[80px] h-fit flex flex-col items-center " >

          <h3 id="loop-iterations-header" className="w-full text-[18px] text-center" > Iterations: </h3>  
          
          <input
            type="number"
            min={2}
            max={10}
            maxLength={2}
            id={`loop-iterations-${scrapeIdx}`}
            className={"w-full rounded-lg border-2 border-gray-600 dark:border-gray-300 text-[18px] px-1 justify-center h-10 bg-gray-300 dark:bg-gray-600 font-[700]"}
            value={scraperInfos?.all[scrapeIdx].loop.iterations}
            onChange={(e) => { handleLoopChange({scrapeIdx: scrapeIdx, paramName: "iterations", value: Number(e.target.value)}); }}
          />

        </div>

        <Image 
          src={"/assets/icons/scrape/trash_can.svg"} 
          alt="delete loop" 
          id="delete-loop"
          width={40} 
          height={40} 
          className="absolute right-2 top-2 cursor-pointer mb-[-5px]"
          onClick={() => { deleteLoop({scrapeIdx: scrapeIdx}); }}
        />

      </div>
      
    </div>
  )
}

export default LoopContainer
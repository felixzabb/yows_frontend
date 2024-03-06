// FOundation types:

import { SetStateAction } from "react";

type BasicApiReturn = number | {
  acknowledged : 0 | 1
  errors? : string[]
};
// Sub-types of ScraperInfos:

type WorkflowObject = {
  [index : number] : [string, any]
};

type GlobalParamsObject = {
  website_url : string
  wait_time : number
  browser_type : string
  amount_actions_local : number
};

type LoopObject = {
  loop_start_end : [number, number]
  iterations : number
  created : boolean
};

// All Sub-types compiled into one
type ScrapeInfoObject = {
  workflow : WorkflowObject
  global_params : GlobalParamsObject
  loop : LoopObject
};

// The complete type
type ScraperInfos = {
  all : {
    [index : number] : ScrapeInfoObject
  }
  args : {
    user_email : string
    amount_scrapes_global : number
    global_expected_runtime : number
    global_undetected : boolean
  }
};

// Form results need to have
type ScraperInfoResults = {
  empty? : boolean
  [index : number] : {
    scrape_runs : {
      [index : number] : any[]
    }
  }
}

// Returned document from collection: "scrape_info_saves"
type ScrapeInfoSave = {
  _id : string
  name : string
  description : string
  runtime : string    // change to number
  results : ScraperInfoResults
  scrape_object : ScraperInfos

}

// ScraperInfos fetched in "Profile.tsx"
type FetchedScraperInfos = {
  acknowledged : "true" | "false"                  // change to boolean
  found : ScrapeInfoSave[]  // change to always be an array
  ids : string[]
  max_scrapes : string // change to number
  
}

// Returned object when fetching profiles in "Profile.tsx"
type ProfileData = {
  _id? : string
  email : string
  username : string
  provider : string
  image? : string
  description : string
  api_options? : {
    data_cleanup : boolean
    multithreading : boolean
    multiprocessing : boolean
    max_scrapes : string
  }
  api_interaction? : {
    api_keys : []
    blocked : boolean
    price_per_request : number | null
    sub_runtime : Date | null
    sub_id : string | null
  }
  all_saved_scrapes? : {scrape_object : string }[]
  __v? : number

}

// Returns of api function

type PostToDbReturnData = BasicApiReturn & {
  created_ids? : string[]
  created_item? : string
};

type PullFromDbReturnData<pullType> = BasicApiReturn & {
  found? : pullType[] 
  scraper_storage? : string
};

type PutToDbReturnData = BasicApiReturn & {
  work_done? : {matched : string, modified : string}
};

type DeleteFromDbReturnData = BasicApiReturn & {
  deleted_count? : string
};

type LoadScrapeReturnData = BasicApiReturn & PullFromDbReturnData & {
  found? : ScrapeInfoSave[]
};

type SaveScrapeReturnData = BasicApiReturn & {
  created_id? : string
};

type RunScrapeReturnData = BasicApiReturn & {
  results? : ScraperInfoResults
};

type DeleteScrapeReturnData = BasicApiReturn & PutToDbReturnData & DeleteFromDbReturnData;

type AppContextData = {
  colorMode : "dark" | "light"
    alertData : {
      text : string
      color : string
    }
    overlayChild : null | JSX.Element
    overlayChildTitle : string
    overlayChildData : {results: ScraperInfoResults}
};

type AppContextType = {
  appContextData : AppContextData
  setAppContextData : Dispatch<SetStateAction<AppContext>>
  updateContext : Dispatch<SetStateAction<number>>
};

type PreviewData = {
  amount : number
  data : ScrapeInfoSave
};

type ChangePassword = BasicApiReturn;

type GenerateKey = BasicApiReturn & {
  createdKey : string
}
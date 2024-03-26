import { SetStateAction } from "react";

type BasicApiReturn = {
  acknowledged : 0 | 1
  errors? : string[]
  specific_error? : string
};

// ScraperInfos

type ScraperInfos = {
  all : ScrapeData[]
  args : ScraperArgs
};

type ScraperArgs = {
  user_email : string
  amount_scrapes_global : number
  scraper_expected_runtime_seconds : number
  global_undetected : boolean
};

type ScrapeData = {
  workflow : WorkflowData[]
  scrape_params : ScrapeParams
  loop : LoopData
};

type WorkflowData = {
  type: string
  data: any
};

type ScrapeParams = {
  website_url : string
  url_as : "text" | "json" | "csv"
  browser_type : string
  amount_actions_local : number
  exec_type : "sequential" | "looping"
  swallow_errors : boolean
};

type LoopData = {
  start : number
  end : number
  iterations : number
  created : boolean
};

type ScrapedData = {scrape_runs: string[][]}[];

type PossibleCssSelectorDataTypes = "json" | "text" | "csv";

type PossibleUrlDataTypes = "json" | "text" | "csv";
 
// DB

type SavedScraper = {
  _id : string
  name : string
  description : string
  runtime : number
  scraped_data : ScrapedData
  scraper : ScraperInfos
};

type UserProfileData = UserApiData & UserSubscriptionData & {
  _id : string
  email : string
  provider : string
  alias : string
  phash : string
  salt : string
  image? : string
  description : string
  saved_scrapers : {scraper : string}[]
}

type UserApiData = {
  api_keys : string[]
  rate_limit : number
}

type UserSubscriptionData = {
  subscribed : 0 | 1
  tier : 0 | 1 | 2 | 3
  scraper_storage : number
  max_scraper_runtime_seconds : number
  max_loop_iterations : number
  subscription_end : string
  subscribed_months : 0
}

// API call OUT

type CreateUserSend =  { 
  provider: string
  scheme : "default" | string
  user_data : {
    email: string 
    password?: string 
    alias?: string
    scheme?: string
    image?: string
  }
};

// API call IN

type PostToDbReturn = BasicApiReturn & {
  created_ids? : string[]
  created_item? : string
};

type PullFromDbReturn<pullType> = BasicApiReturn & {
  found? : pullType[] 
  scraper_storage? : number
};

type PutToDbReturn = BasicApiReturn & {
  work_done? : {matched : string, modified : string}
};

type DeleteFromDbReturn = BasicApiReturn & {
  deleted_count? : string | {[index : string] : string}
};

type LoadScraperReturn = BasicApiReturn & PullFromDbReturn;

type SaveScraperReturn = BasicApiReturn & PostToDbReturn & PutToDbReturn;

type RunScrapeReturnData = BasicApiReturn & {
  scraped_data? : ScraperInfoResults
};

type DeleteScrapeReturnData = BasicApiReturn & PutToDbReturnData & DeleteFromDbReturn;

type GenerateKeyReturn = BasicApiReturn & {
  created_key? : string
};

type DeleteUserReturn = BasicApiReturn & PullFromDbReturn & DeleteFromDbReturn;

type CreateUserReturn = PostToDbReturnData & SessionUserData;

type GenerateApiKeyReturn = BasicApiReturn & PostToDbReturnData & PutToDbReturnData;

type CheckUserValidReturn = BasicApiReturn & {
  user? : {
    _id : string
    email : string
    alias : string
    image : string
  }[] 
};

type PingServerReturn = BasicApiReturn & {
  status? : "ok" | "bad"
};

// Auth

type SessionUserData = {
  user? : {
      id : string
      email : string
      image : string
      alias : string
  }
}

// App

type AppContextData = {
  colorMode : "dark" | "light"
  alert : {
    text : string
    color : string
  }
  overlay : {
    element: null | JSX.Element
    title: string
    data?: {
      results: ScraperInfoResults
    }
  },
  enabledFeatures : {
    [index : string] : number
  }
};

type CustomAppContext = {
  appContextData : AppContextData
  setAppContextData : Dispatch<SetStateAction<AppContext>>
};
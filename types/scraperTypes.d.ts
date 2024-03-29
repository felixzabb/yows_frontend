type ScraperData = {
  scrapes : ScrapeData[]
  meta : ScraperMeta
};

type ScraperMeta = {
  user_email : string
  expected_runtime_seconds : number
};

type ScrapeData = {
  workflow : WorkflowData[]
  scrape_params : ScrapeParams
  loop : LoopData
};

type WorkflowData = {
  type: ActionTypes
  data: { 
    css_selectors?: string | string[]
    fill_content?: string | string[]
    time?: number | number[]
  }
  as: ActionDataType
};

type ScrapeParams = {
  url : string
  url_as : ScraperDataType
  browser : string
  exec_type : "sequential" | "looping"
  swallow_errors : boolean
};

type LoopData = {
  start : number
  end : number
  iterations : number
  created : boolean
};

type ScrapedData = {
  scrape_runs: string[][]
  errors: string[][]
}[];

type ScraperDataType = "json" | "text" | "csv";

type ActionDataType = ScraperDataType;

type ActionName = "scrape" | "button-press" | "input-fill" | "wait";

// DB

type SavedScraper = {
  _id : string
  name : string
  description : string
  expected_runtime_seconds : number
  scraped_data : ScrapedData
  scraper : ScraperData
};

type WholeUserData = {
  _id : string
  email : string
  provider : string
  alias : string
  phash : string
  salt : string
  image : string
  description : string
  saved_scrapers : {
    scraper : string
  }[]
  api: UserApiData
  subscription: UserSubscriptionData
};

type UserApiData = {
  api_keys : string[]
  rate_limit : number
};

type UserSubscriptionData = {
  subscribed : 0 | 1
  tier : 0 | 1 | 2 | 3
  scraper_storage : number
  max_scraper_runtime_seconds : number
  max_loop_iterations : number
  subscription_end : string
  subscribed_months : 0
};

type ScraperUserData = {
  api? : UserApiData
  subscription? : UserSubscriptionData
  saved_scrapers? : { 
    scraper_id : string 
  }[]
};
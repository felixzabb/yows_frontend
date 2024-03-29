// Base type
type BaseApiReturn = {
  acknowledged: 0 | 1
  errors?: string[]
  specific_error?: string
};

// IN

type PostToDbReturn = {
  created_ids? : string[]
  created_item? : string
} & BaseApiReturn;

type PullFromDbReturn<pullType> = {
  found? : pullType[] 
  scraper_storage? : number
} & BaseApiReturn;

type PutToDbReturn = {
  work_done? : {
    matched : string 
    modified : string
  }
} & BaseApiReturn;

type DeleteFromDbReturn = {
  deleted_count? : string | {
    [index : string] : string
  }
} & BaseApiReturn;

type SaveScraperReturn = PostToDbReturn & PutToDbReturn;

type RunScraperReturn = {
  scraped_data? : ScrapedData
} & BaseApiReturn;

type DeleteScraperReturn = PutToDbReturn & DeleteFromDbReturn;

type GenerateApiKeyReturn = BaseApiReturn & {
  created_key? : string
};

type DeleteUserReturn = DeleteFromDbReturn & PullFromDbReturn<WholeUserData>;

type CreateUserReturn = PostToDbReturn & SessionUserData;

type GenerateApiKeyReturn = PostToDbReturn & PutToDbReturn;

type CheckUserValidReturn = {
  user? : {
    _id : string
    email : string
    alias : string
    image : string
  }[] 
} & BaseApiReturn;

type PingServerReturn = {
  status? : "ok" | "bad"
} & BaseApiReturn;

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
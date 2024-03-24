import { PostToDbReturn, PullFromDbReturn, PutToDbReturn, RunScrapeReturnData, GenerateApiKeyReturn, DeleteUserReturn, CreateUserReturn, SaveScraperReturn, DeleteFromDbReturn, SavedScraper, BasicApiReturn, CheckUserValidReturn, ScraperInfos, CreateUserSend, PingServerReturn } from "@custom-types";
import mongoose from "mongoose";

const handleReturnData = async <dataType>({res} : {res : Response}) => {

  let resData : BasicApiReturn;

  const parsed = await res?.json()
  if(parsed.detail){
    resData = parsed.detail;
  }
  else if(res.status === 500) {
    resData = { acknowledged: 0, errors: ["SERVER-FUNCTION-1"] };
  }
  else{
    resData = parsed;
  }
  return resData as dataType;
};

let isConnected = false;

export const connectToDb = async ({ dbName }: { dbName: string }) => {

  mongoose.set('strictQuery', true)

  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    const dd = await mongoose.connect(process.env.MONGO_DB_URI, {

      dbName: dbName,
    });

    isConnected = true;

    console.log(`Connected to ${dbName}`);
  }
  catch (error) {
    console.log(error);
  }

};

export const postToDb = async ({ apiKey, dbName, collectionName, data, checkDuplicates }: { apiKey: string, dbName: string, collectionName: string, data: object[], checkDuplicates: number }): Promise<PostToDbReturn> => {

  const postUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/v" + process.env.NEXT_PUBLIC_YOWS_API_VERSION + "/db/post?" + new URLSearchParams({

    api_key: apiKey,
    db_name: dbName,
    collection_name: collectionName,
    check_dupe: String(checkDuplicates),
  });
  try{
    const res: Response = await fetch(postUrl, {
      method: "POST",
      body: JSON.stringify(data)
    });
  
    return await handleReturnData<PostToDbReturn>({res: res});
  }
  catch(error){
    console.log(error.message);
    return {acknowledged: 0, errors: ["SERVER-FUNCTION-1"]};
  };
};

export const pullFromDb = async <pullType>({ apiKey, dbName, collectionName, data }: { apiKey: string, dbName: string, collectionName: string, data: { filter: object, projection: object | string[] } }): Promise<PullFromDbReturn<pullType>> => {

  const pullUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/v" + process.env.NEXT_PUBLIC_YOWS_API_VERSION + "/db/pull?" + new URLSearchParams({

    api_key: apiKey,
    db_name: dbName,
    collection_name: collectionName,
    data: JSON.stringify(data),
  });

  try{
    const res: Response = await fetch(pullUrl, {
      method: "GET"
    });
  
    return await handleReturnData<PullFromDbReturn<pullType>>({res: res});
  }
  catch(error){
    console.log(error.message);
    return {acknowledged: 0, errors: ["SERVER-FUNCTION-1"]};
  };
};

export const putToDb = async ({ apiKey, dbName, collectionName, data }: { apiKey: string, dbName: string, collectionName: string, data: { filter: object, update: object } }): Promise<PutToDbReturn> => {

  const putUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/v" + process.env.NEXT_PUBLIC_YOWS_API_VERSION + "/db/put?" + new URLSearchParams({

    api_key: apiKey,
    db_name: dbName,
    collection_name: collectionName,
  });

  try{
    const res: Response = await fetch(putUrl, {
      method: "PUT", body: JSON.stringify(data)
    });
  
    return await handleReturnData<PutToDbReturn>({res: res});
  }
  catch(error){
    console.log(error.message);
    return {acknowledged: 0, errors: ["SERVER-FUNCTION-1"]};
  };
};

export const saveScraper = async ({ apiKey, userId, data }: { apiKey: string, userId: string, data: object[] }): Promise<SaveScraperReturn> => {

  const saveScrapeUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/v" + process.env.NEXT_PUBLIC_YOWS_API_VERSION + "/user/save_scrape?" + new URLSearchParams({
    api_key: apiKey,
    uid: userId,
  });
  try{
    const res: Response = await fetch(saveScrapeUrl, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  
    return await handleReturnData<SaveScraperReturn>({res: res});
  }
  catch(error){
    console.log(error.message);
    return {acknowledged: 0, errors: ["SERVER-FUNCTION-1"]};
  };
};

export const runScrape = async ({ apiKey, userId, data }: { apiKey: string, userId: string, data: ScraperInfos }): Promise<RunScrapeReturnData> => {

  const runScrapeUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/v" + process.env.NEXT_PUBLIC_YOWS_API_VERSION + "/scrape/run_scrape?" + new URLSearchParams({
    api_key: apiKey,
    uid: userId,
  });

  try{
    const res: Response = await fetch(runScrapeUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  
    return await handleReturnData<RunScrapeReturnData>({res: res});
  }
  catch(error){
    console.log(error.message);
    return {acknowledged: 0, errors: ["SERVER-FUNCTION-1"]};
  };
};

export const deleteScrape = async ({ apiKey, scrapeId, userId }: { apiKey: string, scrapeId: string, userId: string }): Promise<DeleteFromDbReturn> => {

  const deleteScrapeUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/v" + process.env.NEXT_PUBLIC_YOWS_API_VERSION + "/user/delete_scrape?" + new URLSearchParams({
    api_key: apiKey,
    scrape_id: scrapeId,
    uid: userId,
  });
  try{
    const res: Response = await fetch(deleteScrapeUrl, {
      method: "DELETE",
    });
  
    return await handleReturnData<DeleteFromDbReturn>({res: res});
  }
  catch(error){
    console.log(error.message);
    return {acknowledged: 0, errors: ["SERVER-FUNCTION-1"]};
  };
};

export const pullSavedScrapes = async ({ apiKey, userId }: { apiKey: string, userId: string }): Promise<PullFromDbReturn<SavedScraper>> => {

  const getSavedScrapesUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/v" + process.env.NEXT_PUBLIC_YOWS_API_VERSION + "/user/load_saved_scrapes?" + new URLSearchParams(
    {
      api_key: apiKey,
      uid: userId
    }
  );
  
  try{
    const res: Response = await fetch(getSavedScrapesUrl, {
      method: 'GET',
    });
  
    return await handleReturnData<PullFromDbReturn<SavedScraper>>({res: res});
  }
  catch(error){
    console.log(error.message);
    return {acknowledged: 0, errors: ["SERVER-FUNCTION-1"]};
  };
};

export const changePassword = async ({ apiKey, userId, password }: { apiKey: string, userId: string, password: string }): Promise<PutToDbReturn> => {

  const changePasswordUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/v" + process.env.NEXT_PUBLIC_YOWS_API_VERSION + "/user/change_password?" + new URLSearchParams(
    {
      api_key: apiKey,
      uid: userId,
      np: password
    }
  );

  try{
    const res: Response = await fetch(changePasswordUrl, {
      method: 'PUT',
    });
  
    return await handleReturnData<PutToDbReturn>({res: res});
  }
  catch(error){
    console.log(error.message);
    return {acknowledged: 0, errors: ["SERVER-FUNCTION-1"]};
  };
};

export const generateApiKey = async ({ apiKey, userId }: { apiKey: string, userId: string }): Promise<GenerateApiKeyReturn> => {

  const generateKeyUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/v" + process.env.NEXT_PUBLIC_YOWS_API_VERSION + "/user/generate_api_key?" + new URLSearchParams(
    {
      api_key: apiKey,
      uid: userId
    }
  );
  
  try{
    const res: Response = await fetch(generateKeyUrl, {
      method: 'POST',
    });
  
    return await handleReturnData<GenerateApiKeyReturn>({res: res});
  }
  catch(error){
    console.log(error.message);
    return {acknowledged: 0, errors: ["SERVER-FUNCTION-1"]};
  };
};

export const deleteUser = async ({ apiKey, userId }: { apiKey: string, userId: string }): Promise<DeleteUserReturn> => {

  const deleteUserUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/v" + process.env.NEXT_PUBLIC_YOWS_API_VERSION + "/user/delete_user?" + new URLSearchParams(
    {
      api_key: apiKey,
      uid: userId
    }
  );

  try{
    const res: Response = await fetch(deleteUserUrl, {
      method: 'DELETE',
    });
  
    return await handleReturnData<DeleteUserReturn>({res: res});
  }
  catch(error){
    console.log(error.message);
    return {acknowledged: 0, errors: ["SERVER-FUNCTION-1"]};
  };
};

export const CreateUser = async ({ apiKey, provider, email, password, alias, scheme, image }: { apiKey: string, provider: string, email: string, password?: string, alias?: string, scheme?: string, image?: string }): Promise<CreateUserReturn> => {

  const createUserUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/v" + process.env.NEXT_PUBLIC_YOWS_API_VERSION + "/user/create_user?" + new URLSearchParams(
    {
      api_key: apiKey,
    }
  );

  const payload : CreateUserSend = { provider: provider, user_data : {email: email}, scheme: scheme };

  if (provider === "credentials") {
    payload.user_data.password = password;
    payload.user_data.alias = alias;
  };
  if (provider === "google") {
    payload.user_data.image = image;
  };

  try{
    const res: Response = await fetch(createUserUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return await handleReturnData<CreateUserReturn>({res: res});  
  }
  catch(error){
    console.log(error.message);
    return {acknowledged: 0, errors: ["SERVER-FUNCTION-1"]};
  };
};

export const checkUserLoginValid = async ({ apiKey, email, password }: { apiKey: string, email: string, password: string }) : Promise<CheckUserValidReturn> => {

  const checkUserUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/v" + process.env.NEXT_PUBLIC_YOWS_API_VERSION + "/user/check_user_valid?" + new URLSearchParams(
    {
      api_key: apiKey,
      ue: email,
      up: password,
    }
  );

  try{
    const res: Response = await fetch(checkUserUrl, {
      method: 'GET',
    });
    return await handleReturnData<CheckUserValidReturn>({res: res});
  }
  catch(error){
    console.log(error.message);
    return {acknowledged: 0, errors: ["SERVER-FUNCTION-1"]};
  };
};

export const pingServer = async ({apiKey, check_db} : {apiKey : string, check_db? : boolean}) : Promise<PingServerReturn> => {

  const pingServerUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/v" + process.env.NEXT_PUBLIC_YOWS_API_VERSION + "/server/ping?" + new URLSearchParams(
    {
      api_key: apiKey,
      db: check_db ? ("1") : ("0")
    }
  );

  try{
    const res: Response = await fetch(pingServerUrl, {
      method: 'GET',
    });
    return await handleReturnData<PingServerReturn>({res: res});
  }
  catch(error){
    console.log(error.message);
    return {acknowledged: 0, errors: ["SERVER-FUNCTION-1"]};
  };

};

import mongoose from "mongoose";

let isConnected = false;

export const connectToDb = async ({dbName} : {dbName : string}) => {

    mongoose.set('strictQuery', true)

    if(isConnected){
        console.log('MongoDB already connected');
        return;
    }

    try{
        await mongoose.connect(process.env.MONGO_DB_URI, {

            dbName: dbName,
        });

        isConnected = true;

        console.log(`Connected to ${dbName}`);
    }
    catch(error){
        console.log(error);
    }

};

export const postToDb = async ({apiKey, dbName, collectionName, data, checkDuplicates} : {apiKey : string, dbName : string, collectionName : string, data : object[], checkDuplicates : number}) : Promise<PostToDbReturnData> => {

    const postUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/db/post?" + new URLSearchParams({

        api_key : apiKey,
        db_name : dbName,
        collection_name : collectionName,
        check_dupe : String(checkDuplicates),
    });

    const fetchData : Promise<PostToDbReturnData> = await fetch(postUrl, {method: "POST", body: JSON.stringify({data : data})})
    .then((response) => {
        if(!response.ok){ console.log("Fetch to post data failed."); return response.status;};

        return response.json();
    });

    return fetchData;
};

export const pullFromDb = async ({apiKey, dbName, collectionName, data} : {apiKey : string, dbName : string, collectionName : string, data : {filter: object, projection: object | string[]}}) : Promise<PullFromDbReturnData<any>> => {

    const pullUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/db/pull?" + new URLSearchParams({

        api_key : apiKey,
        db_name : dbName,
        collection_name : collectionName,
        data : JSON.stringify(data),
    });

    const fetchData : Promise<PullFromDbReturnData<object>> = await fetch(pullUrl, {method: "GET"})
    .then((response) => {
        if(!response.ok){ console.log("Fetch to pull data failed."); return response.status;};

        return response.json()
    });

    return fetchData;
};

export const putToDb = async ({apiKey, dbName, collectionName, data} : {apiKey : string, dbName : string, collectionName : string, data : {filter : object, update : object}}) : Promise<PutToDbReturnData> => {

    const putUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/db/put?" + new URLSearchParams({

        api_key : apiKey,
        db_name : dbName,
        collection_name : collectionName,
    });

    const fetchData : Promise<PutToDbReturnData> = await fetch(putUrl, {method: "PUT", body: JSON.stringify({data : data})})
    .then((response) => {
        if(!response.ok){ console.log("Fetch to put data failed."); return response.status;};

        return response.json()
    });

    return fetchData;

};

export const saveScrape = async ({apiKey, userId, data} : {apiKey : string, userId : string, data : object[]}) : Promise<SaveScrapeReturnData> => {

    const saveScrapeUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/user/save_scrape?" + new URLSearchParams({
        api_key: apiKey,
        uid: userId,
    });

    const fetchData : Promise<SaveScrapeReturnData> = fetch(saveScrapeUrl, {method: "POST", body: JSON.stringify({data: data})})
    .then((response) => {
        if(!response.ok){console.log("Fetch to save scrape failed."); return response.status;}

        return response.json();
    });

    return fetchData;
};

export const runScrape = async ({apiKey, userId, data} : {apiKey : string, userId : string, data : any}) : Promise<RunScrapeReturnData> => {

    
    const runScrapeUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/scrape/run_scrape?" + new URLSearchParams({
        api_key: apiKey,
        uid: userId,
    }); 
    

    /**
     * //  aws config
    const runScrapeUrl = "https://m2nzob5pbopzmzqyfvb3nrsqbu0hzwro.lambda-url.eu-central-1.on.aws/" + new URLSearchParams({
        uid: userId,
    }); 
     */

    const fetchData : Promise<RunScrapeReturnData> = await fetch(runScrapeUrl, {
      method: 'POST',
      body: data,
    })
    .then((response) => {
        if(!response.ok){console.log("Fetch to run scrape failed."); return response.status;};

        return response.json();
    });

    return fetchData;
};

export const deleteScrape = async ({apiKey, scrapeId, userId} : {apiKey : string, scrapeId : string, userId : string}) : Promise<DeleteFromDbReturnData> => {

    const deleteScrapeUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/user/delete_scrape?" + new URLSearchParams({
      api_key: apiKey,
      scrape_id: scrapeId,
      uid: userId,
    });

    const fetchData : Promise<DeleteFromDbReturnData> = await fetch(deleteScrapeUrl, {
      method: "DELETE",
    })
    .then((response) => {
      if(!response.ok){console.log("Fetch to delete scrape failed."); return response.status;};

      return response.json();
    });

    return fetchData;
};

export const pullSavedScrapes = async ({apiKey, userId} : {apiKey : string, userId : string}) : Promise<PullFromDbReturnData<ScrapeInfoSave>> => {

    const getSavedScrapesUrl = process.env.NEXT_PUBLIC_YOWS_API_HOST_URL + "/api/user/load_saved_scrapes?" + new URLSearchParams(
      {
        api_key: apiKey,
        uid: userId
      }
    );

    const fetchData : Promise<PullFromDbReturnData<ScrapeInfoSave>> = await fetch(getSavedScrapesUrl, {
      method: 'GET',
    })
    .then(response => {
        if(!response.ok){console.log("Fetch to pull saved scrapes failed."); return response.status;};

        return response.json();
    });

    return fetchData;
};
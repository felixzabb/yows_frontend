import { PossibleCssSelectorDataTypes } from "@custom-types";

export const validateEmail = ({email} : {email : string}) => {
  const emailRegex = new RegExp("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+");
  return emailRegex.test(email);
};

export const validatePassword = ({password} : {password : string}) : boolean => {
  const passwordRegex = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$");
  return passwordRegex.test(password);
};

export const validateCssSelector = ({cssSelector, as} : {cssSelector : string, as : PossibleCssSelectorDataTypes}) : boolean => {

  if(cssSelector === ""){ return false; };

  if(as === "json"){

    let jsonValid = true;

    try{
      if(JSON.parse(cssSelector).length === 0){ return false; };
      for(const item of JSON.parse(cssSelector)){
        if(!validateCssSelector({cssSelector: item, as : "text"}) ){
          jsonValid = false;
        }
      }

    }
    catch{
      jsonValid = false;
    } 
    return jsonValid;
  }
  else if(as === "csv"){

    let csvValid = true;

    for(const item of cssSelector.split(",")){
      if(!validateCssSelector({cssSelector: item, as : "text"})){
        csvValid = false;
      }
    }
    return csvValid
  }

  if(!cssSelector){ return false; };
  const possibleChars = [".", "#", "~", ">"];
  const allValidHtmlTags = ["a", "abbr","address","area",	"article","aside","b","base",	"bdi","bdo","blockquote","body","br","button","canvas","caption",	"cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","head","header","hgroup","hr","i","input","ins","kbd","label","legend","li","link","main","map","mark","menu","meta","meter","nav","object","ol","optgroup","option","output","p","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","slot","small","source","span","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","time","title","tr","track","u","ul","var","video","wbr",]
  
  if(allValidHtmlTags.includes(cssSelector)){return true}
  else if(cssSelector.length < 2){return false}

  let firstDesignator = -1;
  for(let i = 0; i < cssSelector.length; i++){
    if(possibleChars.includes(cssSelector.at(i))){
      firstDesignator = i
      break;
    }
  }
  if(firstDesignator !== -1){
    if(firstDesignator === 0){return true}
    if(allValidHtmlTags.includes(cssSelector.slice(0, firstDesignator)) && cssSelector.at(firstDesignator + 1) !== undefined){
      return true
    }
    else{ return false; };
  } 
};

export const validateURl = ({url} : {url : string}) => {
  const urlRegex = new RegExp(/^(https):\/\/[^ "]+$/);
  return urlRegex.test(url);
};

// intermediate solution. will be removed after adding dropdown to browser selection
export const validateBrowserType = ({type} : {type : string}) => {
  const possibleBrowsers = ["chrome", "edge", "firefox", "safari"];
  return(possibleBrowsers.includes(type.toLowerCase()));
};

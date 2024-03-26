import { PossibleCssSelectorDataTypes } from "@custom-types";

export const validateEmail = ({email} : {email : string}) => {
  const emailRegex = new RegExp("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+");
  return emailRegex.test(email);
};

export const validatePassword = ({password} : {password : string}) : boolean => {
  const passwordRegex = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$");
  return passwordRegex.test(password);
};

export const validateCssSelector = ({input, as} : {input : string, as : PossibleCssSelectorDataTypes}) : boolean => {

  if(input === ""){ return false; };

  if(as === "json"){

    let jsonValid = true;

    try{
      if(input.length === 0){ return false; };
      for(const item of input){
        if(!validateCssSelector({input: item, as : "text"}) ){
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

    try{

      for(const item of input.split(",")){
        if(!validateCssSelector({input: item, as : "text"})){
          return false;
        }
      } 
    }
    catch{
      return false;
    };
    
    return true;
  }

  if(!input){ return false; };
  const possibleChars = [".", "#", "~", ">"];
  const allValidHtmlTags = ["a", "abbr","address","area",	"article","aside","b","base",	"bdi","bdo","blockquote","body","br","button","canvas","caption",	"cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","head","header","hgroup","hr","i","input","ins","kbd","label","legend","li","link","main","map","mark","menu","meta","meter","nav","object","ol","optgroup","option","output","p","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","slot","small","source","span","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","time","title","tr","track","u","ul","var","video","wbr",]
  
  if(allValidHtmlTags.includes(input)){return true}
  else if(input.length < 2){return false}

  let firstDesignator = -1;
  for(let i = 0; i < input.length; i++){
    if(possibleChars.includes(input.at(i))){
      firstDesignator = i
      break;
    }
  }
  if(firstDesignator !== -1){
    if(firstDesignator === 0){return true}
    if(allValidHtmlTags.includes(input.slice(0, firstDesignator)) && input.at(firstDesignator + 1) !== undefined){
      return true
    }
    else{ return false; };
  } 
};

export const validateUrl = ({input, as} : {input : string, as : PossibleCssSelectorDataTypes}) => {
  const urlRegex = new RegExp(/^(https):\/\/[^ "]+$/);

  if(as === "json"){

    try{
      const parsed = JSON.parse(input);

      if(parsed.length === 0){ return false; };

      for(const item of parsed){
        if(!validateUrl({input: item, as : "text"}) ){ return false; };
      };

      return true;
    }
    catch{
      return false;
    }
    
  }
  else if(as === "csv"){

    for(const item of input.split(",")){
      if(!validateUrl({input: item, as : "text"})){ return false; };
    }
    return true
  }

  return urlRegex.test(input);
};


export const validateEmail = ({ email } : { email : string }) : boolean => {
  const emailRegex = new RegExp("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+");
  return emailRegex.test(email);
};

export const validatePassword = ({ password} : { password : string }) : boolean => {
  const passwordRegex = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$");
  return passwordRegex.test(password);
};

export const validateCssSelector = ({ input, as } : { input : string | string[] , as : ScraperDataType }) : boolean => {

  try{
    if(input.length === 0){ return false; };

    if(as === "json"){

      for(const item of input){
        if(!validateCssSelector({ input: item, as : "text" }) ){
          return false;
        };
      };

      return true;
    }
    else if(as === "csv"){

      for(const item of String(input).split(",")){
        if(!validateCssSelector({ input: item, as : "text" })){
          return false;
        };
      };
      
      return true;
    }
  }
  catch{
    return false;
  };
  
  const possibleChars = [".", "#", "~", ">"];
  const allValidHtmlTags = ["a", "abbr","address","area",	"article","aside","b","base",	"bdi","bdo","blockquote","body","br","button","canvas","caption",	"cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","head","header","hgroup","hr","i","input","ins","kbd","label","legend","li","link","main","map","mark","menu","meta","meter","nav","object","ol","optgroup","option","output","p","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","slot","small","source","span","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","time","title","tr","track","u","ul","var","video","wbr",]
  
  if(allValidHtmlTags.includes(String(input))){ 
    return true; 
  }
  else if(input.length < 2){ 
    return false; 
  };

  let firstDesignator = -1;
  for(let i = 0; i < input.length; i++){
    
    if(possibleChars.includes(input.at(i))){
      firstDesignator = i
      break;
    };
  };

  if(firstDesignator !== -1){
    
    if(firstDesignator === 0 || (allValidHtmlTags.includes(String(input.slice(0, firstDesignator))) && input.at(firstDesignator + 1) !== undefined)){
      return true
    }
    else{ return false; };
  } 
};

export const validateFillContent = ({ input, as } : { input: string | string[], as : ScraperDataType }) : boolean => {
  
  try{
    if(input.length === 0){ return false; };

    if(as === "json"){

      for(const item of input){
        if(!validateFillContent({ input: item, as : "text" }) ){
          return false;
        };
      };

      return true;
    }
    else if(as === "csv"){

      for(const item of String(input).split(",")){
        if(!validateFillContent({ input: item, as : "text" })){
          return false;
        };
      };
      
      return true;
    }
  }
  catch{
    return false;
  };

  // Maybe add more validation.
  return input.length > 0;
};

export const validateWaitTime = ({ input, as } : { input: number | string | number[], as : ScraperDataType }) : boolean => {
  
  try{
    if(String(input).length === 0 || Number(input) <= 0){ return false; };

    if(as === "json"){

      for(const item of input as number[]){
        if(!validateWaitTime({ input: item, as : "text" }) ){
          return false;
        };
      };
      
      return true;
    }
    else if(as === "csv"){

      for(const item of String(input).split(",")){
        if(!validateWaitTime({ input: Number(item), as : "text" })){
          return false;
        };
      };
      
      return true;
    }
  }
  catch{
    return false;
  };

  // Maybe add more validation.
  return Number(input) > 0;
};

export const validateUrl = ({ input, as } : { input : string, as : ScraperDataType }) : boolean => {

  const urlRegex = new RegExp(/^(https):\/\/[^ "]+$/);
  try{

    if(input.length === 0){ return false; };

    if(as === "json"){

      for(const item of input){
        if(!validateUrl( { input: item, as : "text" })){
          return false;
        };
      };

      return true;
    }
    else if(as === "csv"){

      for(const item of input.split(",")){
        if(!validateUrl({input: item, as : "text"})){ return false; };
      };

      return true
    };
  }
  catch{
    return false;
  };
  
  return urlRegex.test(input);
};

export const validateWorkflowAction = ({ action } : { action: WorkflowData }) : boolean => {

  if(["scrape", "button-press"].includes(action.type)){
    return validateCssSelector({ input: action.data.css_selectors, as: action.as });
  }
  else if(action.type === "input-fill"){
    if(validateCssSelector({ input: action.data.css_selectors, as: action.as })){
      return validateFillContent({ input: action.data.fill_content, as: action.as });
    };

    return false;
  }
  else if(action.type === "wait"){
    return validateWaitTime({ input: action.data.time, as: action.as });
  }
};
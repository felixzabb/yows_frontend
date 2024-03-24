
export const showElement = ({elementId} : {elementId : string}) : void => {
  window.document.getElementById(elementId).classList.remove("hidden");
  return;
};

export const hideElement = ({elementId} : {elementId : string}) : void => {
  window.document.getElementById(elementId).classList.add("hidden");
  return;
};

export const isElementVisible = ({elementId} : {elementId : string}) : boolean => {
  const element : HTMLElement = window.document.getElementById(elementId);
  if(!element || element.classList.contains("hidden")){ return false; };
  return true;
};

export const showHideElement = ({elementId} : {elementId : string}) : void => {
  if(isElementVisible({elementId: elementId})){ hideElement({elementId: elementId}); }
  else{ showElement({elementId: elementId}); };
};

export const rotateElement = ({elementId, degrees} : {elementId : string, degrees : string}) : void => {

  const possibleRotations = ["rotate-180, rotate-90, rotate-45, rotate-135, rotate-270, rotate-315"];
  let classList = window.document.getElementById(elementId).classList;

  if(classList.contains(`rotate-${degrees}`)){
    classList.remove(`rotate-${degrees}`);
  }
  else{
    classList.add(`rotate-${degrees}`);
  };

  return;
};

export const inputElementValue = ({elementId, defaultValue} : {elementId : string, defaultValue? : boolean}) : string => {
  const inputElement = window.document.getElementById(elementId) as HTMLInputElement | HTMLTextAreaElement;
  if(!inputElement){ return null; };
  if(defaultValue){ return inputElement.defaultValue; };
  return inputElement.value;
};

export const inputElementChecked = ({elementId} : {elementId : string}) : boolean => {
  const inputElement = window.document.getElementById(elementId) as HTMLInputElement;
  return inputElement.checked;
};

export const resetInputElementValue = ({elementId} : {elementId : string}) : void => {
  const inputElement = window.document.getElementById(elementId) as HTMLInputElement | HTMLTextAreaElement;
  inputElement.value = "";
  return;
};
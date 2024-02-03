
/** Shows or hides html elements depending on their display value.
  * PARAMS:
  * elementId (String): Id of the html to operate on
  */
export const showHideElement = ({elementId} : {elementId : string}) : void => {

  let elementClassList = window.document.getElementById(elementId).classList;
          
  if(elementClassList.contains("hidden")){

    elementClassList.remove("hidden");
  }
  else{

    elementClassList.add("hidden");
  }

  return;
};

export const adjustTextareaHeight = ({elementId} : {elementId : string}) : void => {

  const element = document.getElementById(elementId);

  element.style.height = "1px"
  element.style.height = (element.scrollHeight + 25)+"px";

  return;
};

/** Rotates a element by a specified number of degrees.!!! Could be abused if different degree numbers get entered again and again, so should add a check !!!
   * PARAMS:
   * - elementId (String): Id of the html to operate on
   * - degreed (String): number of degrees to rotate by
   */
export const rotateElement = ({elementId, degrees} : {elementId : string, degrees : string}) : void => {

  const possibledegreeRotations = ["rotate-180, rotate-90, rotate-45, rotate-135, rotate-270, rotate-315"]
  let classList = window.document.getElementById(elementId).classList;

  if(classList.contains(`rotate-${degrees}`)){

    classList.remove(`rotate-${degrees}`);
  }
  else{

    classList.add(`rotate-${degrees}`);
  }

  return;
};


/** Checks if a element is visible and returns a Boolean depending on it 
   * PARAMS:
   * - elementId (String): Id of the html to operate on
   */

export const isElementVisible = ({elementId} : {elementId : string}) : boolean | void => {

  const element : HTMLElement = window.document.getElementById(elementId);
  if(element !== null){return element.classList.contains("hidden");}

  return;
}
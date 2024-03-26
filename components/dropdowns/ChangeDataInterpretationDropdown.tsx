import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { PossibleCssSelectorDataTypes, PossibleUrlDataTypes } from '@custom-types';

const ChangeDataInterpretationDropdown = (
  {thingToClick, handleTypeSelection, options, scrapeIdx} : 
  {
    thingToClick : any
    scrapeIdx? :  number
    handleTypeSelection?: ({ id } : {id : PossibleCssSelectorDataTypes | PossibleUrlDataTypes, scrapeIdx? : number}) => void
    options : {name : string, id : PossibleCssSelectorDataTypes | PossibleUrlDataTypes}[]
  } 
) => {

  return (

    <Menu as="div" className="relative flex ">

      <Menu.Button className="w-auto h-auto">
        {thingToClick}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute flex flex-col items-center py-1 top-full right-0 z-[10000] mt-2 w-[120px] rounded-md bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg shadow-lg border border-gray-600 dark:border-gray-300">
          {
            Array.from(options.keys()).map((optionIndex) => (
              <Menu.Item key={optionIndex} >
                <span className=' p-1 text-[14px] cursor-pointer w-full text-center' onClick={(e) => { handleTypeSelection({ id: options[optionIndex].id, scrapeIdx : scrapeIdx}); }} >
                  {options[optionIndex].name}
                </span>
              </Menu.Item>
            ))
          }
            
        </Menu.Items>  
      </Transition>
    </Menu> 
  );
};

export default ChangeDataInterpretationDropdown;
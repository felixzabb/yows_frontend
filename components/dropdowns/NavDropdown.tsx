import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import Link from 'next/link'

const NavDropdown = ({thingToClick, options} : {thingToClick : any, options : {name : string, href : string}[]}) => {
  return (
    <Menu as="div" className="relative inline-block text-left ">
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
        <Menu.Items className="absolute right-0 z-10 mt-1 w-[120px] rounded-lg bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg shadow-lg">
          {
            Array.from(options.keys()).map((optionIndex) => (
              <Menu.Item key={optionIndex} >
                <Link id={`dd-menu-link-${optionIndex}`} href={options[optionIndex].href} className={'hover:bg-gray-300 hover:dark:bg-zinc-900 block p-2 text-[16px] font-[400] rounded-lg' }>
                    {options[optionIndex].name}
                </Link>
              </Menu.Item>
            ))
          }
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default NavDropdown;

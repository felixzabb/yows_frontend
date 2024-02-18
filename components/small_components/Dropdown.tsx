import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import Link from 'next/link'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Dropdown({options} : {options : {
  [index : string] : {name : string, href : string}
}}) {
  return (
    <Menu as="div" className="relative inline-block text-left ">
      <div>
        <Menu.Button className="inline-flex w-[60px] h-[48px] justify-center items-center gap-x-1.5 rounded-md bg-purple-400 px-3 py-2 text-sm text-center font-semibold text-black shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-purple-500">
          Help
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-[120px] origin-top-right rounded-md bg-purple-400 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {
              Object.keys(options).map((option) => {
                return(
                  <Menu.Item key={option}>
                    {({ active }) => (
                      <Link href={options[option].href} className={classNames(
                            active ? 'bg-purple-500 text-black' : 'text-black',
                            'block px-4 py-2 text-sm'
                          )}>
                        
                          {options[option].name}
                      
                      </Link>
                      
                    )}
                  </Menu.Item>
                )
              })
            }
            
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

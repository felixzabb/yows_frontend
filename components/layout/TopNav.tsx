"use client";

import Link from "next/link";
import Image from "next/image";
import { ScaleLoader } from "react-spinners";
import { useSession } from "next-auth/react";
import Dropdown from "../design/Dropdown";
import { useState, useEffect } from "react";


const TopNav = () => {
	
	const { data: theSession, status: authStatus } = useSession();
	const [colorMode, setColorMode ] = useState("");
	const pathTranslator = {
		dark: "dark_mode_moon.svg",
		light: "light_mode_sun.svg"
	}

	useEffect(() => {
		setColorMode(window.localStorage.getItem("colorMode"));
	}, []);

	const switchColorMode = () : void => {

		if(colorMode === "light"){
			window.document.getElementById("html-elm").classList.add("dark"); 
			window.localStorage.setItem("colorMode", "dark");
			setColorMode("dark");
			return;
		};

		console.log(window.document.getElementById("html-elm").classList)
		window.localStorage.setItem("colorMode", "light")
		window.document.getElementById("html-elm").classList.remove("dark");
		setColorMode("light");

	};
	
  return(
		<nav id="topNav-container" className="flex flex-row items-center px-6 justify-between w-full h-[44px]">

			<Link id="topNav-index-link" href='/'>
				<Image
					id="topNav-yows-logo"
					priority 
					src='/assets/icons/logo/yows_logo_1.svg'
					alt="Yows logo"
					className="object-contain rounded-full"
					width={40}
					height={40} 
				/>
			</Link>
			{
				authStatus === "loading" && (
					<ScaleLoader height={50} width={4} margin={3} speedMultiplier={2} color="#8A2BE2" className="mr-3" />
				)
			}
			{
				authStatus === "authenticated" ?
					( 
						<div id="topNav-options-container" className="flex flex-row items-center w-fit h-auto justify-between gap-x-2 ">

							<Link prefetch id="topNav-new-scraper-link" href="/new-scraper"  className="text-[20px] font-[Helvetica] font-[500] px-2 py-[3px] rounded-lg hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark" >
								New 
							</Link>

							<Link prefetch id="topNav-saved-scrapers-link" href="/saved-scrapers" className="text-[20px] font-[Helvetica] font-[500] px-2 py-[3px] rounded-lg hover:animate-navColorFadeLight  dark:hover:animate-navColorFadeDark" >
								Saved 
							</Link>

							<Dropdown dropDownName="Help" options={{ errors : {name : "Errors", href: "/errors"}, docs : {name : "Docs", href:"/docs"}}} />

							<hr id="topNav-options-separator-0" className="h-[40px] w-[2px] bg-gray-400 " />

							<div id="topNav-options-wrapper-0" className="w-[100px] h-[50px] flex flex-row items-center gap-x-4" >
								<Image
									id="color-mode-toggle"
									src={`/assets/icons/colorMode/${pathTranslator[colorMode]}`}
									alt="Color mode switch"
									width={34}
									height={34}
									className="object-contain cursor-pointer"
									onClick={switchColorMode}
								
								/>

								<Link id="topNav-profile-link" href='/profile?section=general'>
									<Image
										id="user-profile-image"
										src={theSession?.user.image} 
										width={34} 
										height={34}
										alt="Profile" 
										className='object-contain rounded-full mt-[2px]' 
									/>
								</Link>
							</div>
						</div>
					)
					:
					(
						authStatus !== "loading" &&
							<Link id="signup-link" href='/signup' className="text-[20px] font-[Helvetica] font-[500] px-2 py-[3px] rounded-lg hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark" >
								Sign up/in
							</Link>
					)
				}
		</nav>
	);
};

export default TopNav;
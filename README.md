<div align="center">
<img src="./public/assets/icons/planet_logo.svg" alt="YOWS logo" width="400" height="400" />

# YOWS - Your Own Web Scraper

[![Generic badge](https://img.shields.io/badge/Developement-Ongoing-<>.svg)](https://shields.io/)
![GitHub last commit (branch)](https://img.shields.io/github/last-commit/felixzabb/yows_frontend/main)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity)
[![made-with-python](https://img.shields.io/badge/Made%20with-Python-1f425f.svg)](https://www.python.org/)
[![made-with-javascript](https://img.shields.io/badge/Made%20with-JavaScript-1f425f.svg)](https://www.javascript.com)

[What is YOWS?](#what-is-yows) • 
[Use cases](#use-cases) • 
[Structure](#structure) • 
[API](#api) • 
[Error handling](#error-handling) • 
[Examples](#examples) • 
[Roadmap](#roadmap) • 
[Additional information](#additional-information)

</div>

## Overview 

- [What is YOWS?](#what-is-yows)
- [Use cases](#use-cases)
- [Structure](#structure)
- [API](#api)
- [Error handling](#error-handling)
- [Examples](#examples)
- [Additional information](#additional-information)

## What is YOWS
Yows is a open-source easy to use and highly capable platform for custom web-scrapers.
With YOWS you can scrape the web easily without the need for any boilerplate or complex configuration. Create a web-scraper with the ability to adjust it, easily fitting all your needs.
> Web Scraping has never been so easy!

## Use cases
The most common use cases include(click to see examples):
- [Quick scraping of some data](#quick-and-easy-scraping)
- [Periodically run scrapes](#run-scrapes-periodically)
- [Pipeline for programs needing scraped data from the web](#yows-as-your-pipeline)
- [Custom updates](#custom-updates)

...and many more. 

## Structure
YOWS is built as an easy to use web app, where you can [create](#creating-a-scraper) and manage your "scrapers". Behind the scenes lies a powerful backend, which provides the ability to run all of them, [either on the web](#running-a-scraper-from-the-web) or [through an API call](#running-a-scraper-through-an-api-call), getting you the data you need.

## API
**:warning: To use the API you first need to [get an API key](#getting-an-api-key)! :warning:** <br/>
YOWS provides some API paths you can follow, with the ability to request custom ones, for completely free.
- [Running a scrape](#running-a-scraper-through-an-api-call)
- [Getting scraped data](#getting-data-returned-by-a-scraper)
- [Running a scrape periodically](#run-scrapes-periodically)

## Error handling
If you ever encounter an error when using YOWS, be it on the web or through an http response, you can refer to the [YOWS error page](https://yows.me/errors). The most common issues are listed here: 

- [AUTH-REQ-1](https://yows.me/errors/?error_code=auth-req-1) - Most commonly returned, when an API request had invalid credentials provided. <br/> :exclamation: Check your api_key parameter and your API-permissions, which come with your API key. :exclamation:

- [DB-CONN-1](https://yows.me/errors/?error_code=db-conn-1) - Returned, when the backend server fails to connect to the internal database. <br/> :exclamation: This error is server-side, if you see it, then I'm already on it. :exclamation: 

## Examples
Here you'll find a list of examples concerning things covered in this markdown.

### Creating a scraper
You can easily create a scraper on [yows.me](https://yows.me/new-scraper). There are many parameters you can fill and four main action-types (and a loop option) you can choose from:
- _scrape-action_ - Please provide a valid css-selector.
- _button-press_ - Please provide a valid css-selector and a time for the program to wait after pressing the button.
- _input-fill_ - Please provide a css-selector and text content to fill the input with.
- _wait-time_ - Please provide a valid time in seconds.

To create a loop, please provide a start/end index(inclusive) and the number of iterations. <br />
You can then create a custom workflow, ordering the actions as you like to get the data you need. 

INSERT VIDEO HERE

### Getting an API key
To get an API key, please visit the [profile page](https://yows.me/profile) and click on "Get Key" in the API section. You will then be prompted to answer some optional demographic questions(currently not enforced) after which you will get your key. Don't worry if you forget it, you can see all your keys in your profile.

### Running a scraper from the web
Running a scraper from the web is easy. Load your scrape and then click on the "Submit" button. After running, all your scraped data will be returned and can be easily exported into multiple formats.

### Running a scraper through an API call
To run a scraper through an API call, use this blueprint url: 
"https://api.yows.me/api/scrape/run_scrape_api?api_key=YOUR-API-KEY&scraper_id=YOUR-SCRAPER-ID"

You can use this URL in any requests library in any programming language. Don't know any? Prefix the URL with "curl " in your terminal/cmd and add " > results.json" after it. Your results will be accessible in a newly created results.json file in your current directory.
<br/>

Parameters:
- api_key: Your API key. Don't have one? [Get an API key](#getting-an-api-key).
- scraper_id: Your scraper id. You can get it in your [saved-scrapes](https://yows.me/saved-scrapes) page. Just click on "copy ID".
- retry(optional): 0 or 1. :exclamation: Maximum retry-count is currently 2. :exclamation:

### Getting data returned by a scraper
To run a scraper through an API call, use this blueprint url: 
"https://api.yows.me/api/db/get_scrape_data?api_key=YOUR-API-KEY&scraper_id=YOUR-SCRAPER-ID"

You can use this URL in any requests library in any programming language. Don't know any? Prefix the URL with "curl " in your terminal/cmd and add " > results.json" after it. Your results will be accessible in a newly created results.json file in your current directory.
<br/>
Parameters:
- api_key: Your API key. Don't have one? [Get an API key](#getting-an-api-key).
- scraper_id: Your scraper id. You can get it in your [saved-scrapes](https://yows.me/saved-scrapes) page. Just click on "copy ID".
- retry(optional): 0 or 1. :exclamation: Maximum retry-count is currently 2. :exclamation:

### Custom updates
You can get custom updates, when data on the web changes. This won't be very fast, because for this to work you need to [run your scraper periodically](#run-scrapes-periodically), with the update option enabled. Now you will get updates, showing which data changed when on which website.

### Quick and easy scraping
If you quickly need data from the web you can [create a scraper](#creating-a-scraper) in no time and run it from the web, getting your results immediately, ready for you to use.

### Run scrapes periodically
To run scrapes periodically, please contact me directly at dev.yows@gmail.com with the subject: "running scrapes periodically" and I will request some more information from you after which you will get a special api key. <br/>
:exclamation: A online version of this process is in progress. :exclamation:

### YOWS as your pipeline
To use YOWS as your pipeline, please refer to the various [API calls](#api) you can make and implement them in your program as you'd like. <br/>
:exclamation: Limits for this option are currently in development. These will allow for a faster and more reliable service. :exclamation:

## Roadmap
Features currently in development(Features that apply to the frontend part of YOWS can be found in the issues tab):
- Periodic scrape runs
- Custom updates
- Error page
- Ability to choose the browser type that the program will scrape in

## Additional information
- YOWS is not a commercial product, and developed only by me. If you have feature requests, please feel free to send me an email at dev.yows@gmail.com with the subject: "feature request", but do consider, that it could take some time before it's implemented. I try to make as much time as I can, but sometimes it takes a while.
- Everything YOWS offers is open-source and free, so please be respectful and tell me about exploits you find at dev.yows@gmail.com with the subject: "exploit found".
- If you find any bugs, you can create an issue or send me an email at dev.yows@gmail.com with the subject: "bug found".
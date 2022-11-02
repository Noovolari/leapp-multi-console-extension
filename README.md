# Leapp Multi Console Extension
Repository for the Leapp Cross-Browser Multi Console Extension

## Description
This extension lets you access different AWS Browser consoles from the same window 
on different tabs by isolating the Browser context.

## Dev Usage
### Build and run extensions in dev mode
- `npm run chrome-dev` : build the extension and start a Chrome instance to test it. 
Open `chrome://extensions` then toggle **developer mode slider**, and click on background 
script to access **the extension dev tools**.

- `npm run firefox-dev` : build the extension and start a Firefox instance to test it.
Open `about:addons` then select **extensions from the side menu**, and click on the **setting icon**, 
select the **debug addons** option, and click on **inspect**.

### Other commands
- `npm run build-chrome`/`npm run build-firefox` : bundle the extension for Chrome/Firefox using **webpack** without starting any Browser instance.
- `npm run watch` : watch extension code for any changes. Use it after running `chrome-dev` or `firefox-dev`
to **hot reload** the extension while testing it.

## Project Structure
- `asset` : contains all the static assets for the extension (images, icons, fonts, etc.).
- `config` : contains webpack configurations.
- `src` : 
  - **backend** : contains `background` and `content` scripts.
  - **frontend** : contains the `popup` page and all related content (.html, .js, and .css).
- `manifest-chrome.json`/`manifest-firefox.json` : entry point for the extension; contains metadata about the extension as 
well as configuration and permission properties. [Link](https://developer.chrome.com/docs/extensions/mv2/manifest/)

## Build Instructions
- Install node and npm
- Run `npm install`
- Run `npm run build-firefox` or `npm run build-chrome`
- The extension code should be inside the newly created `build` folder
- Otherwise, to test it locally, run `npm run firefox-dev` or `npm run chrome-dev`

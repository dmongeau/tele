# Plex IPTV updater
Create a playlist.m3u and a guide.xml with the streams from opus.re

## Installation
1. Clone this repo
2. Install submodules with `git submodule init`
3. Install dependencies with `npm install`
4. Copy .config.example to .config
5. Edit the .config file with your TVGuide credentials and Plex plugins path.
6. Update channels.json with the channel you want

## Usage
```
npm start
```

### Commands

Build the guide.xml file
```
npm run build:guide
```

Build the playlist.m3u file
```
npm run build:playlist
```

Sync the bundles in /bundles
```
npm run sync:bundles
```

Sync the resources (playlist, guide and image) in /resources
```
npm run sync:resources
```

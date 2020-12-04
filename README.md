# HLS Stream Creator

## Starting the script
Start script with: `node index.js file=tos-teaser.mp4`

**Setting a Bundle Name**
Add the destination foldername

`node index.js file=tos-teaser.mp4 name=teaser`

**Using Custom Segment Duration**
`node index.js file=tos-teaser.mp4 name=teaser segment_duration=10`

**Using NPM**
With npm

`npm start -- file=tos-teaser.mp4 name=teaser`


## Output
Output will be in the format:
```
- teaser.m3u8
- teaser
```

## HLS Features

* 6 second ts segments
* Stream level manifest contain all segments for the video
* Master manifest include: Average bandwidth, max bandwidth, codecs (A/V), resolution, and frame-rate
* Script bundle created assets together
* Multiple bitrate assets with 5 renditions, top bitrate being 6000k, bottom bitrate being 1100k.
* Audio file added to master manifest
* Ability to set custom segment duration



**Note: ffmpeg should be installed on the system before running this script**

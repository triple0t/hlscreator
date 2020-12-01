# HLS Stream Creator

## Starting the script
Start script with `node index.js tos-teaser.mp4`

or add the destination foldername

`node index.js tos-teaser.mp4 teaser`

or with npm

`npm start -- tos-teaser.mp4 teaser`

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



**Note: ffmpeg should be installed on the system before running this script**

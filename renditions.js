
// source: Apple's HLS Authoring Specification
// https://developer.apple.com/documentation/http_live_streaming/hls_authoring_specification_for_apple_devices#//apple_ref/doc/uid/DTS40009745-CH1-DECIDEONYOURVARIANTS
module.exports.renditions = [
    {
        resolution: "768x432",
        bitrate: "1100",
        audiorate: "128"
    },
    {
        resolution: "960x540",
        bitrate: "2000",
        audiorate: "128"
    },
    {
        resolution: "1280x720",
        bitrate: "3000",
        audiorate: "128"
    },
    {
        resolution: "1280x720",
        bitrate: "4500",
        audiorate: "192"
    },
    {
        resolution: "1920x1080",
        bitrate: "6000",
        audiorate: "192"
    },
];

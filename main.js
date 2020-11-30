
module.exports = (source, target) => {
    const renditions = [
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
    
    const each_segment_duration = 6;
    const max_bitrate_ratio=1.07;
    const rate_monitor_buffer_ratio=1.5;     
    
    // for only this video
    const frame_rate = 24;
    const key_frames_interval = frame_rate * 2;
    const video_codec = 'h264'; // can be h264
    const audio_codec = 'aac' ;

    const misc_params = '-hide_banner -y';
    
    // starting commands
    let starting_params  = `-c:a ${audio_codec} -ar 48000 -c:v ${video_codec} -crf 20 -sc_threshold 0`;
    starting_params     += ` -g ${key_frames_interval} -keyint_min ${key_frames_interval} -hls_time ${each_segment_duration}`;
    starting_params     += ` -hls_playlist_type vod`;
    starting_params     += ` -hls_list_size 0`;
    
    let master_playlist= `#EXTM3U\n#EXT-X-VERSION:3\n`;
    
    let cmd = ``;
    renditions.forEach(element => {
        let {resolution, bitrate, audiorate} = element;
    
        const maxrate = +bitrate * max_bitrate_ratio;
        const bufsize = +bitrate *rate_monitor_buffer_ratio;
        const bandwidth = +bitrate * 1000;
        const average_bandwidth = (+bitrate / 2) * 1000;
        const name      = bitrate;
    
        cmd +=` ${starting_params}`;
        cmd +=` -b:v ${bitrate} -maxrate ${maxrate}k -bufsize ${bufsize}k -b:a ${audiorate}k`;
        cmd +=` -hls_segment_filename ${target}/${name}_%03d.ts ${target}/${name}.m3u8`;
    
        // add entry in the master playlist
        master_playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},AVERAGE-BANDWIDTH=${average_bandwidth},CODECS="${audio_codec},${video_codec}",FRAME-RATE=${frame_rate},RESOLUTION=${resolution}\n${target}/${name}.m3u8\n` 
    });

    const finalcmd = `ffmpeg ${misc_params} -i ${source} ${cmd}`;

    return {
        cmd, master_playlist, finalcmd
    }
}
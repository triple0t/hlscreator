const {getFullCodec} = require('./audio_video_format');
const {renditions} = require('./renditions');

module.exports = (properties) => {
    const {source, target, segment_duration, fileinfo} = properties;

    const each_segment_duration = segment_duration || 6;
    const max_bitrate_ratio=1.07;
    const rate_monitor_buffer_ratio=1.5;     
    
    // current video info
    const frame_rate = fileinfo.video['frame_rate'] || 24;
    const key_frames_interval = frame_rate * 2;
    const video_codec = fileinfo.video['codec_name'] || 'h264';
    const finalVideoFormat = getFullCodec(fileinfo.video) || video_codec;
    const audio_codec = fileinfo.audio['codec_name'] || 'aac' ;
    const audio_max_bit_rate = fileinfo.audio['max_bit_rate'];
    const finalAudioFormat = getFullCodec(fileinfo.audio) || audixxxo_codec;

    const misc_params = '-hide_banner -y';
    
    // starting commands
    let starting_params  = `-c:a ${audio_codec} -ar 48000 -c:v ${video_codec} -crf 20 -sc_threshold 0`;
    starting_params     += ` -g ${key_frames_interval} -keyint_min ${key_frames_interval} -hls_time ${each_segment_duration}`;
    starting_params     += ` -hls_playlist_type vod`;
    starting_params     += ` -hls_list_size 0`;
    
    let master_playlist= `#EXTM3U\n#EXT-X-VERSION:3\n`;
    master_playlist += `#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="${target}_audio",NAME="English",DEFAULT=YES,URI="${target}/audio.m3u8"\n`;
    
    let cmd = ``;
    renditions.forEach(rendition => {
        let {resolution, bitrate, audiorate} = rendition;
    
        const maxrate = +bitrate * max_bitrate_ratio;
        const bufsize = +bitrate *rate_monitor_buffer_ratio;
        const bandwidth = +bitrate * 1000;
        const average_bandwidth = (+bitrate / 2) * 1000;
        const name      = bitrate;
    
        cmd +=` ${starting_params}`;
        cmd +=` -b:v ${bitrate} -maxrate ${maxrate}k -bufsize ${bufsize}k -b:a ${audiorate}k`;
        cmd +=` -hls_segment_filename ${target}/${name}_%03d.ts ${target}/${name}.m3u8`;
    
        // add entry in the master playlist
        master_playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},AVERAGE-BANDWIDTH=${average_bandwidth},CODECS="${finalVideoFormat},${finalAudioFormat}",FRAME-RATE=${frame_rate},RESOLUTION=${resolution}\n${target}/${name}.m3u8\n` 
    });

    // add audio
    const audioBitrate = (audio_max_bit_rate / 1000).toFixed(0)
    const audiocmd = `-c:a aac -b:a ${audioBitrate}k -vn -hls_time ${each_segment_duration} -hls_list_size 0 -hls_segment_filename ${target}/audio%d.aac ${target}/audio.m3u8`;
    cmd += ` ${audiocmd} `;
    // add audio entry in the master playlist
    master_playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${audio_max_bit_rate},AVERAGE-BANDWIDTH=${audio_max_bit_rate / 2},CODECS="${finalAudioFormat}",AUDIO="${target}_audio"\n${target}/audio.m3u8\n`

    const finalcmd = `ffmpeg ${misc_params} -i ${source} ${cmd}`;

    return {
        cmd, master_playlist, finalcmd
    }
}
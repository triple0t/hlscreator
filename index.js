const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const main = require('./main');

if (process.argv.length <= 2) {
    console.log('Please add file source. e.g: node index.js tos-teaser.mp4');
    return;
}

const fdate = Date.now();
const source = process.argv[2];
const target = process.argv[3] || `bundle_${fdate}`;

const master_playlist_filename = process.argv[3] ? `${process.argv[3]}.m3u8` : `master_${fdate}.m3u8`;
const filepath = path.join(__dirname, master_playlist_filename);

// check for ffmpeg
exec(`ffprobe -hide_banner ${source} -show_streams -show_format -v error -print_format json`, (err, stdout, stderr) => {
    
   if (err) {
        console.error('error: ', err);
        return;
    }

    if (!stdout) {
        console.error('error with ffprobe. Please install the latest version of ffmpeg');
        return;
    }

    const all_data = JSON.parse(stdout);
    const streams = all_data['streams'] ? all_data['streams'] : [];
    const fileinfo = {};
    streams.forEach(stream => {
        // check for type
        if (stream && stream.codec_type == 'video') {
            // pull out video info
            fileinfo['video_codec_name'] = stream['codec_name'];
            fileinfo['video_codec_tag_string'] = stream['codec_tag_string'];
            fileinfo['video_frame_rate'] = stream['avg_frame_rate'] ? stream['avg_frame_rate'].split('/')[0] : null;
        } else if (stream && stream.codec_type == 'audio') {
            // pull out audio info
            fileinfo['audio_codec_name'] = stream['codec_name'];
            fileinfo['audio_codec_tag_string'] = stream['codec_tag_string'];
        }
    });

    console.log('fileinfo: ', fileinfo);

    // create target dir to hold files
    fs.mkdirSync(path.join(__dirname, target));

    const {finalcmd, master_playlist} = main(source, target, fileinfo);

    // start conversion
    console.log(`Executing command:\n ${finalcmd}`)
    
    const spawn_child = spawn(finalcmd, {
        stdio: 'inherit',
        shell: true
    });

    spawn_child.on('error', (err) => console.error('Error: ', err));
    spawn_child.on('close', (code, sig) => {
        if (code == 0) {
            // create master file
            console.log(`Creating Master file: `, master_playlist);

            fs.writeFileSync(filepath, master_playlist, 'utf8');
            console.log('Done.');
        }
    });
});


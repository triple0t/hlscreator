const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const main = require('./main');

const commands = ['file', 'name', 'segment_duration'];
const props = {};

if (process.argv.length <= 2) {
    console.log('Please add file source. e.g: node index.js file=tos-teaser.mp4');
    return;
}

process.argv.forEach((val) => {
    const [command, value] = val.split('=');

    if (command && value && commands.includes(command)) {
        // set props for only the commands we care about
        props[command] = value;
    }
});

if (!props.file) {
    console.log('Please add file source. e.g: node index.js file=tos-teaser.mp4');
    return;
}

const fdate = Date.now();
const source = props.file;
const target = props.name || `bundle_${fdate}`;
const segment_duration = props.segment_duration;

const master_playlist_filename = props.name ? `${props.name}.m3u8` : `master_${fdate}.m3u8`;
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
    const fileinfo = {
        video: {},
        audio: {}
    };


    if (streams && streams.length == 0) {
        console.error('error: streams not available.');
        return;
    }

    streams.forEach(stream => {
        // check for type
        if (stream && stream.codec_type == 'video') {
            // pull out video info
            fileinfo.video['codec_name'] = stream['codec_name'];
            fileinfo.video['codec_tag_string'] = stream['codec_tag_string'];
            fileinfo.video['frame_rate'] = stream['avg_frame_rate'] ? stream['avg_frame_rate'].split('/')[0] : null;
            fileinfo.video['codec_long_name'] = stream['codec_long_name'];
            fileinfo.video['profile'] = stream['profile'];
            fileinfo.video['codec_type'] = stream['codec_type'];
        } else if (stream && stream.codec_type == 'audio') {
            // pull out audio info
            fileinfo.audio['codec_name'] = stream['codec_name'];
            fileinfo.audio['codec_tag_string'] = stream['codec_tag_string'];
            fileinfo.audio['max_bit_rate'] = stream['max_bit_rate'];
            fileinfo.audio['codec_long_name'] = stream['codec_long_name'];
            fileinfo.audio['profile'] = stream['profile'];
            fileinfo.audio['codec_type'] = stream['codec_type'];
        }
    });

    console.log('fileinfo: ', fileinfo);

    // create target dir to hold files
    fs.mkdirSync(path.join(__dirname, target), {recursive: true});

    const obj = {source, target, fileinfo};
    if (segment_duration) {
        obj.segment_duration = segment_duration;
    }

    const {finalcmd, master_playlist} = main(obj);

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


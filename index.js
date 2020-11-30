const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const main = require('./main');


// check for ffmpeg
exec('ffmpeg -h', (err, res, errstr) => {
    if (err) {
        console.log('error: ffmpeg not found. please install ffmpeg.');
        return;
    }

    if (process.argv.length <= 2) {
        console.log('Please add file source. e.g: node index.js tos-teaser.mp4');
        return;
    }
    
    const fdate = Date.now();
    const source = process.argv[2];
    const target = process.argv[3] || `target_${fdate}`;

    const master_playlist_filename = process.argv[3] ? `${process.argv[3]}.m3u8` : `master_${fdate}.m3u8`;
    const filepath = path.join(__dirname, master_playlist_filename);

    // create target dir to hold files
    fs.mkdirSync(path.join(__dirname, target));

    const {finalcmd, master_playlist} = main(source, target);

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


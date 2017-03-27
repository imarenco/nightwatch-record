'use strict';

const path = require('path');
const config = require('./config');
const killSignal = 'SIGKILL';

function mkdirp(dir, mode) {
    const path = require('path');
    const fs = require('fs');
  
    dir = path.resolve(dir);
    if (fs.existsSync(dir)) return dir;
    try {
        fs.mkdirSync(dir, mode);
        return dir;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return mkdirp(path.dirname(dir), mode) && mkdirp(dir, mode);
        }
        throw error;
    }
}

module.exports = {
    start: function(browser) {

        let def = {};
        const videoSettings = browser.globals.test_settings.videos;
        const currentTest = browser.currentTest;

        if (videoSettings && videoSettings.enabled) {

            const isWin = /^win/.test(process.platform);
            const isMac = /^darwin/.test(process.platform);
            const isLin = /^linux/.test(process.platform);

            if (isWin) def = config['win'];
            if (isLin) def = config['lin'];
            if (isMac) def = config['mac'];

            const format = videoSettings.format || 'mp4';
            const file = path.resolve(path.join(videoSettings.path || '', videoSettings.fileName.concat('.', format)));
            mkdirp(path.dirname(file));

            browser.ffmpeg = require('child_process').execFile('ffmpeg',
                [
                    '-video_size',
                    videoSettings.resolution || '1440x900',
                    '-r',
                    videoSettings.fps || 15,
                    '-f',
                    def.encode,
                    '-i',
                    videoSettings.input || def.input,
                    '-vcodec',
                    videoSettings.videoCodec || 'libx264',
                    '-loglevel',
                    'error',
                    file
                ],
          function(error, stdout, stderr) {
              browser.ffmpeg = null;
              if (error.signal !== killSignal) {
                  throw error;
              }
          })
          .on('close', function() {
              if (videoSettings.delete_on_success && !currentTest.results.failed) {
                  require('fs').unlink(file);
              }
          });
        }
    },
    stop: function(browser) {
        if (browser.ffmpeg) {
            browser.ffmpeg.stdin.pause();
            browser.ffmpeg.kill('SIGKILL');
        }
    }
};

'use strict';

const path = require('path');
const config = require('./config');

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

let videoSettings;
let file;
let format;

module.exports = {
    start: function(browser, done) {

        let def = {};
        videoSettings = browser.globals.test_settings.videos;

        if (videoSettings && videoSettings.enabled) {

            const isWin = /^win/.test(process.platform);
            const isMac = /^darwin/.test(process.platform);
            const isLin = /^linux/.test(process.platform);

            if (isWin) def = config['win'];
            if (isLin) def = config['lin'];
            if (isMac) def = config['mac'];

            format = videoSettings.format || 'mp4';
            file = path.resolve(path.join(videoSettings.path || '', videoSettings.fileName.concat('.', format)));
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
                    if (error) {
                        throw error;
                    }
                });
        }

        done();
    },
    stop: function(browser, done, testPassed) {
        const testResults = browser.currentTest.results;

        if (browser.ffmpeg) {
            browser.ffmpeg.on('exit', (code) => {
                if (videoSettings.deleteOnSuccess && typeof testResults === 'undefined' && typeof testPassed !== 'boolean') {
                    console.log(`
                      Your configuration is sending browser.currentTest.results as undefined, therefore deleteOnSuccess is not working properly.
                      This object is currently only supported in Nightwatch test runner (https://github.com/nightwatchjs/nightwatch/issues/1104). \n
                      If you are using Mocha test runner, you can enable videoSettings.deleteOnSuccess: true with;\n
                      afterEach(function (browser, done) {
                        const testResults = this.currentTest.state !== 'failed';
                        require('nightwatch-record').stop(browser, done, testResults);
                      });
                      
                      Please note that testPassed argument has to be boolean. True in case test passed, false if test failed. 
                      You can send same argument with other test runners as well, if you can gain this variable in the afterEach hook.
                `);
                }

                const didTestPass = (typeof testResults !== 'undefined' && !testResults.failed) || testPassed;

                if (videoSettings.deleteOnSuccess && didTestPass) {
                    require('fs').unlink(file, function(err) {
                        if (err) throw err;
                    });
                } else if (videoSettings.nameAfterTest) {
                    const testName = browser.currentTest.name.replace(/[^\w]/gi, '_');
                    const fileNamedAfterTest = path.resolve(path.join(videoSettings.path || '', testName.concat('.', format)));
                    require('fs').rename(file, fileNamedAfterTest, function(err) {
                        if (err) throw err;
                    });
                }

                done();
            });
            browser.ffmpeg.stdin.setEncoding('utf8');
            browser.ffmpeg.stdin.write('q');
        } else {
            done();
        }
    }
};

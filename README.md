# Nightwatch.js video screen recording via ffmpeg
Record videos of [Nightwatch.js](http://nightwatchjs.org/) test sessions, support multiple Operative Systems like MacOs, Windows(cooming soon), Linux.

Uses [ffmpeg](https://www.ffmpeg.org/) to capture a (remote) webdriver desktop screen.

## Install

```sh
  npm i nightwatch-record --save
```

## Usage

Add the following `beforeEach`/`afterEach` or `before`/`after` hooks:
```js
module.exports = {
  beforeEach: function (browser, done) {
    require('nightwatch-record').start(browser);
  },
  afterEach: function (browser, done) {
    require('nightwatch-record').stop(browser);
  }
}
```

If you are using Mocha test runner, you can use;
```js
  beforeEach(function(browser, done) {
    require('nightwatch-record').start(browser);
    done();
  });

  afterEach(function (browser, done) {
    const testPassed = this.currentTest.state !== 'failed'; // Fix videoSettings.deleteOnSuccess: true issue with other test runners
    require('nightwatch-record').stop(browser, done, testPassed);
  });
```


Enable the video screen recording in your test settings:
```json
{
  "test_settings": {
    "default": {
      "videos": {
        "fileName": "example", // Required field
        "nameAfterTest": true,
        "format": "mp4",
        "enabled": true,
        "deleteOnSuccess": false,
        "path": "",
        "resolution": "1440x900",
        "fps": 15,
        "input": "",
        "videoCodec": "libx264"
      }
    }
  }
}
```

If your configuration is sending `browser.currentTest.results` as `undefined, `videoSettings.deleteOnSuccess: true` will not work properly. This object is currently only supported in Nightwatch test runner (https://github.com/nightwatchjs/nightwatch/issues/1104).
                      
Please note that testPassed argument has to be boolean. True in case test passed, false if test failed. 

You can send same argument with other test runners as well, if you can gain this variable in the afterEach hook.

## License
Released under the [MIT license](https://opensource.org/licenses/MIT).

## Author
[Ignacio Marenco](https://github.com/imarenco)

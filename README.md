# Nightwatch.js video screen recording via ffmpeg
Record videos of [Nightwatch.js](http://nightwatchjs.org/) test sessions, support multiple Operative Systems like MacOs, Windows(cooming soon), Linux.
Uses [ffmpeg](https://www.ffmpeg.org/) to capture a (remote) webdriver desktop screen.


Enable the video screen recording in your test settings:
```json
{
  "test_settings": {
    "default": {
      "videos": {
      "filename": "example" (required field),
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

## License
Released under the [MIT license](https://opensource.org/licenses/MIT).

## Author
[Ignacio Marenco](https://github.com/imarenco)

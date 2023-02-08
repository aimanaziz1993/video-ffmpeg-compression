const fs = require("fs");
const path = require("path");
const { LocalFileData } = require("get-file-object-from-local-path");

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

process.on("message", (payload) => {
  const { tempFilePath, name } = payload;
  const newFilename = Date.now() + '_' + name;

  const endProcess = (endPayload) => {
    console.log(endPayload)
    const { statusCode, text, data } = endPayload;

    console.log(data)
    const fileData = new LocalFileData( path.join(`./temp/${data}`) )

    // Remove temp file
    fs.unlink(tempFilePath, (err) => {
      if (err) {
        process.send({ statusCode: 500, text: err.message });
      }
    });

    // Read file url
    // var mediaPath = path.join('./temp')

    // Format response so it fits the api response
    process.send({ statusCode, text, fileData });
    // End process
    process.exit();
  };

  // Process video and send back the result
  ffmpeg(tempFilePath)
    .fps(30)
    .addOptions(["-crf 28"])
    .on("end", () => {
        
      endProcess({ statusCode: 200, text: "Success", data: newFilename });
    })
    .on("error", (err) => {
        console.log(err)
      endProcess({ statusCode: 500, text: err.message });
    })
    .save(`./temp/${newFilename}`);
});
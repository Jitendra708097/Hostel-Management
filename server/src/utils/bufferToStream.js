const { Readable } = require('stream'); // For converting buffer to stream for Cloudinary


// this to upload single file
// 'mediaFile' is the name of the field in your form input (e.g., <input type="file" name="mediaFile">)
function bufferToStream(buffer) {
    console.log("Invoked0");
    const readable = new Readable();
    console.log("Invoked1");
    readable._read = () => {}; // _read is required but you can noop it
    readable.push(buffer);
    readable.push(null);
    return readable;
}

module.exports = bufferToStream;
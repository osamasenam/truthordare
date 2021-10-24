const aws = require("aws-sdk");
const fs = require("fs");
const bucketName = 'spicedling';

let secrets;
if(process.env.NODE_ENV) {
    //this means we are running in production
    secrets = process.env;
} else {
    // we are running locally
    secrets = require("./secrets.json");
}

// this will allow us to interact with our s3 storage via API
const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
});

// the middleware for uploading
module.exports.upload = (req, res, next) => {
    if(!req.file) {
        // if there is no file or something went wrong
        return res.sendStatus(500); // server failure
    }
    // extracting info for multer's file
    const {filename, mimetype, size, path} = req.file;

    // invoking the putObject method to upload the file
    const promise = s3.putObject({
        Bucket: bucketName,
        ACL: 'public-read',
        Key: filename,
        Body: fs.createReadStream(path),
        ContentType: mimetype,
        ContentLength: size
    }).promise();

    // when this promise is done
    promise.then(() => {
        console.log("upload is done!");
        next();

        // then delete this file from the temprory /uploads dir
        fs.unlink(path, () => {
            console.log("img should be deleted from /uploads");
        });
    })
    .catch((err) => {
        console.log("upload failed!");
    })

}
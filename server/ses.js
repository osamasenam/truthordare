const aws = require('aws-sdk');

let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require('./secrets.json'); // in dev they are in secrets.json which is listed in .gitignore
}

const ses = new aws.SES({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
    region: 'eu-west-1'
});

module.exports.sendEmail = (toAddress, subject, text) => {
    return ses.sendEmail({
        Source: ' EL PROFESSOR <summer.burglar@spicedling.email>',
        Destination: {
            ToAddresses: [toAddress]
        },
        Message: {
            Body: {
                Text: {
                    Data: text
                }
            },
            Subject: {
                Data: subject
            }
        }
    });
};
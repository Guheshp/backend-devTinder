const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

// 1. Initialize S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});

// 2. Upload Function
const uploadToS3 = async (file) => {
    const fileName = `profiles/${Date.now()}_${file.originalname}`;

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: "public-read", // Uncomment if your bucket isn't strictly private
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        // Return the public URL
        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw new Error("File upload failed");
    }
};

module.exports = { uploadToS3 };
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import sharp from "sharp";




(async function () {
  const app = express();
  const cacheTime = 86400000; // 1 day in milliseconds

  app.use("/public", express.static("public", { maxAge: cacheTime }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static("public/images/test.png"));
  app.use(cors());
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.set("serverMaxHeaderSize", 1024 * 4096);

  const s3 = new S3Client({
    region: "us-east-2",
    credentials: {
      accessKeyId: "AKIA5OJVOLKBPBBJIEHK",
      secretAccessKey: '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',
    },
  });

  // const s3Arplas = new S3Client({
  //   region: "us-east-2",
  //   credentials: {
  //     accessKeyId: "AKIA5OJVOLKBBYFVOOHG",
  //     secretAccessKey: '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',
  //   },
  // });



  const compressImage = async (url) => {
    const image = await sharp(url).webp({ quality: 80 }).toBuffer();
    return `data:image/jpeg;base64,${image.toString('base64')}`;
  }

  app.get('/images-main', async (req, res) => {
    try {
      const command = new ListObjectsV2Command({ Bucket: "proffsystem" });
      const response = await s3.send(command);
      const fileUrls = response.Contents.map((file) => ({
        name: file.Key,
        url: `https://s3.us-east-2.amazonaws.com/${response.Name}/${file.Key}`,
      }));
      const compressedUrls = await Promise.all(fileUrls);
      res.json(compressedUrls);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });


  app.get('/images-arplas', async (req, res) => {
    try {
      const command = new ListObjectsV2Command({ Bucket: "arplas" });
      const response = await s3.send(command);
      const fileUrls = response.Contents.map((file) => ({
        name: file.Key,
        url: `https://s3.us-east-2.amazonaws.com/${response.Name}/${file.Key}`,
      }));
      const compressedUrls = await Promise.all(fileUrls);
      res.json(compressedUrls);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });


  app.listen(3333);
})();






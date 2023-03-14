// import bodyParser from "body-parser";
// import cors from "cors";
// import express from "express";
// import { MongoClient, ServerApiVersion } from "mongodb";
// import mongoose, { Schema } from "mongoose";
// import AWS from 'aws-sdk';
//
//
//
//
//
// (async function () {
//
//
//   const uri = "mongodb+srv://main:93285797@profsystem.prx6imm.mongodb.net/ProfSystem?retryWrites=true&w=majority"; // Proffsystem database
//   const mongoClient = new MongoClient(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     serverApi: ServerApiVersion.v1,
//   });
//   await mongoose.connect(uri);
//   await mongoClient.connect();
//   mongoose.set("strictQuery", false);
//   const app = express();
//   app.use(express.urlencoded({ extended: true }));
//   app.use(express.json());
//   app.use(express.static("public/images/test.png"));
//   app.use(cors());
//   app.use(bodyParser.json({ limit: "50mb" }));
//   app.use(bodyParser.urlencoded({ extended: true }));
//   app.use(bodyParser.json());
//   app.set("serverMaxHeaderSize", 1024 * 4096);
//
//
//
//
//   const s3 = new AWS.S3({
//     accessKeyId: process.env.AWS_ACCESSKEY,
//     secretAccessKey: process.env.AWS_SECRETKEY,
//   });
//
//   app.get('/images-main', async (req, res) => {
//     try {
//       const data = await s3.listObjectsV2({ Bucket: 'proffsystem' }).promise();
//       const fileUrls = data.Contents.map((file) => ({
//         name: file.Key,
//         url: `https://s3.amazonaws.com/${data.Name}/${file.Key}`,
//       }));
//       res.json(fileUrls);
//     } catch (err) {
//       console.error(err);
//       res.status(500).send('Internal server error');
//     }
//   });
//
//
//
//
//   app.listen(3333);
// })();


import https from 'https';
import fs from 'fs';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import mongoose, { Schema } from 'mongoose';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import * as path from "path";

(async function () {
  const uri = 'mongodb+srv://main:93285797@profsystem.prx6imm.mongodb.net/ProfSystem?retryWrites=true&w=majority'; // Proffsystem database
  const mongoClient = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  await mongoose.connect(uri);
  await mongoClient.connect();
  mongoose.set('strictQuery', false);
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static('public/images/test.png'));
  app.use(cors());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.set('serverMaxHeaderSize', 1024 * 4096);

  const s3 = new S3Client({
    region: "us-east-2",
    credentials: {
      accessKeyId: "AKIA5OJVOLKBPBBJIEHK",
      secretAccessKey: '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',
    },
  });

  app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });



  app.get('/images-main', async (req, res) => {
    console.log('get')
    try {
      const command = new ListObjectsV2Command({ Bucket: "proffsystem" });
      const response = await s3.send(command);
      const fileUrls = response.Contents.map((file) => ({
        name: file.Key,
        url: `https://s3.us-east-2.amazonaws.com/${response.Name}/${file.Key}`,
      }));
      res.json(fileUrls);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });

  const certPath = path.resolve('server.crt');
  const keyPath = path.resolve('server.key');

  const options = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath)
  };

  https.createServer(options, app).listen(3333);
})();






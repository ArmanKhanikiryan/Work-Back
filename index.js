import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import mongoose, { Schema } from "mongoose";
import multer from "multer";
import pako from "pako";
import {Storage} from "@google-cloud/storage";

(async function () {
  const uri = "mongodb+srv://main:93285797@profsystem.prx6imm.mongodb.net/ProfSystem?retryWrites=true&w=majority"; // Proffsystem database
  const mongoClient = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  await mongoose.connect(uri);
  await mongoClient.connect();
  mongoose.set("strictQuery", false);
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static("public/images/test.png"));
  app.use(cors());
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.set("serverMaxHeaderSize", 1024 * 4096);

  const sliderCollection = mongoClient.db("ProfSystem").collection("slider");

  const arplasCollection = mongoClient.db("ProfSystem").collection("arplas")


  const imageSchema = new Schema({
    data: Buffer,
    date: { type: Date, default: Date.now },
  });
  const Image = mongoose.model("Image", imageSchema)
  const upload = multer();


  const storage = new Storage({
    projectId: 'amazing-plateau-380104',
    keyFilename: './amazing-plateau-380104-1d50eda4af26.json',
  });




  app.get('/images', async (req, res) => {
    try {
      const [files] = await storage.bucket('proffsystem').getFiles();
      const fileUrls = files.map((file) => {
        return {
          name: file.name,
          url: `https://storage.googleapis.com/${file.bucket.name}/${file.name}`,
        };
      });
      res.json(fileUrls);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });






  app.post("/post", upload.single("file"), async (req, res) => {
    const imageBuffer = Buffer.from(req.file.buffer);
    const decompressedBuffer = pako.ungzip(imageBuffer);
    const dataBuffer = Buffer.from(decompressedBuffer);
    // const image = new Image({
    //   data: dataBuffer,
    // });
    // await image.save();
    await sliderCollection.insertOne({
      data: dataBuffer, // use req.file.buffer instead of dataBuffer
    });
    res.send("File uploaded successfully!");
  });




  app.post("/post-arplas", upload.single("file"), async (req, res) => {

    const fullName = req.file.originalname
    let itemName = ''
    for (let i = 0; i < fullName.length; i++) {
      if (fullName[i] === '.'){
        itemName = fullName.slice(0,i)
      }
    }
    const imageBuffer = Buffer.from(req.file.buffer)
    const decompressedBuffer = pako.ungzip(imageBuffer)
    const dataBuffer = Buffer.from(decompressedBuffer)
    await arplasCollection.insertOne({
      name: itemName,
      data: dataBuffer
    })
    res.send('Files Uploaded')
  });






  app.get("/get-test", async (req, res) => {

    // HOW TO GET DATA FROM CERTAIN DATABASE COLLECTION



    // COMMON WAY TO GET DATA

    // const image = await Image.find();
    // const resultArr = [];
    // for (const i in image) {
    //   const compressedBuffer = pako.gzip(image[i].data);
    //   console.log(compressedBuffer)
    //   resultArr.push(compressedBuffer)
    // }
    // res.send(resultArr);

  });



  app.get("/get:id", async (req, res) => {

    // if (+req.params.id === 1){
    //   const readyData = await generateGet(sliderCollection, {
    //     isCompletely: false,
    //     arrayStart: 0,
    //     arrayEnd: 2,
    //     additionalInfo: false
    //   })
    //   res.send(readyData)
    // }else if (+req.params.id === 2){
    //   const readyData = await generateGet(sliderCollection, {
    //     isCompletely: false,
    //     arrayStart: 2,
    //     arrayEnd: 4,
    //     additionalInfo: false
    //   })
    //   res.send(readyData)
    // }

    // generateGet(sliderCollection, {
    //   isCompletely: false,
    //   arrayStart: 0,
    //   arrayEnd: 2
    // })

    // HOW TO GET DATA FROM CERTAIN DATABASE COLLECTION

    if (+req.params.id === 1){
      const image = await sliderCollection.find().toArray()
      const resultArr = [];
      for (let i = 0; i < 2; i++) {
        const binaryData = image[i].data;
        const bufferData = Buffer.from(binaryData.buffer, binaryData.byteOffset, binaryData.length);
        const compressedBuffer = pako.gzip(bufferData);
        resultArr.push(compressedBuffer)
      }
      res.send(resultArr);
    }else if (+req.params.id === 2){
      const image = await sliderCollection.find().toArray()
      const resultArr = [];
      for (let i = 2; i < 4; i++) {
        const binaryData = image[i].data;
        const bufferData = Buffer.from(binaryData.buffer, binaryData.byteOffset, binaryData.length);
        const compressedBuffer = pako.gzip(bufferData);
        resultArr.push(compressedBuffer)
      }
      res.send(resultArr);
    }

    // COMMON WAY TO GET DATA

    // const image = await Image.find();
    // const resultArr = [];
    // for (const i in image) {
    //   const compressedBuffer = pako.gzip(image[i].data);
    //   console.log(compressedBuffer)
    //   resultArr.push(compressedBuffer)
    // }
    // res.send(resultArr);

  });

  app.listen(3333);
})();


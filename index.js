import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import mongoose, { Schema } from "mongoose";
import multer from "multer";
import pako from "pako";

(async function () {
  // const uri = "mongodb+srv://main:93285797@profsystem.prx6imm.mongodb.net/?retryWrites=true&w=majority";
  const uri =
    "mongodb+srv://main:93285797@profsystem.prx6imm.mongodb.net/ProfSystem?retryWrites=true&w=majority";
  const mongoClient = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static("public/images/test.png"));
  app.use(cors());
  app.use(bodyParser.json({ limit: "50mb" }));
  await mongoClient.connect();
  mongoose.set("strictQuery", false);
  mongoose.connect(uri);
  app.set("serverMaxHeaderSize", 1024 * 4096);

  const imageSchema = new mongoose.Schema({
    data: Buffer,
    date: { type: Date, default: Date.now },
  });

  // let upload = multer({storage: storage})

  const Image = mongoose.model("Image", imageSchema);

  const upload = multer();

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.post("/post", upload.single("file"), async (req, res) => {
    const imageBuffer = Buffer.from(req.file.buffer);
    const decompressedBuffer = pako.ungzip(imageBuffer);
    const dataBuffer = Buffer.from(decompressedBuffer);

    const image = new Image({
      data: dataBuffer,
    });
    await image.save();
  });

  app.get("/get", async (req, res) => {
    const image = await Image.find();
    const resultArr = [];

      for (const i in image) {
          const compressedBuffer = pako.gzip(image[i].data);
          resultArr.push(compressedBuffer)
      }
      console.log(resultArr)
    // res.setHeader("Content-Encoding", "gzip");
    // res.setHeader("Content-Type", "image/png");
    // res.setHeader("Content-Length", compressedBuffer.byteLength);
    res.send(resultArr);

    // res.writeHead(200, {
    //     'Content-Type': 'image/jpeg',
    //     'Content-Length': imageData.length
    // });
    // res.end(imageData);
  });

  // app.delete('/register', async (req, res) => {
  //     const _id = new ObjectId(req.body._id);
  //     const a = await imageModel.findByIdAndDelete({_id});
  //     res.send("successfully deleted");
  // });
  //
  //
  // app.delete('/register/all', async (req, res) => {
  //     const a = await imageModel.deleteMany();
  //     res.send("successfully deleted");
  // });

  app.listen(3333);
})();

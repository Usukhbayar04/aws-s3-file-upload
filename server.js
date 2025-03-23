require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");

const app = express();
const port = 3000;

// AWS S3 тохиргоо
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer тохиргоо (түр хадгалах санах ой)
const upload = multer({ dest: "uploads/" });

// 📌 **Файл хүлээж авах API**
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Файл олдсонгүй!" });
    }

    const fileStream = fs.createReadStream(req.file.path);
    const uploadParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: req.file.originalname, // S3 дээр хадгалах нэр
      Body: fileStream,
    };

    const data = await s3.send(new PutObjectCommand(uploadParams));

    // Түр хадгалсан файлыг устгах
    fs.unlinkSync(req.file.path);

    res.json({ message: "Файл амжилттай байршууллаа!", data });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Файл байршуулж чадсангүй!" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

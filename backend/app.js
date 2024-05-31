const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const csv = require("csvtojson");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const mongoURI = "mongodb://localhost:27017/linkedin-bot";
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));

const MessageSchema = new mongoose.Schema({
  username: String,
  profileUrl: String,
  role: String,
  messageType: String,
  message: String,
  status: String,
  error: String,
});

const Message = mongoose.model("Message", MessageSchema);

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.file.filename);

  const pythonProcess = spawn(path.join(__dirname, "venv", "bin", "python3"), [
    "generate_messages.py",
    filePath,
    "uploads/output.csv",
  ]);

  pythonProcess.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    if (code === 0) {
      const outputFilePath = path.join(__dirname, "uploads", "output.csv");
      console.log(`Processing CSV file at ${outputFilePath}`);

      csv()
        .fromFile(outputFilePath)
        .then(async (jsonArray) => {
          console.log(
            `CSV file processed. Number of records: ${jsonArray.length}`
          );
          await Message.insertMany(jsonArray);
          console.log("Messages inserted into MongoDB");
          res.status(200).send("Messages generated and uploaded successfully.");
        })
        .catch((error) => {
          console.error("Error processing CSV file:", error);
          res.status(500).send("Error processing CSV file.");
        });
    } else {
      console.error("Error generating messages.");
      res.status(500).send("Error generating messages.");
    }
  });
});

app.get("/messages", async (req, res) => {
  const messages = await Message.find();
  res.status(200).json(messages);
});

app.post("/clear-messages", async (req, res) => {
  try {
    await Message.deleteMany({});
    res.status(200).send("Messages cleared successfully.");
  } catch (error) {
    res.status(500).send("Error clearing messages.");
  }
});

app.delete("/messages/:id", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.status(200).send("Message deleted successfully.");
  } catch (error) {
    res.status(500).send("Error deleting message.");
  }
});

app.post("/send-messages", async (req, res) => {
  try {
    const messages = await Message.find({ status: { $ne: "Sent" } });

    for (const message of messages) {
      try {
        const result = await new Promise((resolve, reject) => {
          const pythonProcess = spawn(
            path.join(__dirname, "venv", "bin", "python3"),
            ["linkedin_automation.py", message.profileUrl, message.message]
          );

          pythonProcess.stdout.on("data", (data) => {
            console.log(`stdout: ${data}`);
          });

          pythonProcess.stderr.on("data", (data) => {
            console.error(`stderr: ${data}`);
          });

          pythonProcess.on("close", (code) => {
            if (code === 0) {
              resolve("Sent");
            } else if (code === 1) {
              resolve("Sent without a note");
            } else {
              reject(new Error(`Process exited with code ${code}`));
            }
          });
        });

        if (result === "Sent") {
          await Message.findByIdAndUpdate(message._id, { status: "Sent" });
        } else if (result === "Sent without a note") {
          await Message.findByIdAndUpdate(message._id, {
            status: "Sent without a note",
          });
        }
      } catch (error) {
        console.error(`Error sending message to ${message.username}:`, error);
        await Message.findByIdAndUpdate(message._id, {
          status: "Failed",
          error: error.message,
        });
      }
    }

    res.status(200).send("Messages sent successfully.");
  } catch (error) {
    console.error("Error sending messages:", error);
    res.status(500).send("Error sending messages.");
  }
});

app.post("/add-message", async (req, res) => {
  const { username, profileUrl, role, messageType, message } = req.body;

  const newMessage = new Message({
    username,
    profileUrl,
    role,
    messageType,
    message,
    status: "Pending",
    error: "",
  });

  try {
    await newMessage.save();
    res.status(200).send("Message added successfully.");
  } catch (error) {
    res.status(500).send("Error adding message.");
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

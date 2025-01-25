import express from "express";
import cors from "cors";
import morgan from "morgan";
import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import multer from "multer";

import ApiRoutes from "./Routes/index.js";
import Config from "./Config/serverConfig.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

Config.RateLimiter(app);

const upload = multer({ dest: "uploads/" });

const getDirName = () => path.dirname(fileURLToPath(import.meta.url));

app.use("/api", ApiRoutes);

// exec(
//   "sudo apt update && sudo apt install -y python3.12 python3-pip",
//   (err, stdout, stderr) => {
//     if (err) {
//       console.error(`Error: ${err}`);
//       return;
//     }
//     if (stderr) {
//       console.error(`stderr: ${stderr}`);
//       return;
//     }
//     console.log(`stdout: ${stdout}`);
//   }
// );



exec("pipx install opencv-python", (err, stdout, stderr) => {
  if (err) {
    console.error(`Error: ${err}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});


// app.post(
//   "/api/v1/detect-papers",
//   upload.fields([
//     { name: "initialImage", maxCount: 1 },
//     { name: "finalImage", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     const { files } = req;
//     if (!files.initialImage || !files.finalImage) {
//       return res.status(400).json({ error: "Both images are required." });
//     }

//     const initialImagePath = files.initialImage[0].path;
//     const finalImagePath = files.finalImage[0].path;

//     try {
//       const pythonScriptPath = path.join(getDirName(), "detect_papers.py");

//       exec(
//         `python ${pythonScriptPath} ${initialImagePath} ${finalImagePath}`,
//         async (error, stdout, stderr) => {
//           await fs.unlink(initialImagePath);
//           await fs.unlink(finalImagePath);

//           if (error) {
//             console.error(`Error: ${stderr}`);
//             return res.status(500).json({ error: "Error processing images" });
//           }

//           try {
//             const result = JSON.parse(stdout);
//             res.json(result);
//           } catch (parseError) {
//             console.error("Error parsing Python script output:", parseError);
//             res.status(500).json({ error: "Error processing results" });
//           }
//         }
//       );
//     } catch (error) {
//       console.error("Server error:", error);
//       res.status(500).json({ error: "Server error" });
//     }
//   }
// );

app.post(
  "/api/v1/detect-papers",
  upload.fields([
    { name: "initialImage", maxCount: 1 },
    { name: "finalImage", maxCount: 1 },
  ]),
  async (req, res) => {
    const { files } = req;
    if (!files.initialImage || !files.finalImage) {
      return res.status(400).json({ error: "Both images are required." });
    }

    const initialImagePath = files.initialImage[0].path;
    const finalImagePath = files.finalImage[0].path;

    try {
      // const pythonScriptPath = path.join(__dirname, "detect_papers.py");
      const pythonScriptPath = path.join(getDirName(), "detect_papers_1.py");
      exec(
        `python ${pythonScriptPath} ${initialImagePath} ${finalImagePath}`,
        { maxBuffer: 1024 * 5000 },
        async (error, stdout, stderr) => {
          try {
            await fs.unlink(initialImagePath);
            await fs.unlink(finalImagePath);
          } catch (unlinkError) {
            console.error("Error deleting temporary files:", unlinkError);
          }

          if (error) {
            console.error(`Error: ${stderr}`);
            console.log("Error processing images", error);
            return res.status(500).json({ error: "Error processing images" });
          }

          try {
            const result = JSON.parse(stdout);
            res.json(result);
          } catch (parseError) {
            console.error("Error parsing Python script output:", parseError);
            res.status(500).json({ error: "Error processing results" });
          }
        }
      );
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

const PORT = Config.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/`);
});

import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

export const detectPaper = async (req, res) => {
  try {
    const initialImagePath = req.files.initialImage[0].path;
    const finalImagePath = req.files.finalImage[0].path;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const pythonScript = path
      .join(__dirname, "detect_papers.py")
      .replace(/\\/g, "/");

    exec(
      `python ${pythonScript} ${initialImagePath} ${finalImagePath}`,
      (error, stdout, stderr) => {
        fs.unlinkSync(initialImagePath);
        fs.unlinkSync(finalImagePath);

        if (error) {
          console.error(`Error: ${stderr}`);
          return res.status(500).json({ error: "Error processing images" });
        }

        const result = JSON.parse(stdout);
        res.json(result);
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

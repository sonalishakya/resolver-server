const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

const TEMPLATES_DIR = path.join(__dirname, "templates");

// API to list all templates
app.get("/api/templates", (req, res) => {
  fs.readdir(TEMPLATES_DIR, (err, files) => {
    if (err) return res.status(500).send("Error reading templates directory.");
    const templates = files.map((file) => file.replace(".json", ""));
    res.json({ templates });
  });
});

// API to fetch a specific template
app.get("/api/template/:name", (req, res) => {
  const templatePath = path.join(TEMPLATES_DIR, `${req.params.name}.json`);
  fs.readFile(templatePath, "utf-8", (err, data) => {
    if (err) return res.status(404).send("Template not found.");
    res.json(JSON.parse(data));
  });
});

// API to handle form submission
app.post("/api/submit", (req, res) => {
  const { populatedTemplate } = req.body;
  console.log("Received Populated Template:", populatedTemplate);
  res.json({ success: true, message: "Template submitted successfully." });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
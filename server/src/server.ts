import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

import routes from "./routes/index.js";

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 3001;

// Serve static files
app.use(express.static(path.resolve(__dirname, "../../client/dist")));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(routes);

// Catch-all route to serve the client app
app.get("*", (_req, res) => {
  res.sendFile(path.resolve(__dirname, "../../client/dist/index.html"));
});

// Start the server
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));

import express from "express";
import cors from "cors";
import config from "./config";
import { logger } from "./middleware/logger";
import { requestLogger } from "./middleware/requestLogger";
import notificationRoutes from "./routes/notificationRoutes";

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(requestLogger);
app.use("/api/notifications", notificationRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(async (req, res) => {
  await logger("warn", "route", `404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Route not found." });
});

app.listen(config.port, async () => {
  await logger("info", "config", `Server started on port ${config.port}`);
  console.log(`Server running at http://localhost:${config.port}`);
});

export default app;
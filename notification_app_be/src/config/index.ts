import dotenv from "dotenv";
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  authToken: process.env.AUTH_TOKEN || "",
  testServerBaseUrl: process.env.TEST_SERVER_BASE_URL || "http://4.224.186.213/evaluation-service",
};

export default config;
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { db } from "./config/firebaseAdmin.js";
import helmet from "helmet";
import { xss } from "express-xss-sanitizer";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cors from "cors";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

// Routes (ES module imports)
import plantRoute from "./routes/plantRoute.js";
import authRoute from "./routes/authRoute.js";
import auditLogRoute from "./routes/auditLogRoute.js";

dotenv.config({ path: "./config/config.env" });

const app = express();

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express VacQ API",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(xss());
app.use(rateLimit({ windowMs: 10 * 60 * 1000, max: 1000 }));
app.use(hpp());
app.use(cors());

app.use((req, res, next) => {
  console.log('='.repeat(50));
  console.log(`Incoming Request`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Original URL: ${req.originalUrl}`);
  console.log('='.repeat(50));
  next();
});

// Routes
app.use("/api/v1/auditlogs", auditLogRoute);
app.use("/api/v1/plants", plantRoute);
app.use("/api/v1/auth", authRoute);

// Firebase test endpoint
app.get("/test", async (req, res) => {
  try {
    const snapshot = await db.ref("test").once("value");
    res.json(snapshot.val());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

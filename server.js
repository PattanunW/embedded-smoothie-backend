const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { db } = require("./config/firebaseAdmin"); 
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // your route files
};

dotenv.config({ path: "./config/config.env" });

const app = express();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 mins
  max: 1000,
});
const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(limiter);
app.use(hpp());
app.use(cors());

const carRoute = require("./routes/carRoute");
const authRoute = require("./routes/authRoute");
const auditLogRoute = require("./routes/auditLogRoute");

app.use("/api/v1/auditlogs", auditLogRoute);
app.use("/api/v1/cars", carRoute);
app.use("/api/v1/auth", authRoute);

//tester firebase 
app.get("/test", async (req, res) => {
  const snapshot = await db.ref("test").once("value");
  res.json(snapshot.val());
});

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

//handle unhandeled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  //close server and exit process
  server.close(() => process.exit(1));
});

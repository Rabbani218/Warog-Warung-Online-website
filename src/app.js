const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const clientRoutes = require("./routes/clientRoutes");
const adminRoutes = require("./routes/adminRoutes");
const kdsRoutes = require("./routes/kdsRoutes");
const authRoutes = require("./routes/authRoutes");
const { issueCsrfToken } = require("./middleware/csrfProtection");
const { attachAuthUser } = require("./middleware/auth");
const { errorHandler } = require("./middleware/errorHandler");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(attachAuthUser);
app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.status(200).json({ message: "POS API running" });
});

app.get("/api/csrf-token", issueCsrfToken);

app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/kds", kdsRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});

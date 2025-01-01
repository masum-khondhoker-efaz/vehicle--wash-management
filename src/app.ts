import express, { Application, Request, Response } from "express";
import httpStatus from "http-status";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
import { socialLoginRoutes } from "./app/modules/SocialLogin/socialLogin.route";

dotenv.config();

const app: Application = express();


export const corsOptions = {
  origin: [
    'http://localhost:3001',
    'http://localhost:3000',
    'https://car-wash-dashboard-next.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Session setup for OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(socialLoginRoutes);


// Route handler for root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Demos Server is Running",
  });
});

// API routes
app.use("/api/v1", router);

// Global error handling
app.use(GlobalErrorHandler);

// Not found handler
app.use((req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;

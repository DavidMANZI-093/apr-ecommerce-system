import express from "express";
import { createContext, t } from "./controllers/trpc";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { logger } from "./utils/logger";
import { prisma } from "./controllers/prisma";

const appRouter = t.router({
    
});

export type AppRouter = typeof appRouter;

const app = express();

app.use(
    "/trpc",
    createExpressMiddleware({
        router: appRouter,
        createContext,
    }),
);

app.get("/health", async (req, res) => {
    try {
        // Quick database ping
		await prisma.$queryRaw`SELECT 1`;

		res.status(200).json({
			status: "healthy",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			memory: {
				used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
				total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB",
			},
			database: "connected",
			version: process.env.npm_package_version || "unknown",
		});

		logger.info("Health check successful", {
			operation: "healthCheck",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			memory: {
				used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
				total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB",
			},
			version: process.env.npm_package_version || "unknown",
		});
    } catch (error) {
        res.status(503).json({
			status: "unhealthy",
			timestamp: new Date().toISOString(),
			error: "Database connection failed",
		});

		logger.error("Health check failed", {
			operation: "healthCheck",
			timestamp: new Date().toISOString(),
			error: "Database connection failed",
		});
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

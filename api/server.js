require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const characterRoutes = require("./routes/characters");
const setRoutes = require("./routes/sets");
const deckRoutes = require("./routes/decks");
const gameRoutes = require("./routes/games");
const tournamentRoutes = require("./routes/tournaments");
const tradeRoutes = require("./routes/trades");
const boosterRoutes = require("./routes/boosters");

// Import middleware
const { errorHandler } = require("./middleware/errorHandler");
const { notFound } = require("./middleware/notFound");

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
        },
    },
}));
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "*",
        credentials: true,
        optionsSuccessStatus: 200,
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        error: "Too many requests from this IP, please try again later.",
    },
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
} else {
    app.use(morgan("combined"));
}

// Swagger documentation
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "TCG Mobile API",
            version: "1.0.0",
            description:
                "API REST pour un jeu de cartes à collectionner mobile avec des personnages",
            contact: {
                name: "Alexandre Bernardini",
                email: "contact@example.com",
            },
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api`,
                description: "Development server (local)",
            },
            {
                url: `http://172.233.255.18:${PORT}/api`,
                description: "Development server (remote)",
            },
        ],
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
    apis: ["/app/routes/*.js", "/app/controllers/*.js", "/app/models/*.js"],
};

const specs = swaggerJsdoc(swaggerOptions);

// Debug: Log the specs to see if they're being generated
console.log("Swagger specs generated:", Object.keys(specs));
console.log("Number of paths found:", Object.keys(specs.paths || {}).length);

// Swagger documentation routes
app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(specs);
});

// Custom Swagger UI page using CDN
app.get("/api-docs", (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TCG Mobile API Documentation</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
        <style>
            html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
            *, *:before, *:after { box-sizing: inherit; }
            body { margin:0; background: #fafafa; }
            .swagger-ui .topbar { display: none; }
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
        <script>
            window.onload = function() {
                const ui = SwaggerUIBundle({
                    url: '/api-docs.json',
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIStandalonePreset
                    ],
                    plugins: [
                        SwaggerUIBundle.plugins.DownloadUrl
                    ],
                    layout: "StandaloneLayout"
                });
            };
        </script>
    </body>
    </html>`;
    res.send(html);
});

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        service: "TCG Mobile API",
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/sets", setRoutes);
app.use("/api/decks", deckRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/boosters", boosterRoutes);

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(
        `📚 API Documentation available at http://localhost:${PORT}/api-docs`
    );
    console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
});

module.exports = app;

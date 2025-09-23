/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    console.error(err);

    // Prisma validation error
    if (err.code === "P2002") {
        const message = "Resource already exists";
        error = { message, statusCode: 400 };
    }

    // Prisma record not found
    if (err.code === "P2025") {
        const message = "Resource not found";
        error = { message, statusCode: 404 };
    }

    // Prisma foreign key constraint
    if (err.code === "P2003") {
        const message = "Invalid reference to related resource";
        error = { message, statusCode: 400 };
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        const message = "Invalid token";
        error = { message, statusCode: 401 };
    }

    if (err.name === "TokenExpiredError") {
        const message = "Token expired";
        error = { message, statusCode: 401 };
    }

    // Validation errors
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
        error = { message, statusCode: 400 };
    }

    // Multer errors (file upload)
    if (err.code === "LIMIT_FILE_SIZE") {
        const message = "File too large";
        error = { message, statusCode: 400 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

module.exports = { errorHandler };

const errorHandler = (error, _req, res, next) => {
    if (res.headersSent) return next(error);

    let status = Number.isInteger(error.statusCode)
        ? error.statusCode
        : Number.isInteger(error.status)
            ? error.status
            : 500;
    if (error.code === 11000) status = 409;
    if (["ValidationError", "CastError"].includes(error.name)) status = 400;
    if (status < 400 || status > 599) status = 500;

    if (status >= 500) {
        console.error("Request failed:", error.name || "Error", error.code || "");
    }

    const message = status >= 500
        ? "Internal server error."
        : error.type === "entity.too.large"
            ? "Request body exceeds the 64 KB limit."
            : error.type === "entity.parse.failed"
                ? "Request body must contain valid JSON."
                : error.code === 11000
                    ? "A record with those details already exists."
                    : ["ValidationError", "CastError"].includes(error.name)
                        ? "Request data is invalid."
                        : error.message || "Request failed.";

    return res.status(status).json({ message });
};

module.exports = errorHandler;

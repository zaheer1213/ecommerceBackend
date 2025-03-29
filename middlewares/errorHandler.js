const errorHandler = (err, req, res, next) => {
    console.error(err.stack || err.message);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: message,
    });
};

module.exports = errorHandler;

export const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  console.error(err);
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
};

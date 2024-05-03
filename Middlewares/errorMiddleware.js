const notFound = (req,res,next) => {
   const notFoundHandler = new Error(`Not found - ${req.originUrl}`) ;
    res.status(404);
   next(notFoundHandler)
};

const errorHandler = (err,req,res,next) => {
   const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
   res.status(statusCode)
   res.json({
      message:err.message,
      stack:process.env.NODE_ENV === 'production' ? null : err.stack,
   })
}

module.exports = {notFound, errorHandler}
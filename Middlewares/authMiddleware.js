const jwt = require('jsonwebtoken');
const User = require('../Models/userModel.js');
const asyncHandler = require('express-async-handler');


const protect = asyncHandler(async (req,res, next ) => {
   let token;

   if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
      try {
         token = req.headers.authorization.split(" ")[1];

         //DECODES TOKEN ID
         const decoded = jwt.verify(token, process.env.JWT_SECRET);

         req.user = await User.findById(decoded.id).select("-password");
         next()
      } catch (error) {
         return res.status(401).json({error:"not authorized, token failed"})
      }
   }

   if(!token){
      return res.status(401).json({error:"not authoized, no token"})
   }

})

module.exports = {protect};
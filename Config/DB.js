const mongoose = require('mongoose');

const connectDB = async () => {
   try {
      const connection = await mongoose.connect(process.env.MONGO_URI);
      console.log('Db connected')
   } catch (error) {
      console.log('error in connection db', error);
      process.setSourceMapsEnabled()
   }
};

module.exports = connectDB;
//IMPORTS
const express = require('express');
const { chats } = require('./Data/ChatData.js');
const dotenv = require('dotenv').config();
const cors = require('cors');
const connectDB = require('./Config/DB.js');
const userRoutes = require('./Routes/userRoute.js');
const { notFound, errorHandler } = require('./Middlewares/errorMiddleware.js');

//MIDDELEWARES
const app = express();
app.use(express.json()) //TO ACCEPT JSON DATA
app.use(cors());
connectDB();

//SAMPLE ROUTE
app.get('/',(req,res) => {
   res.send('sample check of api')
})

//USERROUTES
app.use('/api/user', userRoutes)

app.use(notFound)
app.use(errorHandler)


// SERVER CONNECTION
const PORT = process.env.PORT || 8080
app.listen(PORT, console.log(`server running in port: ${PORT}`))
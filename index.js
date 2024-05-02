const express = require('express');
const { chats } = require('./Data/ChatData.js');
const dotenv = require('dotenv').config();
const cors = require('cors')

//MIDDELEWARES
const app = express();
app.use(cors());


app.get('/',(req,res) => {
   res.send('sample check of api')
})

app.get('/api/chat', (req,res) => {
   res.send(chats)
})

app.get('/api/chat/:id', (req,res) => {
   // console.log(req.params.id);
   const singleid = chats.find((e) => e._id === req.params.id);
   res.send(singleid)
})

const PORT = process.env.PORT || 8080

app.listen(PORT, console.log(`server running in port: ${PORT}`))
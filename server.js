require('dotenv').config()
const app = require('./app');
const mongoose = require('mongoose')

const port = process.env.PORT

app.listen(port, () => {
  console.log(`Server running. Use our API on port: ${port}, http://localhost:${port}/api/contacts/`);
});

const { DB_HOST:urlDb }=process.env
const connection = mongoose.connect(urlDb)


const startServer = async () => {
  try {
    await connection;
    console.log('DB Connected')
  }
  catch (err) {
    console.log(e)
  }
}

startServer()

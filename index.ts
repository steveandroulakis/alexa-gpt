import * as dotenv from "dotenv";
const express = require('express')

const app = express();

dotenv.config();

const port = process.env.PORT;

app.get('/', (req, res) => {
    res.send('OK STEVE!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
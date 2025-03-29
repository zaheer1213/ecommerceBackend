const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const routes = require('./routes/index')
const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();
connectDB();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(errorHandler);
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.use(express.json());
app.use('/api', routes);


app.listen(5000, () => console.log('Server running on port 5000'));

const cors = require('cors');
require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const { connectToDB } = require('./config/database');

//Include Swagger
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const router = express.Router();

const whitelist = [];

app.use(
  cors({
    origin: whitelist,
    method: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  }),
);

app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
app.use(router);

const routes = require(`./routes/routes`);
const bootstrap = require('./bootstrap');
const { errorProcessing } = require('./middlewares/errorHandling');
bootstrap(router, routes);

// Swagger Api Documentation
const options = {
  swaggerDefinition: {
    info: {
      title: 'Regio',
      version: '1.0.0',
      description: 'API documentation for Regio',
    },
    basePath: '/',
  },
  apis: ['swagger.yaml'],
};

const specs = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

//Handle invalid endpoint
app.use((_, __, next) => {
  next({
    errorCode: 404,
    errorMessage: {
      statusCode: 404,
      message: 'Invalid Endpoint.',
    },
  });
});

app.use((error, request, response, next) => {
  if (error instanceof Error) error = errorProcessing(error);
  const statusCode = error.errorCode ? error.errorCode : 500;
  const statusMessage = error.errorMessage
    ? error.errorMessage
    : { error: { message: 'Internal server error.' } };
  // if status code is 500, log error to error.log file.
  response.status(parseInt(statusCode)).json(statusMessage);
});

const PORT = process.env.PORT || 5000;
const DB_NAME = process.env.TOKEN;

const setUpServer = () => {
  connectToDB(DB_NAME, () => {
    app.listen(PORT, () => {
      console.log(`Connected to port ${PORT} sucessfully`);
    });
  });
};

setUpServer();


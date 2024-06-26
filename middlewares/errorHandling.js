'use strict';
const fs = require('fs');
function errorProcessing(receivedErrorMessage) {
  // split the error response
  let errorMessage = receivedErrorMessage.message.split(':');
  errorMessage = errorMessage[1]?.split('|');
  let errorObject = errorMessage.length;
  // if no error code is provided. Call the _logger function to log error.
  if (errorObject <= 1) logErrorToFile(receivedErrorMessage);
  return {
    errorCode: errorObject > 1 ? errorMessage[0] : 500,
    errorMessage: {
      statusCode: errorMessage
        ? !isNaN(Number(errorMessage[0].trim()))
          ? Number(errorMessage[0].trim())
          : 500
        : 500,
      message: errorObject > 1 ? errorMessage[1] : 'Internal Server Error.',
    },
  };
}

function errorHandling(receivedErrorMessage) {
  throw new Error(receivedErrorMessage);
}

function logErrorToFile(receivedErrorMessage) {
  console.log(receivedErrorMessage);
  fs.appendFileSync(
    'error.log.txt',
    new Date() + ' ' + receivedErrorMessage + '\r\n',
  );
}

module.exports = {
  errorProcessing,
  errorHandling,
};


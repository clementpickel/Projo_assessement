const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PROJO Word-to-Image API',
      version: '1.0.0',
      description: 'Minimal backend proxy for Word-to-Image generation',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
      {
        url: 'http://projo-back./clementpickel.fr',
        description: 'Remote server',
      },
    ],
  },
  apis: ['./routes/*.js'], // files where Swagger annotations live
};

module.exports = swaggerJsdoc(options);
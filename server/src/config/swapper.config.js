"use strict";

const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Clothing Fashion Shop API Documentation",
      version: "1.0.0",
      description: "API Documentation cho hệ thống quản lý shop thời trang",
      contact: {
        name: "API Support",
        email: "dinhnguyenminhhoang28@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3055/v1/api",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        clientId: {
          type: "apiKey",
          in: "header",
          name: "x-client-id",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
        clientId: [],
      },
    ],
  },
  apis: ["./src/routers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
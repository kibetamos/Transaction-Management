const express = require('express');
const route = express.Router();

const services = require('../services/render');
const controller = require('../controller/controller');

/**
 * @description Root Route
 * @method GET/
 */
route.get('/', services.homeRoutes);

// API
route.post('/api/get/portfolios', controller.getPortfolios);

module.exports = route;
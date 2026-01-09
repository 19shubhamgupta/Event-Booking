const express = require('express');
const { getUpcoming, getEventBycategory , getMovies } = require('../controllers/discoveryController');

const eventRouter = express.Router();

eventRouter.get('/get-upcoming-events', getUpcoming);
eventRouter.get('/get-category-events', getEventBycategory);
eventRouter.get('/get-movies', getMovies);

module.exports = eventRouter;
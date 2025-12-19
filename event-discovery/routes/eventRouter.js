const express = require('express');
const { getUpcoming, getEventBycategory } = require('../controllers/discoveryController');

const eventRouter = express.Router();

eventRouter.get('/get-upcoming-events', getUpcoming);
eventRouter.get('/get-category-events', getEventBycategory);

module.exports = eventRouter;
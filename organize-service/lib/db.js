const mongoose = require('mongoose');

const ConnectDB = async () => {
    try {
        console.log("connecting to db ...")
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

module.exports = ConnectDB;
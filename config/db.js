const mongoose = require('mongoose');

const connectDB = async () => {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(`mongodb+srv://krider8611:BackEnd123456@carrental.3nvg6.mongodb.net/CarRental`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
}

module.exports = connectDB;
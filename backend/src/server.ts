import mongoose from 'mongoose';
import app from './app';

const PORT = process.env.PORT || 5000;
console.log('PORT:', PORT);
console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/recruit-ai';

const startServer = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

startServer();

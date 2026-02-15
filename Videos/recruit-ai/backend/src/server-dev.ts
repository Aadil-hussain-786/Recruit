import mongoose from 'mongoose';
import app from './app';

const PORT = process.env.PORT || 5000;
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/recruit-ai';

const startServer = async () => {
    try {
        console.log('Connecting to MongoDB via Mongoose...');
        
        // In development, if MongoDB is not available, we'll show an error but not exit
        if (process.env.NODE_ENV === 'development') {
            try {
                await mongoose.connect(MONGO_URI);
                console.log('MongoDB Connected');
            } catch (mongoError) {
                console.error('Warning: Failed to connect to MongoDB:', (mongoError as Error).message || mongoError);
                console.log('Running in development mode without database connection...');
            }
        } else {
            // In production, MongoDB connection is required
            await mongoose.connect(MONGO_URI);
            console.log('MongoDB Connected');
        }

        console.log('Starting Express server...');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

console.log('Starting server process...');
startServer();
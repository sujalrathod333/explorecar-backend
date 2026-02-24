import mongoose from 'mongoose';

export const connectDB = async () => { 
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sujalreplit_db_user:sujal333@cluster0.vhnwo2k.mongodb.net/CarRental?retryWrites=true&w=majority');
        console.log('MongoDB Connected');
    } catch (err) {
        console.log('MongoDB connection error:', err);
    }
}
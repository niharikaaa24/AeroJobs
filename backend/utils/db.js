import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.mongo_uri);
        console.log('mongodb connected successfully');
    } catch (error) {
        console.log(error);
    }
}
export default connectDB;





















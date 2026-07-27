import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkStats() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");
        const stats = await mongoose.connection.db.stats();
        console.log(JSON.stringify(stats, null, 2));
        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

checkStats();

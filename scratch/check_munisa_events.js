import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Attendance from '../models/Attendance.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function checkRecord() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const today = new Date().toISOString().split('T')[0];
        const record = await Attendance.findOne({ 
            hikvisionEmployeeId: "abdurahmanovamunisa", 
            date: today 
        });

        if (record) {
            console.log("Current Record for Munisa:");
            console.log("- First Check-in:", record.firstCheckIn);
            console.log("- Last Check-out:", record.lastCheckOut);
            console.log("- Events:", JSON.stringify(record.events, null, 2));
        } else {
            console.log("Record not found.");
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}
checkRecord();

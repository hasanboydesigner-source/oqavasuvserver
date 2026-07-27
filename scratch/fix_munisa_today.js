import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Attendance from '../models/Attendance.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function fixMunisaCheckout() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const today = new Date().toISOString().split('T')[0];
        
        // Find Munisa's attendance
        const record = await Attendance.findOne({ 
            hikvisionEmployeeId: "abdurahmanovamunisa", 
            date: today 
        });

        if (record) {
            console.log(`Fixing Munisa's record for ${today}...`);
            
            // Set firstCheckIn if missing
            if (!record.firstCheckIn) record.firstCheckIn = "08:59";
            
            // Set lastCheckOut
            record.lastCheckOut = "18:04";
            
            // Add events if missing
            if (record.events.length === 0) {
                record.events = [
                    { time: "08:59", type: "IN", timestamp: new Date(`${today}T08:59:00+05:00`) },
                    { time: "18:04", type: "OUT", timestamp: new Date(`${today}T18:04:00+05:00`) }
                ];
            } else if (record.events.length === 1) {
                 record.events.push({ time: "18:04", type: "OUT", timestamp: new Date(`${today}T18:04:00+05:00`) });
            }

            await record.save();
            console.log("✅ Fixed. Munisa now has check-out at 18:04.");
        } else {
            console.log("❌ Record not found.");
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}
fixMunisaCheckout();

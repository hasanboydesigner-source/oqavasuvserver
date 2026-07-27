import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function fixMunisa() {
    try {
        console.log("🔗 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected.");

        // 1. Find the two Munisa records
        const primaryId = "abdurahmanovamunisa"; // The one with 'a'
        const secondaryId = "abdurahmonovamunisa"; // The one with 'o'

        const primaryEmp = await Employee.findOne({ hikvisionEmployeeId: primaryId });
        const secondaryEmp = await Employee.findOne({ hikvisionEmployeeId: secondaryId });

        if (!primaryEmp || !secondaryEmp) {
            console.log("⚠️ Could not find both records. Primary exists:", !!primaryEmp, "Secondary exists:", !!secondaryEmp);
            
            // If primary is missing but secondary exists, maybe we should swap
            if (!primaryEmp && secondaryEmp) {
                console.log("Swapping: Secondary will become primary.");
            } else {
                 await mongoose.disconnect();
                 return;
            }
        }

        console.log(`Merging ${secondaryId} into ${primaryId}...`);

        // 2. Ensure primary has both as aliases
        if (!primaryEmp.aliases) primaryEmp.aliases = [];
        if (!primaryEmp.aliases.includes(primaryId)) primaryEmp.aliases.push(primaryId);
        if (!primaryEmp.aliases.includes(secondaryId)) primaryEmp.aliases.push(secondaryId);
        
        await primaryEmp.save();
        console.log("✅ Primary employee updated with aliases.");

        // 3. Move/Merge all attendance records from secondary to primary
        const secondaryAttendances = await Attendance.find({ hikvisionEmployeeId: secondaryId });
        console.log(`Checking ${secondaryAttendances.length} secondary attendance records...`);

        for (const secAtt of secondaryAttendances) {
            // Check if primary already has record for this date
            const existingPrimaryAtt = await Attendance.findOne({ 
                hikvisionEmployeeId: primaryId, 
                date: secAtt.date 
            });

            if (existingPrimaryAtt) {
                console.log(`Merging attendance for date ${secAtt.date}...`);
                // Merge events
                for (const evt of secAtt.events) {
                    const isDup = existingPrimaryAtt.events.some(e => Math.abs(new Date(e.timestamp) - new Date(evt.timestamp)) < 30000);
                    if (!isDup) {
                        existingPrimaryAtt.events.push(evt);
                    }
                }
                // Sort events
                existingPrimaryAtt.events.sort((a, b) => new Date(a.timestamp) - new Date(evt.timestamp));
                
                // Update times
                if (!existingPrimaryAtt.firstCheckIn || (secAtt.firstCheckIn && secAtt.firstCheckIn < existingPrimaryAtt.firstCheckIn)) {
                    existingPrimaryAtt.firstCheckIn = secAtt.firstCheckIn;
                }
                if (secAtt.lastCheckOut && (!existingPrimaryAtt.lastCheckOut || secAtt.lastCheckOut > existingPrimaryAtt.lastCheckOut)) {
                    existingPrimaryAtt.lastCheckOut = secAtt.lastCheckOut;
                }
                
                await existingPrimaryAtt.save();
                await Attendance.deleteOne({ _id: secAtt._id });
            } else {
                // No conflict, just move it
                secAtt.hikvisionEmployeeId = primaryId;
                secAtt.employeeId = primaryEmp.employeeId;
                secAtt.name = primaryEmp.name;
                await secAtt.save();
            }
        }
        console.log(`✅ All secondary attendance records processed.`);

        // 4. Delete the secondary employee
        await Employee.deleteOne({ _id: secondaryEmp._id });
        console.log("✅ Secondary employee record deleted.");

        console.log("\n--- PERMANENT FIX COMPLETED ---");
        await mongoose.disconnect();
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

fixMunisa();

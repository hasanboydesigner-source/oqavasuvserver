import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import { normalizeName } from '../utils/nameHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function diagnose() {
    try {
        console.log("🔗 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected.");

        console.log("\n--- EMPLOYEE ANALYSIS ---");
        const allEmployees = await Employee.find({});
        const munisas = allEmployees.filter(e => e.name && e.name.toUpperCase().includes('MUNISA'));

        console.log(`Found ${munisas.length} records matching 'MUNISA':`);
        munisas.forEach((m, i) => {
            console.log(`\nRecord #${i + 1}:`);
            console.log(`- ID (_id): ${m._id}`);
            console.log(`- Name: "${m.name}"`);
            console.log(`- Normalized Name: "${normalizeName(m.name)}"`);
            console.log(`- Employee ID: ${m.employeeId}`);
            console.log(`- Hikvision ID: ${m.hikvisionEmployeeId}`);
            console.log(`- Aliases: ${JSON.stringify(m.aliases || [])}`);
            console.log(`- Role: ${m.role}`);
            console.log(`- CreatedAt: ${m.createdAt}`);
        });

        const today = new Date().toISOString().split('T')[0];
        console.log(`\n--- ATTENDANCE ANALYSIS (Date: ${today}) ---`);
        const attendances = await Attendance.find({ date: today });
        const munisaAttendance = attendances.filter(a => a.name && a.name.toUpperCase().includes('MUNISA'));

        console.log(`Found ${munisaAttendance.length} attendance records for Munisa today:`);
        munisaAttendance.forEach((a, i) => {
            console.log(`\nAttendance #${i + 1}:`);
            console.log(`- ID: ${a._id}`);
            console.log(`- Name: "${a.name}"`);
            console.log(`- Hikvision ID: ${a.hikvisionEmployeeId}`);
            console.log(`- First Check-in: ${a.firstCheckIn}`);
            console.log(`- Last Check-out: ${a.lastCheckOut}`);
            console.log(`- Events Count: ${a.events.length}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

diagnose();

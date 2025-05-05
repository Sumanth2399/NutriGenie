const DailyFitnessData = require("../models/dailyFitnessData");
const MonthlyFitnessData = require("../models/monthlyFitnessData");

const saveFitnessData = async ({ userId, dailyData }) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed

    // 1. Generate all dates in the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const allDates = Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(currentYear, currentMonth, i + 1);
        return date.toISOString().split("T")[0];
    });

    // 2. Find existing records for the user this month
    const existingEntries = await DailyFitnessData.find({
        userId,
        date: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lte: new Date(currentYear, currentMonth, daysInMonth),
        },
    });
    const existingDates = new Set(existingEntries.map((entry) => entry.date.toISOString().split("T")[0]));
    console.log("📊 Existing daily records found:", Array.from(existingDates));

    // 3. Insert missing days with 0 values
    const missingDates = allDates.filter((date) => !existingDates.has(date));
    const zeroEntries = missingDates.map((date) => ({
        userId,
        date,
        steps: 0,
        distance: 0,
        caloriesExpended: 0,
    }));

    if (zeroEntries.length > 0) {
        await DailyFitnessData.insertMany(zeroEntries);
        console.log("🗓️ Missing dates being filled:", missingDates);
    }

    // 4. Prepare bulk updates for fetched daily data
    const bulkOps = dailyData.map((entry) => ({
        updateOne: {
            filter: { userId, date: entry.date },
            update: {
                $inc: {
                    steps: entry.steps,
                    distance: entry.distance,
                    caloriesExpended: entry.caloriesExpended,
                },
            },
            upsert: true,
        },
    }));

    if (bulkOps.length > 0) {
        await DailyFitnessData.bulkWrite(bulkOps);
        console.log(`💾 Saved or updated ${bulkOps.length} days of daily fitness data`);
    }

    // 5. Update Monthly Summary
    let monthlyRecord = await MonthlyFitnessData.findOne({ userId, year: currentYear });

    if (!monthlyRecord) {
        monthlyRecord = new MonthlyFitnessData({ userId, year: currentYear, months: [] });
    }

    const monthIndex = currentMonth + 1;
    const monthEntry = monthlyRecord.months.find((m) => m.month === monthIndex);

    // Aggregate totals from dailyData
    const totals = dailyData.reduce(
        (acc, entry) => {
            acc.steps += entry.steps;
            acc.distance += entry.distance;
            acc.caloriesExpended += entry.caloriesExpended;
            return acc;
        },
        { steps: 0, distance: 0, caloriesExpended: 0 }
    );

    if (monthEntry) {
        monthEntry.steps += totals.steps;
        monthEntry.distance += totals.distance;
        monthEntry.caloriesExpended += totals.caloriesExpended;
    } else {
        monthlyRecord.months.push({
            month: monthIndex,
            steps: totals.steps,
            distance: totals.distance,
            caloriesExpended: totals.caloriesExpended,
        });
    }

    await monthlyRecord.save();
    console.log("📆 Monthly summary updated");
};

module.exports = saveFitnessData;

const mongoose = require("mongoose");

const dailyFitnessDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    steps: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
    caloriesExpended: { type: Number, default: 0 }
});

module.exports = mongoose.model("DailyFitnessData", dailyFitnessDataSchema);

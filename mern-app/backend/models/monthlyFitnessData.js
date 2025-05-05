const mongoose = require("mongoose");

const monthlyFitnessDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    year: { type: Number, required: true },
    months: [{
        month: { type: Number, required: true },
        steps: { type: Number, default: 0 },
        distance: { type: Number, default: 0 },
        caloriesExpended: { type: Number, default: 0 }
    }]
});

module.exports = mongoose.model("MonthlyFitnessData", monthlyFitnessDataSchema);

const mongoose = require("mongoose");

const auctionSettingsSchema = new mongoose.Schema(
    {
        // Time threshold before auction end to trigger auto-extend (in minutes)
        // Default: 5 minutes
        auto_extend_threshold: {
            type: Number,
            required: true,
            default: 5,
            min: 1,
            max: 60,
        },
        // Duration to extend the auction when a bid is placed within threshold (in minutes)
        // Default: 10 minutes
        auto_extend_duration: {
            type: Number,
            required: true,
            default: 10,
            min: 1,
            max: 120,
        },
        // Singleton pattern - only one settings document should exist
        singleton: {
            type: Boolean,
            required: true,
            default: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

// Static method to get or create settings
auctionSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne({ singleton: true });
    if (!settings) {
        settings = await this.create({
            singleton: true,
            auto_extend_threshold: 5,
            auto_extend_duration: 10,
        });
    }
    return settings;
};

// Static method to update settings
auctionSettingsSchema.statics.updateSettings = async function (updates) {
    const settings = await this.getSettings();
    
    if (updates.auto_extend_threshold !== undefined) {
        settings.auto_extend_threshold = updates.auto_extend_threshold;
    }
    if (updates.auto_extend_duration !== undefined) {
        settings.auto_extend_duration = updates.auto_extend_duration;
    }
    
    await settings.save();
    return settings;
};

const AuctionSettings = mongoose.model("AuctionSettings", auctionSettingsSchema);

module.exports = AuctionSettings;

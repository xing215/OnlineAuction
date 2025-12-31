const AuctionSettings = require('../models/AuctionSettings');

const getAuctionSettings = async (req, res) => {
    try {
        const settings = await AuctionSettings.getSettings();
        res.json({
            success: true,
            data: {
                auto_extend_threshold: settings.auto_extend_threshold,
                auto_extend_duration: settings.auto_extend_duration,
            },
        });
    } catch (error) {
        console.error('Get auction settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy cài đặt đấu giá',
            error: error.message,
        });
    }
};

const updateAuctionSettings = async (req, res) => {
    try {
        const { auto_extend_threshold, auto_extend_duration } = req.body;

        // Validate inputs
        if (auto_extend_threshold !== undefined) {
            if (
                typeof auto_extend_threshold !== 'number' ||
                auto_extend_threshold < 1 ||
                auto_extend_threshold > 60
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        'Thời gian ngưỡng gia hạn phải từ 1 đến 60 phút',
                });
            }
        }

        if (auto_extend_duration !== undefined) {
            if (
                typeof auto_extend_duration !== 'number' ||
                auto_extend_duration < 1 ||
                auto_extend_duration > 120
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Thời gian gia hạn phải từ 1 đến 120 phút',
                });
            }
        }

        const settings = await AuctionSettings.updateSettings({
            auto_extend_threshold,
            auto_extend_duration,
        });

        res.json({
            success: true,
            message: 'Cập nhật cài đặt đấu giá thành công',
            data: {
                auto_extend_threshold: settings.auto_extend_threshold,
                auto_extend_duration: settings.auto_extend_duration,
            },
        });
    } catch (error) {
        console.error('Update auction settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật cài đặt đấu giá',
            error: error.message,
        });
    }
};

module.exports = {
    getAuctionSettings,
    updateAuctionSettings,
};

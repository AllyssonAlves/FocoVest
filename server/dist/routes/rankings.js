"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        res.status(501).json({
            success: false,
            message: 'Get rankings not implemented yet'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/:university', async (req, res) => {
    try {
        res.status(501).json({
            success: false,
            message: 'Get ranking by university not implemented yet'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=rankings.js.map
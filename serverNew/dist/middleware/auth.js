"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAuth = void 0;
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    else {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please log in.'
        });
    }
};
exports.requireAuth = requireAuth;
const optionalAuth = (req, res, next) => {
    // This middleware just passes through but can be used to check if user is logged in
    // without requiring authentication
    next();
};
exports.optionalAuth = optionalAuth;

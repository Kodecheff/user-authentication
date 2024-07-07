"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = (req, res, next) => {
    const url = req.url;
    const method = req.method;
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    // Check if the request URL starts with '/css' or '/images'
    if (req.url.startsWith('/css') || req.url.startsWith('/images')) {
        // Skip logging for requests targeting the public directory
        next();
    }
    else {
        let result = `${method} request for ${url} at ${time} - ${date}`;
        console.log(result);
        next();
    }
};
exports.default = logger;
//# sourceMappingURL=logger.js.map
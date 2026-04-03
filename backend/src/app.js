"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = require("express-rate-limit");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const error_middleware_1 = require("./middlewares/error.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const record_routes_1 = __importDefault(require("./routes/record.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const audit_routes_1 = __importDefault(require("./routes/audit.routes"));
// Load swagger file
const swaggerDocument = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, 'swagger.json'), 'utf8'));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
const apiLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 1000,
    max: 30, // Limit unauthenticated requests to 30/min defaults
    message: { message: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/records', record_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/audit', audit_routes_1.default);
// Error handler
app.use(error_middleware_1.errorHandler);
exports.default = app;

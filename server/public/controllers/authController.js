"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdmin = exports.login = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await prisma.admin.findUnique({
            where: { username },
        });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1d' });
        res.json({ token });
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
};
exports.login = login;
const createAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const admin = await prisma.admin.create({
            data: {
                username,
                password: hashedPassword,
            },
        });
        res.status(201).json({ id: admin.id, username: admin.username });
    }
    catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
};
exports.createAdmin = createAdmin;

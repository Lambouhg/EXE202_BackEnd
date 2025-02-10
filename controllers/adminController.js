const User = require('../models/User');
const BusCompany = require('../models/BusCompany');
const Route = require('../models/Route');
const Ticket = require('../models/Ticket');
const TicketRequest = require('../models/TicketRequest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Đăng nhập Admin
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) return res.status(404).json({ message: "Admin không tồn tại!" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu!" });

        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ message: "Đăng nhập thành công!", token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách người dùng
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Người dùng đã được xóa." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách nhà xe
exports.getBusCompanies = async (req, res) => {
    try {
        const companies = await BusCompany.find();
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo nhà xe mới
exports.createBusCompany = async (req, res) => {
    try {
        const newCompany = new BusCompany(req.body);
        await newCompany.save();
        res.status(201).json(newCompany);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách tuyến đường
exports.getRoutes = async (req, res) => {
    try {
        const routes = await Route.find().populate('company');
        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa tuyến đường
exports.deleteRoute = async (req, res) => {
    try {
        await Route.findByIdAndDelete(req.params.id);
        res.json({ message: "Tuyến đường đã được xóa." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách vé
exports.getTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().populate('route company owner');
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách yêu cầu đổi vé
exports.getTicketRequests = async (req, res) => {
    try {
        const requests = await TicketRequest.find().populate('requester requestedTicket offeredTicket responseBy');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật trạng thái yêu cầu đổi vé
exports.updateTicketRequest = async (req, res) => {
    try {
        const updatedRequest = await TicketRequest.findByIdAndUpdate(
            req.params.requestId,
            { status: req.body.status, responseBy: req.user._id, responseDate: new Date() },
            { new: true }
        );
        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa yêu cầu đổi vé
exports.deleteTicketRequest = async (req, res) => {
    try {
        await TicketRequest.findByIdAndDelete(req.params.requestId);
        res.json({ message: "Yêu cầu đổi vé đã được xóa." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

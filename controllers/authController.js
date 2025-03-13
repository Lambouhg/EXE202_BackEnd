const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu!' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email không tồn tại!' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: 'Tài khoản của bạn đã bị vô hiệu hóa!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không đúng!' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // **Sửa đổi phần phản hồi**
    return res.status(200).json({ 
      message: 'Đăng nhập thành công!', 
      token, 
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    console.error("Lỗi server:", error);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau!' });
  }
};


exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, companyId } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin!' });
    }

    // Kiểm tra email đã tồn tại chưa
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: 'Email đã tồn tại!' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Nếu có `companyId` thì kiểm tra xem có tồn tại không
    let company = null;
    if (companyId) {
      const existingCompany = await BusCompany.findById(companyId);
      if (!existingCompany) {
        return res.status(400).json({ message: 'Công ty không tồn tại!' });
      }
      company = companyId; // Nếu tồn tại, gán companyId vào user
    }

    // Tạo user mới
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'user',
      company,  // 👈 Gán companyId nếu có, nếu không thì null
    });

    await newUser.save();
    
    return res.status(201).json({ 
      message: 'Đăng ký thành công!', 
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        company: newUser.company, // 👈 Trả về companyId để kiểm tra
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau!' });
  }
};

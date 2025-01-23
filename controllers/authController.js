const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Đăng Nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra xem dữ liệu có hợp lệ không
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu!' });
    }

    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email không tồn tại!' });
    }

    // Kiểm tra tài khoản có bị vô hiệu hóa không
    if (!user.isActive) {
      return res.status(400).json({ message: 'Tài khoản của bạn đã bị vô hiệu hóa!' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không đúng!' });
    }

    // Tạo JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Nếu là admin, bạn có thể trả về thông tin về quyền hạn của họ
    if (user.role === 'admin') {
      return res.status(200).json({ 
        message: 'Đăng nhập thành công!', 
        token, 
        role: 'admin' 
      });
    }

    // Trả về thông tin đăng nhập cho người dùng bình thường
    return res.status(200).json({ 
      message: 'Đăng nhập thành công!', 
      token, 
      role: 'user' 
    });

  } catch (error) {
    console.error(error); // Log lỗi để dễ dàng debug
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau!' });
  }
};

// đăng kí 
exports.register = async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;
  
      // Kiểm tra xem dữ liệu có hợp lệ không
      if (!name || !email || !password || !phone) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin!' });
      }
  
      // Kiểm tra xem email đã tồn tại chưa
      const userExist = await User.findOne({ email });
      if (userExist) {
        return res.status(400).json({ message: 'Email đã tồn tại!' });
      }
  
      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Tạo người dùng mới
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'user',
      });
  
      await newUser.save();
      return res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
      console.error(error); // Log lỗi để dễ dàng debug
      return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau!' });
    }
  };
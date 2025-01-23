const Review = require('../models/Review');
const BusCompany = require('../models/BusCompany');
const User = require('../models/User');

// Tạo đánh giá
exports.createReview = async (req, res) => {
  try {
    const { targetId, targetModel, rating, comment } = req.body;
    const userId = req.user.id;

    const review = new Review({
      reviewer: userId,
      target: targetId,
      targetModel,
      rating,
      comment,
    });

    await review.save();

    // Cập nhật điểm đánh giá trung bình
    if (targetModel === 'BusCompany') {
      const busCompany = await BusCompany.findById(targetId);
      const totalRatings = busCompany.reviews.length + 1;
      const newRating = (busCompany.rating * busCompany.reviews.length + rating) / totalRatings;
      busCompany.rating = newRating;
      busCompany.reviews.push(review._id);
      await busCompany.save();
    } else if (targetModel === 'User') {
      const user = await User.findById(targetId);
      const totalRatings = user.reviews.length + 1;
      const newRating = (user.rating * user.reviews.length + rating) / totalRatings;
      user.rating = newRating;
      user.reviews.push(review._id);
      await user.save();
    }

    return res.status(201).json({ message: 'Đánh giá thành công!', review });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

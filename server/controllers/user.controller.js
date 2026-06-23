const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/user/profile
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone, avatar } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, phone, avatar },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add address
// @route   POST /api/user/addresses
exports.addAddress = async (req, res, next) => {
    try {
        const { label, street, city, state, pincode, isDefault } = req.body;

        const user = await User.findById(req.user._id);

        if (isDefault) {
            user.addresses.forEach((address) => {
                address.isDefault = false;
            });
        }

        user.addresses.push({
            label,
            street,
            city,
            state,
            pincode,
            isDefault: isDefault || false,
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            data: user.addresses,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update address
// @route   PUT /api/user/addresses/:id
exports.updateAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { label, street, city, state, pincode, isDefault } = req.body;

        const user = await User.findById(req.user._id);

        const address = user.addresses.find((addr) => addr._id.toString() === id);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found',
            });
        }

        if (isDefault) {
            user.addresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }

        address.label = label;
        address.street = street;
        address.city = city;
        address.state = state;
        address.pincode = pincode;
        address.isDefault = isDefault;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            data: user.addresses,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete address
// @route   DELETE /api/user/addresses/:id
exports.deleteAddress = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findById(req.user._id);

        user.addresses = user.addresses.filter((addr) => addr._id.toString() !== id);

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
            data: user.addresses,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Change password
// @route   PUT /api/user/change-password
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        const isPasswordValid = await user.comparePassword(currentPassword);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

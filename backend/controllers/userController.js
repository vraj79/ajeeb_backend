const UserModel = require("../models/UserModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary");

exports.registerUser = async (req, res) => {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
    })

    const { name, email, password } = req.body
    try {
        // const user=new UserModel(req.body)
        // await user.save()

        const user = await UserModel.create({
            name, email, password, avatar: { public_id: myCloud.public_id, url: myCloud.secure_url }
        })

        // const token = user.getJWTToken();
        // //options for cookie
        // const options = {
        //     expires: new Date(
        //         Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        //     ),
        //     httpOnly: true
        // };

        // res.cookie("access_token", token,options).status(201).send({ success: true, user, token });
        sendToken(user, 201, res)
    } catch (error) {
        res.send({ error: error.message });
    }
}

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).send("Please enter login credentials");
    }
    try {
        const user = await UserModel.findOne({ email }).select("+password");
        if (!user) return res.status(401).send({ msg: "User doesn't exist" });

        const isPasswordCorrect = await user.comparePassword(password)

        if (!isPasswordCorrect) return res.status(401).send({ msg: "Please enter correct email or password" });
        // res.cookie("access_token",token).status(201).send({success:true,token});
        sendToken(user, 200, res)
    } catch (error) {
        res.status(501).send({ error })
    }
}

//logoutUser
exports.logoutUser = async (req, res) => {
    // res.cookie("access_token", null, { expires: new Date(Date.now()), httpOnly: true })
    // res.send({ success: true, msg: "Logged Out Successfully" })
    res.clearCookie("access_token").status(200).send({ success:true,message: "Logged out successfully." });
}

//forgot password

exports.forgotPassword = async (req, res, next) => {
    // console.log(req.body)
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) return res.status(404).send("User not found");

    const resetToken = user.getResetPasswordToken()

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/user/password/reset/${resetToken}`

    const msg = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email,please ignore it.`

    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce password recovery`,
            msg
        });

        res.status(200).json({ success: true, msg: `Email sent to ${user.email} successfully` })

    } catch (error) {
        user.resetPasswordToken = undefined,
        user.resetPasswordExpire = undefined

        await user.save({ validateBeforeSave: false });

        return res.status(500).send({ error: error.message });
    }
}

// reset password
exports.resetPassword = async (req, res, next) => {

    // creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await UserModel.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } })

    if (!user) return res.status(400).send("Reset Password token in not valid or has been expired");

    if (req.body.password !== req.body.confirmPassword) {
        return res.status(401).send("Password and Confirm Password is different")
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save();

    sendToken(user, 200, res)
}

// get user details
exports.getUserDetails = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.id);

        res.status(200).send({ success: true, user })
    } catch (error) {
        res.status(501).send({ error })
    }
}

// update password
exports.updatePassword = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.id).select("+password");

        const isPasswordCorrect = await user.comparePassword(req.body.oldPassword)

        if (!isPasswordCorrect) return res.status(400).send("Old password is incorrect");

        if (req.body.newPassword !== req.body.confirmPassword) {
            return res.status(400).send("Password doesn't matched");
        }

        user.password = req.body.newPassword;

        await user.save();

        sendToken(user, 200, res)
    } catch (error) {
        res.status(501).send({ error })
    }
}

// update profile
exports.updateProfile = async (req, res, next) => {
    const { name, email } = req.body

    try {
        const newUserData = { name, email };

        if (req.body.avatar !== "") {
            const user = await UserModel.findById(req.user.id)

            const imageId = user.avatar.public_id

            await cloudinary.v2.uploader.destroy(imageId)

            const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
                folder: "avatars",
                width: 150,
                crop: "scale",
            })

            newUserData.avatar = { public_id: myCloud.public_id, url: myCloud.secure_url }
        }

        const user = await UserModel.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })

        res.status(200).send({ success: true, user })
    } catch (error) {
        res.status(501).send({ error })
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find();

        res.status(200).send({ success: true, users })
    } catch (error) {
        res.status(501).send({ error })
    }
}

exports.getUserById = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);

        if (!user) return next(new ErrorHandler(`User doesn't exist with Id: ${req.params.id}`))

        res.status(200).send({ success: true, user })
    } catch (error) {
        res.status(501).send({ error })
    }
}

// update role
exports.updateRole = async (req, res, next) => {
    const { name, email, role } = req.body
    try {
        const newUserData = { name, email, role };

        // cloudinary later

        const user = await UserModel.findByIdAndUpdate(req.params.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })

        res.status(200).send({ success: true, user })
    } catch (error) {
        res.status(501).send({ error })
    }
}

// delete user
exports.delUser = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.params.id);

        if (!user) return next(new ErrorHandler(`User doesn't exist with Id: ${req.params.id}`))

        const imageId=user.avatar.public_id

        await cloudinary.v2.uploader.destroy(imageId)

        await user.remove();

        res.status(200).send({ success: true, msg: "User Deleted Successfully" })
    } catch (error) {
        res.status(501).send({ error })
    }
}

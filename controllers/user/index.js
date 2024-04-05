'use strict';

const { User } = require('../../models/User');
const { updateToken } = require('../../core/updateToken');
const jwt = require('jsonwebtoken');
const { errorHandling } = require('../../middlewares/errorHandling');
const { generateOTP } = require('../../core/otpGenerator');
const { sendMail } = require('../../core/emailService');
const moment = require('moment');
const bcrypt = require('bcryptjs');

async function getAllUsers(req, res, next) {
  try {
    let users;
    users = await User.find();
    if (!users) errorHandling(`404|No users found.|`);
    return res.status(200).json({ users });
  } catch (e) {
    next(new Error(e.stack));
  }
}

async function getSingleUser(req, res, next) {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) errorHandling(`400|User does not exist.|`);
    res.status(200).json({
      statusCode: 200,
      data: user,
    });
  } catch (e) {
    next(new Error(e.stack));
  }
}

async function registerUser(req, res, next) {
  try {
    const data = req.body;
    const accountType = 'user'; // Default

    if (!data.firstName) errorHandling(`400|Firstname field missing.|`);
    if (!data.lastName) errorHandling(`400|Lastname field missing.|`);
    if (!data.userName) errorHandling(`400|Username field missing.|`);
    if (!data.DOB) errorHandling(`400|DOB field missing.|`);
    if (!data.city) errorHandling(`400|City field missing.|`);
    if (!data.state) errorHandling(`400|State field missing.|`);
    if (!data.email) errorHandling(`400|Email field missing.|`);
    if (!data.password) errorHandling(`400|Password field missing.|`);

    const existingUser = await User.findOne({
      email: data.email,
    });
    if (existingUser) errorHandling(`401|User with email already exists.|`);

    let otp = generateOTP();
    let otpExpiration = moment().add(15, 'minutes');

    let payload = {
      emailOtp: otp,
    };

    const salt = await bcrypt.genSalt(Number(10));
    const hashedPassword = await bcrypt.hash(data.password, salt);

    let newUser = {
      accountType,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      userName: data.userName,
      DOB: data.DOB,
      city: data.city,
      state: data.state,
      password: hashedPassword,
      emailOtp: otp,
      emailOtpExpiration: otpExpiration,
    };

    const createdUser = new User(newUser);

    await createdUser.save();

    const token = jwt.sign(
      {
        _id: createdUser._id,
      },
      process.env.TOKEN,
      {
        expiresIn: '7d',
      },
    );

    await updateToken(createdUser._id, token);

    const userData = await User.findOne({
      email: data.email,
    }).select(`-password -partnerDetails`);

    await sendMail('OTP Email Verification', data.email, 'otp', payload)
      .then(() => {
        res.status(200).json({
          statusCode: 200,
          message: 'Success, check your mail for your verification code!',
          data: userData,
          token: token,
        });
      })
      .catch((e) => {
        next(new Error(e.stack));
      });
  } catch (e) {
    next(new Error(e.stack));
  }
}

async function registerPartner(req, res, next) {
  try {
    const data = req.body;
    const accountType = 'partner'; // Default

    if (!data.firstName) errorHandling(`400|Firstname field missing.|`);
    if (!data.lastName) errorHandling(`400|Lastname field missing.|`);
    if (!data.userName) errorHandling(`400|Username field missing.|`);
    if (!data.DOB) errorHandling(`400|DOB field missing.|`);
    if (!data.city) errorHandling(`400|City field missing.|`);
    if (!data.state) errorHandling(`400|State field missing.|`);
    if (!data.legalName) errorHandling(`400|Legal Name field missing.|`);
    if (!data.address) errorHandling(`400|Address field missing.|`);
    if (!data.category) errorHandling(`400|Category field missing.|`);
    if (!data.email) errorHandling(`400|Email field missing.|`);
    if (!data.password) errorHandling(`400|Password field missing.|`);

    const existingUser = await User.findOne({
      email: data.email,
    });
    if (existingUser) errorHandling(`401|User with email already exists.|`);

    let otp = generateOTP();
    let otpExpiration = moment().add(15, 'minutes');

    let payload = {
      emailOtp: otp,
    };

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    let newUser = {
      accountType,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      userName: data.userName,
      DOB: data.DOB,
      city: data.city,
      state: data.state,
      partnerDetails: {
        legalName: data.legalName,
        address: data.address,
        category: data.category,
      },
      password: hashedPassword,
      emailOtp: otp,
      emailOtpExpiration: otpExpiration,
    };

    const createdUser = new User(newUser);

    await createdUser.save();

    const token = jwt.sign(
      {
        _id: createdUser._id,
      },
      process.env.TOKEN,
      {
        expiresIn: '7d',
      },
    );

    await updateToken(createdUser._id, token);

    const partnerData = await User.findOne({
      email: data.email,
    }).select(`-password`);

    await sendMail('OTP Email Verification', data.email, 'otp', payload)
      .then(() => {
        res.status(200).json({
          statusCode: 200,
          message: 'Success, check your mail for your verification code!',
          data: partnerData,
          token: token,
        });
      })
      .catch((e) => {
        next(new Error(e.stack));
      });
  } catch (e) {
    next(new Error(e.stack));
  }
}

async function loginUser(req, res, next) {
  try {
    const data = req.body;

    if (!data.email) errorHandling(`400|Email field Missing/Empty.|`);
    if (!data.password) errorHandling(`400|Password field Missing/Empty.|`);

    const existingUser = await User.findOne({ email: data.email });
    if (!existingUser) errorHandling(`400|User Doesn't Exist.|`);
    const isMatch = await bcrypt.compare(data.password, existingUser.password);
    if (!isMatch) errorHandling(`400|Incorrect Password!.|`);
    const token = jwt.sign(
      { email: existingUser.email, _id: existingUser._id },
      process.env.TOKEN,
      {
        expiresIn: '7d',
      },
    );
    await updateToken(existingUser._id, token);
    res.status(200).json({
      message: 'Login Successful',
      token: token,
      response: existingUser,
    });
  } catch (e) {
    next(new Error(e.stack));
  }
}

async function verifyUser(req, res, next) {
  const emailOtp = req.query.emailOtp;

  try {
    if (!emailOtp) {
      errorHandling(`400|No otp detected.|`);
    }

    let user = await User.findOne({ emailOtp });

    if (user === null) {
      errorHandling(`400|OTP is Invalid.|`);
    }

    if (user && moment().isAfter(user?.otpExpiration)) {
      errorHandling(`400|OTP has Expired.|`);
    }

    user = await User.findOneAndUpdate(
      {
        emailOtp,
      },
      {
        emailOtp: '',
        emailOtpExpiration: '',
        isEmailVerified: true,
      },
      {
        new: true,
      },
    );

    await sendMail('Welcome to Pinpoint!', user.email, 'onboarding', {});

    res.status(200).json({
      statusCode: 200,
      message: 'Email Verification Successful',
      data: user,
    });
  } catch (e) {
    next(new Error(e.stack));
  }
}

async function resendOTP(req, res, next) {
  try {
    const userID = req.query.userID;
    let user = await User.findById(userID);
    if (user === null) {
      errorHandling(`400|User not found.|`);
    }
    let emailOtp = generateOTP();
    let emailOtpExpiration = moment().add(15, 'minutes');
    user = await User.findByIdAndUpdate(
      userID,
      { emailOtp, emailOtpExpiration },
      { new: true },
    );

    await sendMail('New OTP Code', user.email, 'otp', { emailOtp });

    res.status(200).json({
      statusCode: 200,
      message: 'OTP Sent',
      data: user,
    });
  } catch (e) {
    next(new Error(e.stack));
  }
}

async function deleteAllUsers(req, res, next) {
  const { tag } = req.params;
  try {
    if (!tag || tag !== process.env.TOKEN) {
      errorHandling(`401|You are not HIM.|`);
    } else {
      await User.deleteMany();
      res.status(200).json({
        statusCode: 200,
        message: 'Successfully burnt down the world for you.',
      });
    }
  } catch (e) {
    next(new Error(e.stack));
  }
}

async function initForgotPassword(request, response, next) {
  try {
    let data = request.body;

    if (!data.email) errorHandling(`400|Email field missing!.|`);

    let user = await User.findOne({ email: data.email });

    if (!user) errorHandling(`400|User does not exist.|`);

    let emailOtp = generateOTP();
    let emailOtpExpiration = moment().add(15, 'minutes');
    user = await User.findByIdAndUpdate(
      user._id,
      { emailOtp, emailOtpExpiration },
      { new: true },
    );

    await sendMail('Resend Password OTP Code', user.email, 'otp', { emailOtp });

    response.status(200).json({
      statusCode: 200,
      message: 'OTP Sent',
      data: user,
    });
  } catch (e) {
    next(new Error(e.stack));
  }
}

async function finalizeForgotPassword(request, response, next) {
  const emailOtp = request.query.emailOtp;

  try {
    let data = request.body;

    if (!emailOtp) {
      errorHandling(`400|No otp detected.|`);
    }

    let user = await User.findOne({ emailOtp });

    if (user === null) {
      errorHandling(`400|OTP is Invalid.|`);
    }

    if (user && moment().isAfter(user?.otpExpiration)) {
      errorHandling(`400|OTP has Expired.|`);
    }

    if (!data.newPassword) errorHandling(`400|New password field missing.|`);

    const salt = await bcrypt.genSalt(10);
    const newhashedPassword = await bcrypt.hash(data.newPassword, salt);

    user = await User.findByIdAndUpdate(
      user._id,
      { password: newhashedPassword },
      { new: true },
    );

    response.status(200).json({
      statusCode: 200,
      message: 'Password Reset!',
      data: user,
    });
  } catch (e) {
    next(new Error(e.stack));
  }
}

module.exports = {
  getAllUsers,
  getSingleUser,
  registerUser,
  loginUser,
  verifyUser,
  resendOTP,
  deleteAllUsers,
  initForgotPassword,
  finalizeForgotPassword,
  registerPartner,
};


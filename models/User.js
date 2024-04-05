const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    DOB: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    emailOtp: {
      type: String,
    },
    emailOtpExpiration: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    accountType: {
      type: String,
      enum: ['user', 'partner'],
      required: true,
    },
    partnerDetails: {
      legalName: {
        type: String,
      },
      address: {
        type: String,
      },
      category: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model('User', userSchema);

module.exports = {
  User: User,
};


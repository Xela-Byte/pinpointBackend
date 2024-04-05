'use strict';
const express = require('express');
const router = express.Router();

const { verifyToken } = require('../core/verifyToken');
const {
  getAllUsers,
  registerUser,
  loginUser,
  verifyUser,
  getSingleUser,
  resendOTP,
  initForgotPassword,
  finalizeForgotPassword,
  deleteAllUsers,
  registerPartner,
} = require('../controllers/user');

// Authentications
router.get('/auth/getAllUsers', getAllUsers);
router.get('/auth/getSingleUser/:id', getSingleUser);
router.post('/auth/registerUser', registerUser);
router.post('/auth/registerPartner', registerPartner);
router.post('/auth/loginUser', loginUser);
router.post('/auth/verifyUser', verifyUser);
router.post('/auth/resendOtp', resendOTP);
router.post('/auth/initializeForgotPassword', initForgotPassword);
router.post('/auth/finalizeForgotPassword', finalizeForgotPassword);
router.delete('/auth/deleteAllUsers/:tag', deleteAllUsers);

module.exports = router;


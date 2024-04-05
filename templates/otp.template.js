const otpEmailTemplate = (otp) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>OTP Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        .header {
            background-color: blue;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
        }
        .footer {
            background-color: blue;
            padding: 10px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>OTP Code</h1>
    </div>
    <div class="content">
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>This OTP expires in <strong>15 minutes</strong>.</p>
        <p>If you did not request this OTP, please ignore this email.</p>
        <p>Best regards,</p>
        <p>Pinpoint Team.</p>
    </div>
    <div class="footer">
        <p>Pinpoint</p>
        
    </div>
</body>
</html>`;

  return html;
};

module.exports = {
  otpEmailTemplate,
};


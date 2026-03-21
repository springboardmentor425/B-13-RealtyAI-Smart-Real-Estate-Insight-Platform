export function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOtpHtml(otp) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OTP Verification</title>

<style>
    body {
        margin: 0;
        padding: 0;
        background: #f4f6f8;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .container {
        max-width: 500px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        padding: 30px;
        text-align: center;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }

    .logo {
        font-size: 24px;
        font-weight: bold;
        color: #4f46e5;
        margin-bottom: 10px;
    }

    .title {
        font-size: 22px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 10px;
    }

    .subtitle {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 25px;
    }

    .otp-box {
        font-size: 32px;
        font-weight: bold;
        letter-spacing: 8px;
        background: #f3f4f6;
        padding: 15px 20px;
        border-radius: 10px;
        display: inline-block;
        color: #111827;
        margin-bottom: 20px;
    }

    .info {
        font-size: 13px;
        color: #6b7280;
        margin-top: 20px;
    }

    .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #9ca3af;
    }

</style>
</head>

<body>

<div class="container">

    <div class="logo">🔐 Auth System</div>

    <div class="title">Verify Your Email</div>

    <div class="subtitle">
        Use the OTP below to complete your verification. This OTP is valid for 5 minutes.
    </div>

    <div class="otp-box">${otp}</div>

    <div class="info">
        Do not share this OTP with anyone for security reasons.
    </div>

    <div class="footer">
        © 2026 Auth System. All rights reserved.
    </div>

</div>

</body>
</html>
`;
}

export function getResetPasswordHtml(otp) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Password Reset OTP</title>

<style>
    body {
        margin: 0;
        padding: 0;
        background: #f4f6f8;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .container {
        max-width: 500px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        padding: 30px;
        text-align: center;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }

    .logo {
        font-size: 24px;
        font-weight: bold;
        color: #ef4444;
        margin-bottom: 10px;
    }

    .title {
        font-size: 22px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 10px;
    }

    .subtitle {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 25px;
    }

    .otp-box {
        font-size: 32px;
        font-weight: bold;
        letter-spacing: 8px;
        background: #fef2f2;
        padding: 15px 20px;
        border-radius: 10px;
        display: inline-block;
        color: #dc2626;
        margin-bottom: 20px;
        border: 1px solid #fee2e2;
    }

    .info {
        font-size: 13px;
        color: #6b7280;
        margin-top: 20px;
    }

    .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #9ca3af;
    }

</style>
</head>

<body>

<div class="container">

    <div class="logo">🔐 Auth System</div>

    <div class="title">Password Reset Request</div>

    <div class="subtitle">
        We received a request to reset your password. Use the OTP below to proceed. This OTP is valid for 5 minutes.
    </div>

    <div class="otp-box">${otp}</div>

    <div class="info">
        If you didn't request this, please ignore this email or contact support.
    </div>

    <div class="footer">
        © 2026 Auth System. All rights reserved.
    </div>

</div>

</body>
</html>
`;
}
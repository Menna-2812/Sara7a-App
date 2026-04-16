export const template = (code,subject) => `
<!DOCTYPE html>

<html lang="en">
<head>
<meta charset="UTF-8">
<title>${subject}</title>
<style>
body{
    margin:0;
    padding:0;
    background:#f4f6f8;
    font-family:Arial, Helvetica, sans-serif;
}

.container{
max-width:600px;
margin:40px auto;
background:#ffffff;
border-radius:8px;
padding:40px;
text-align:center;
box-shadow:0 4px 12px rgba(0,0,0,0.08);
}

.logo{
font-size:24px;
font-weight:bold;
color:#4CAF50;
margin-bottom:20px;
}

.title{
font-size:22px;
font-weight:bold;
margin-bottom:10px;
}

.text{
color:#555;
font-size:15px;
margin-bottom:30px;
}

.otp{
font-size:32px;
letter-spacing:8px;
font-weight:bold;
background:#f4f6f8;
padding:15px 25px;
border-radius:6px;
display:inline-block;
margin-bottom:30px;
}

.footer{
font-size:12px;
color:#888;
margin-top:30px;
} </style>

</head>

<body>

<div class="container">

<div class="logo">Sara7aApp</div>

<div class="title">${subject}</div>

<p class="text">
Use the following One Time Password (OTP).
This code will expire shortly.
</p>

<div class="otp">
${code}
</div>

<p class="text">
If you didn’t request this code, you can safely ignore this email.
</p>

<div class="footer">
© 2026 Your App. All rights reserved.
</div>

</div>

</body>
</html>

`
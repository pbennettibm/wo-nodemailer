const express = require("express");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const port = 3000;

app.use(express.json());

app.get("/healthcheck", async (req, res) => {
  res.send("healthy");
});

app.post("/email", async (req, res) => {
  const emailRequestBody = await req.body;
  let emailMessage = emailRequestBody.message;
  console.log(emailRequestBody);

  if (emailRequestBody.meetingLink) {
    emailMessage += `
    
Meeting Link - ${emailRequestBody.meetingLink}`;
  }

  if (emailRequestBody.meetingPassword) {
    emailMessage += `  Password: ${emailRequestBody.meetingPassword}`;
  }

  if (emailRequestBody.transcript) {
    emailMessage += `
    
Transcript - ${emailRequestBody.transcript}`;
  }

  const sendMail = () => {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const options = {
      from: process.env.EMAIL_FROM,
      to: emailRequestBody.to,
      subject: emailRequestBody.subject,
      text: emailMessage,
    };

    transporter.sendMail(options, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: error });
      } else {
        console.log(info);
        return res.status(200).json({ emails: info.envelope.to });
      }
    });
  };

  sendMail();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

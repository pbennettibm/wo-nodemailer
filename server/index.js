const express = require("express");
const Axios = require("axios");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/healthcheck", async (req, res) => {
  res.send("healthy");
});

app.post("/email", async (req, res) => {
  const emailRequestBody = req.body;
  let emailMessage = `${emailRequestBody.message}`;
  console.log(emailRequestBody);

  const sendMail = (editedMessage) => {
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
      text: editedMessage,
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

  if (emailRequestBody.meetingLink) {
    emailMessage += `


Meeting Link - ${emailRequestBody.meetingLink}`;
  }

  if (emailRequestBody.meetingPassword) {
    emailMessage += `  Password: ${emailRequestBody.meetingPassword}`;
  }

  if (emailRequestBody.transcript) {
    const config = {
      headers: { Authorization: `Bearer ${process.env.WEBEX_TOKEN}` },
    };
    console.log("transcript here", config);

    Axios.get(emailRequestBody.transcript, config)
      .then(async (response) => {
        emailMessage += `


Full Transcript -


${response.data}`;

        console.log("message transcript", emailMessage);

        sendMail(emailMessage);
      })
      .catch((error) => {
        console.log("error", error);
      });
  } else {
    sendMail(emailMessage);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

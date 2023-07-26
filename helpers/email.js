import { createTransport } from 'nodemailer';
import {
  googleOAuthClient,
//   googleRefreshToken,
  googleOAuthClientID,
  googleOAuthClientSecret,
} from './oauth.js';
import { generateOtpHTMLTemplate, generateOtpTextTemplate } from './template.js';

/**
 *
 * Function to send email to a specified email id
 * @param {String} emailID Email ID to which mail is to be send
 * @param {String} subject Subject of the otp
 * @param {String} textContent Content of the email as plain text
 * @param {String} htmlContent Content of the email as HTML
 */
export const sendEmail = async (emailID, subject, textContent, htmlContent) => {
  // const accessToken = await googleOAuthClient.getAccessToken();

  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user:'drstonegeng@gmail.com',
      pass:'vqrrawfnwrovckec'
    //   accessToken: accessToken.token,
    //   type: 'OAuth2',
    //   user: 'polygramapp@gmail.com',
    //   client_id: googleOAuthClientID,
    // //   refreshToken: googleRefreshToken,
    //   client_secret: googleOAuthClientSecret,
    },
  });

  console.log(emailID)
  const mailOptions = {
    from: 'drstonegeng@gmail.com',
    to: emailID,
    // subject: 'Test mail',
    // text: 'Node.js testing mail for GeeksforGeeks'
    subject: subject,
    text: textContent,
    html: htmlContent !== undefined ? htmlContent : `<p>${textContent}</p>`,
  };
  console.log(emailID)
  // return transporter.sendMail(mailOptions);
 return transporter.sendMail(mailOptions, function(err, data) {
    if (err) {
      console.log("Error " + err);
    } else {
      console.log("Email sent successfully");
    }
  });
};

/**
 *
 * Function to send OTP as email to a given email address.
 * @param {String|Number} otp OTP to be send
 * @param {String} email Email to which the OTP is to be send
 * @param {String} name Name of the user
 */
export const sendOTP = (otp, email, name) => {
  const subject = 'One Time Password';
  const textContent = generateOtpTextTemplate(otp, name);
  const htmlContent = generateOtpHTMLTemplate(otp, name);

  let result =  sendEmail(email, subject, textContent, htmlContent);
  return result;
};

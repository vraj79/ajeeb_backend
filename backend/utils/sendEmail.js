const nodeMailer = require("nodemailer")

const sendEmail = async (options) => {
    const transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        service: "gmail",
        secure: true,
        auth: {
            user: "vishal.raj8546@gmail.com",
            pass: "Vraj@7903"
        }
    });

    const mailOptions = {
        from: "vishal.raj8546@gmail.com",
        to: options.email,
        subject: options.subject,
        text: options.msg
    }

    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail
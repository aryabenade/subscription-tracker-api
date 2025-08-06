import dayjs from "dayjs"
import { emailTemplates } from "./email-template.js"
import { accountEmail, transporter } from "../config/nodemailer.js"

export const sendReminderEmail = async ({ to, type, subscription }) => {
    if (!to || !type) throw new Error("Missing required parameters")

    const template = emailTemplates.find((t) => t.label == type)

    if (!template) throw new Error("Invalid email type")

    const mailInfo = {
        userName: subscription.user.userName,
        subscriptionName: subscription.name,
        renewalDate: dayjs(subscription.renewalDate).format('MMM D,YYYY'),
        planName: subscription.frequency,
        price: `${subscription.currency} ${subscription.price} ${subscription.frequency}`
    }


    const subject = template.generateSubject(mailInfo)
    const message = template.generateBody(mailInfo)

    const mailOptions = {
        from: accountEmail,
        to: to,
        subject: subject,
        html: message
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return console.log(error, "Error sending email");
        console.log('Email sent:', info.response);
    })

}

import nodemailer from 'nodemailer'

type SendEmailWithPDFOption = {
  sender: string
  receiver: string
  subject: string
  message: string
  pdfData: string
}
type SendEmailWithCSVOption = {
  sender: string
  receiver: string
  subject: string
  message: string
  csvData: string
  csvTitle: string
}

/**
 * サーバー側からPDFを添付してメールを送信する関数
 *
 * @param option
 *
 */
export const sendMailWithPdf = async (option: SendEmailWithPDFOption) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: option.sender,
        pass: process.env.EMAIL_APP_KEY
      }
    })

    const mailOptions = {
      from: option.sender,
      to: option.receiver,
      subject: option.subject,
      text: option.message,
      attachments: [
        {
          filename: 'orderInformation.pdf',
          content: Buffer.from(option.pdfData, 'base64'),
          contentType: 'application/pdf'
        }
      ]
    }

    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error(error)
  }
}
/**
 * サーバー側からCSVを添付してメールを送信する関数
 *
 * @param option
 *
 */
export const sendMailWithCsv = async (option: SendEmailWithCSVOption) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: option.sender,
        pass: process.env.EMAIL_APP_KEY
      }
    })
    const mailOptions = {
      from: option.sender,
      to: option.receiver,
      subject: option.subject,
      text: option.message,
      attachments: [
        {
          filename: option.csvTitle,
          content: option.csvData,
          contentType: 'text/csv'
        }
      ]
    }
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error(error)
  }
}

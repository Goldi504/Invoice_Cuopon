const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsAppMessage = async ({
  phoneNumber,
  message,
}) => {
  try {
    // Remove spaces and other characters
    // except + from the customer number
    let formattedNumber = phoneNumber
      .toString()
      .replace(/\s+/g, "");

    // If Indian number is stored as 9876543210
    // convert it to +919876543210
    if (
      formattedNumber.length === 10 &&
      !formattedNumber.startsWith("+")
    ) {
      formattedNumber =
        `+91${formattedNumber}`;
    }

    // If number doesn't start with +
    if (!formattedNumber.startsWith("+")) {
      formattedNumber =
        `+${formattedNumber}`;
    }

    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,

      to: `whatsapp:${formattedNumber}`,

      body: message,
    });

    console.log(
      "WhatsApp message sent:",
      result.sid
    );

    return {
      success: true,
      messageSid: result.sid,
      status: result.status,
    };
  } catch (error) {
    console.error(
      "Twilio WhatsApp Error:",
      error.message
    );

    throw new Error(
      "Failed to send WhatsApp message"
    );
  }
};

module.exports = {
  sendWhatsAppMessage,
};
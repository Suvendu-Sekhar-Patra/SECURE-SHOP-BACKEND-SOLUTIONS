const twilio = require('twilio');


const client = new twilio(process.env.twilio_accountSid, process.env.twilio_authToken);

let otpStore: { [phoneNumber: string]: { otp: string, expiresAt: number } } = {};

const OTP_EXPIRY_TIME = 5 * 60 * 1000; 

//6 length
export const generateOTP = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let otp = '';
    for (let i = 0; i < 6; i++) {
        otp += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return otp;
};


export const sendOTP = (phoneNumber: string, otp: any) => {

    const expiresAt = Date.now() + OTP_EXPIRY_TIME;
    otpStore[phoneNumber] = { otp, expiresAt };

    return client.messages.create({
        body: `Your OTP is: ${otp}`,
        from: process.env.twilio_phoneNumber,
        to: `+91${phoneNumber}`
    });
}

export const verifyOTP = (phoneNumber: string, otp: string) => {
    const otpData = otpStore[phoneNumber];

    if (otpData) {
        if (Date.now() > otpData.expiresAt) {
            const newOtp = generateOTP();
            sendOTP(phoneNumber, newOtp);

            return {
                status: 'expired',
                message: 'OTP expired. A new OTP has been sent to your phone number.',
                otpSent: true
            };
        }

        if (otpData.otp === otp) {
            delete otpStore[phoneNumber];
            return {
                status: 'success',
                message: 'OTP verified successfully.',
                otpVerified: true
            };
        }
    }
    
    return {
        status: 'fail',
        message: 'Invalid OTP. Please try again.',
        otpVerified: false
    };
}


module.exports = {
    generateOTP,
    sendOTP,
    verifyOTP
};
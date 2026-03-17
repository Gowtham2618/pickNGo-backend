const moment = require("moment");

const RESPONSES = require("../../constants/response");
const MESSAGES = require("../../constants/constantMessage");
const STATUS = require("../../constants/statusCodes");

const verifyOTP = async (req, res, next) => {
    try {
        const { sessionData, otp } = req?.body ?? {};
        const latestOtpEntry = sessionData?.otp?.at(-1);

        if (!latestOtpEntry) {
            return RESPONSES.error(req, res, STATUS?.BAD_REQUEST, MESSAGES?.INVALID_OTP ?? "", { OTP: otp });
        }

        const { code, expiresAt } = latestOtpEntry;

        const expiresAtMoment = moment.utc(expiresAt);
        if (!expiresAtMoment.isValid() || expiresAtMoment.isBefore(moment.utc())) {
            return RESPONSES.error(req, res, STATUS?.BAD_REQUEST, MESSAGES?.OTP_EXPIRED ?? "OTP expired", { OTP: otp });
        }

        if (Number(code) !== Number(otp)) {
            return RESPONSES.error(req, res, STATUS?.BAD_REQUEST, MESSAGES?.INVALID_OTP ?? "", { OTP: otp });
        }

        next();
    }
    catch (error) {
        return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
    }
};

module.exports = { verifyOTP }
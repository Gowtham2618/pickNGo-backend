const genericCodeGeneration = () => {
    const otp = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join("");
    return otp;
};

module.exports = { genericCodeGeneration };

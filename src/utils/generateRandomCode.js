const genericCodeGeneration = (type) => {
    let result;

    switch (type) {
        case "otp":
            result = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join("");
            break;

        default:
            result = "UNKNOWN_TYPE"; // Return a meaningful response for unknown types
    }

    return result;
};

module.exports = { genericCodeGeneration };

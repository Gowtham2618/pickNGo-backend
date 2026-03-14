class Responses {
    static success = (req, res, status = 200, message = "", data = {}) => {
        return res.status(status).json({ status, message, data: data });
    }

    static error = (req, res, status = 409, message = "", data = {}) => {
        return res.status(status).json({ status, message, data });
    }
}

module.exports = Responses;
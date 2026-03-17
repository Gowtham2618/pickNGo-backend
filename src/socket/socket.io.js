let io;

const init = (socketIO) => {
    io = socketIO;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = {
    init,
    getIO,
};
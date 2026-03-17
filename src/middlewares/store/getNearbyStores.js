const RESPONSES = require("../../constants/response");
const MESSAGES = require("../../constants/constantMessage");
const STATUS = require("../../constants/statusCodes");

const storeService = require("../../services/store.service");

const getNearbyStores = async (req, res, next) => {
    try {
        const envRadius = Number(process.env.RADIUS);
        const radiusInMeters = Number.isFinite(envRadius) && envRadius > 0 ? envRadius : 5000; // 5 km radius

        let { user_latitude, user_longitude } = req?.body ?? {};

        if (!user_latitude || !user_longitude) {
            const { location } = req?.body?.userDetails?.address ?? {};
            if (location && location.coordinates) {
                user_latitude = location.coordinates[1];
                user_longitude = location.coordinates[0];
            }
        }

        const lat = Number(user_latitude);
        const lng = Number(user_longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return RESPONSES.error(req, res, STATUS?.BAD_REQUEST, MESSAGES?.INVALID_LOCATION ?? "Invalid location");
        }

        const stores = await storeService.getNearbyStores(lat, lng, radiusInMeters);
        console.log("🚀 ~ getNearbyStores ~ stores:", stores);
        if (!stores.length) {
            return RESPONSES.error(req, res, STATUS?.OK, MESSAGES?.STORE_NOT_EXIST_RADIUS ?? "");
        }

        req.body["nearbyStores"] = stores;
        next();
    } catch (error) {
        return RESPONSES.error(req, res, 500, `${error}`);
    }
};

module.exports = { getNearbyStores }
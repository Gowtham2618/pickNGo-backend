const mongoose = require("mongoose");

const storeModel = require("../models/store.model");

class StoreService {
    createStore = async (payload) => {
        return await storeModel.create({ ...payload });
    };

    getStoreDetails = async (matchCondition) => {
        return await storeModel.findOne({...matchCondition}).lean();
    };

    getStoreLists = async (skip = 0, limit = 10, matchCondition) => {
        return await storeModel.find({ ...matchCondition }).skip(skip).limit(limit).lean();
    };

    getStoreTotalDocuments = async (matchCondition) => {
        return await storeModel.countDocuments({ ...matchCondition });
    };

    updateStoreRecord = async (storeId, updateObject) => {
        return await storeModel.findByIdAndUpdate(storeId,
            { ...updateObject },
            { new: true }
        )
    };
};

module.exports = new StoreService();
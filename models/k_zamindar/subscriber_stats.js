'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class SubscriberStats extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    SubscriberStats.init({
        msisdn: {
            type: DataTypes.STRING,
            field: 'cellno',
            primaryKey: true
        },
        lastUpdateDateTime: {
            type: DataTypes.DATE,
            field: 'last_update_dt'
        },
        lastUpdatedBy: {
            type: DataTypes.DATE,
            field: 'last_update_by'
        },
        moCall: {
            type: DataTypes.NUMBER,
            field: 'mo_call'
        },
        mtCall: {
            type: DataTypes.NUMBER,
            field: 'mt_call'
        },
        moSms: {
            type: DataTypes.NUMBER,
            field: 'mo_sms'
        },
        mtSms: {
            type: DataTypes.NUMBER,
            field: 'mt_sms'
        }
    }, {
        sequelize,
        modelName: 'SubscriberStats',
        tableName: 'sub_stats',
        timestamps: false
    });
    return SubscriberStats;
};
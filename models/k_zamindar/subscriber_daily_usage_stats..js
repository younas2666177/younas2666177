'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class SubscriberDailyUsageStats extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    SubscriberDailyUsageStats.init({
        msisdn: {
            type: DataTypes.STRING,
            field: 'cellno',
            primaryKey: true
        },
        usageDate: {
            type: DataTypes.DATEONLY,
            field: 'dt'
        },
        subscriptionDateTime: {
            type: DataTypes.DATE,
            field: 'sub_dt'
        },
        moCall: {
            type: DataTypes.NUMBER,
            field: 'mo_calls'
        },
        mtCall: {
            type: DataTypes.NUMBER,
            field: 'mt_calls'
        },
        moSms: {
            type: DataTypes.NUMBER,
            field: 'mo_sms'
        },
        mtSms: {
            type: DataTypes.NUMBER,
            field: 'mt_sms'
        },
        moUssd: {
            type: DataTypes.NUMBER,
            field: 'mo_ussd'
        },
        province: {
            type: DataTypes.STRING,
            field: 'province'
        }
    }, {
        sequelize,
        modelName: 'SubscriberDailyUsageStats',
        tableName: 'sub_daily_usage_stats',
        timestamps: false
    });
    return SubscriberDailyUsageStats;
};
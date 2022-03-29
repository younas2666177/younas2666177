'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class SubscriberUnsub extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    SubscriberUnsub.init({
        msisdn: {
            type: DataTypes.STRING,
            field: 'cellno',
            primaryKey: true
        },
        subscriberName: {
            type: DataTypes.STRING,
            field: 'sub_name'
        },
        serviceId: {
            type: DataTypes.INTEGER,
            field: 'service_Id'
        },
        province: {
            type: DataTypes.STRING,
            field: 'province'
        },
        subMode: {
            type: DataTypes.STRING,
            field: 'sub_mode'
        },
        location: {
            type: DataTypes.STRING,
            field: 'location'
        },
        srvcId: {
            type: DataTypes.STRING,
            field: 'srvc_id'
        },
        lang: {
            type: DataTypes.STRING,
            field: 'lang'
        },
        bcMode: {
            type: DataTypes.STRING,
            field: 'bc_mode'
        },
        alertType: {
            type: DataTypes.INTEGER,
            field: 'alert_type'
        },
        status: {
            type: DataTypes.INTEGER,
            field: 'status'
        },
        lastUnsubDt: {
            type: DataTypes.DATE,
            field: 'last_unsub_dt'
        },
        lastCallDt: {
            type: DataTypes.DATE,
            field: 'last_call_dt'
        },
        lastUpdateDt: {
            type: DataTypes.DATE,
            field: 'last_update_dt'
        },
        firstSubDt: {
            type: DataTypes.DATE,
            field: 'first_sub_dt'
        },
        lastChargeDt: {
            type: DataTypes.DATE,
            field: 'last_charge_dt'
        },
        nextChargeDt: {
            type: DataTypes.DATE,
            field: 'next_charge_dt'
        },
        chargeAttemptDt: {
            type: DataTypes.DATE,
            field: 'charge_attempt_dt'
        },
        graceExpireDt: {
            type: DataTypes.DATE,
            field: 'grace_expire_dt'
        },
        chargeCount: {
            type: DataTypes.INTEGER,
            field: 'charge_count'
        },
        lastSubDt: {
            type: DataTypes.DATE,
            field: 'last_sub_dt'
        },
        lastUpdateBy: {
            type: DataTypes.DATE,
            field: 'last_update_by'
        },
        dt: {
            type: DataTypes.DATE,
            field: 'dt'
        },
        gender: {
            type: DataTypes.STRING,
            field: 'gender'
        },
        occupation: {
            type: DataTypes.STRING,
            field: 'occupation'
        },
        village: {
            type: DataTypes.STRING,
            field: 'village'
        },
        landSize: {
            type: DataTypes.STRING,
            field: 'land_size'
        },
        landUnit: {
            type: DataTypes.STRING,
            field: 'land_unit'
        },
        comment: {
            type: DataTypes.STRING,
            field: 'comment'
        },
        unsubMode: {
            type: DataTypes.STRING,
            field: 'unsub_mode'
        }
    }, {
        sequelize,
        modelName: 'SubscriberUnsub',
        tableName: 'subscriber_unsub',
        timestamps: false
    });
    return SubscriberUnsub;
};
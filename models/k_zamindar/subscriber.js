'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Subscriber extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    }
    Subscriber.init({
        msisdn: {
            type: DataTypes.STRING,
            field: 'cellno',
            primaryKey: true
        },
        district: {
            type: DataTypes.STRING,
            field: 'district'
        },
        tehsil: {
            type: DataTypes.STRING,
            field: 'tehsil'
        },
        province: {
            type: DataTypes.STRING,
            field: 'province'
        },
        crop: {
            type: DataTypes.STRING,
            field: 'srvc_id'
        },
        language: {
            type: DataTypes.STRING,
            field: 'lang'
        },
        subscriberName: {
            type: DataTypes.STRING,
            field: 'sub_name'
        },
        firstSubDateTime: {
            type: DataTypes.DATE,
            field: 'first_sub_dt'
        },
        lastSubDateTime: {
            type: DataTypes.DATE,
            field: 'last_sub_dt'
        },
        lastUnsubDateTime: {
            type: DataTypes.DATE,
            field: 'last_unsub_dt'
        },
        subMode: {
            type: DataTypes.STRING,
            field: 'sub_mode'
        },
        bcMode: {
            type: DataTypes.STRING,
            field: 'bc_mode'
        },
        alertType: {
            type: DataTypes.NUMBER,
            field: 'alert_type'
        },
        status: {
            type: DataTypes.NUMBER,
            field: 'status'
        },
        lastCallDateTime: {
            type: DataTypes.DATE,
            field: 'last_call_dt'
        },
        hasConsented: {
            type: DataTypes.STRING,
            field: 'has_consented'
        },
        lat: {
            type: DataTypes.DECIMAL(9, 6),
            field: 'lat'
        },
        lng: {
            type: DataTypes.DECIMAL(9, 6),
            field: 'lng'
        },
        hasSelectedLocation: {
            type: DataTypes.STRING,
            field: 'has_selected_loc'
        },
        chargeAttemptDateTime: {
            type: DataTypes.DATE,
            field: 'charge_attempt_dt'
        },
        lastChargeDateTime: {
            type: DataTypes.DATE,
            field: 'last_charge_dt'
        },
        nextChargeDateTime: {
            type: DataTypes.DATE,
            field: 'next_charge_dt'
        },
        graceExpireDateTime: {
            type: DataTypes.DATE,
            field: 'grace_expire_dt'
        },
        serviceId: {
            type: DataTypes.STRING,
            field: 'service_id'
        },
        operator: {
            type: DataTypes.STRING,
            field: 'op'
        },
        chargeCount: {
            type: DataTypes.STRING,
            field: 'charge_count'
        },
        lastObdDt: {
            type: DataTypes.DATE,
            field: 'last_obd_dt'
        },
    }, {
        sequelize,
        modelName: 'Subscriber',
        tableName: 'subscriber',
        timestamps: false
    });
    return Subscriber;
};

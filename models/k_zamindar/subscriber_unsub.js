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
    }
    SubscriberUnsub.init({
        msisdn: {
            type: DataTypes.STRING,
            field: 'cellno',
            primaryKey: true
        },
        district: {
            type: DataTypes.STRING,
            field: 'district'
        },
        province: {
            type: DataTypes.STRING,
            field: 'province'
        },
        crop: {
            type: DataTypes.NUMBER,
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
        lastChargeDateTime: {
            type: DataTypes.DATE,
            field: 'last_charge_dt'
        },
        status: {
            type: DataTypes.NUMBER,
            field: 'status'
        },
        lastCallDateTime: {
            type: DataTypes.DATE,
            field: 'last_call_dt'
        },
        lastUpdateDateTime: {
            type: DataTypes.DATE,
            field: 'last_update_dt'
        },
        lastUpdatedBy: {
            type: DataTypes.STRING,
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
        datetime: {
            type: DataTypes.DATE,
            field: 'dt'
        },
        unsubMode: {
            type: DataTypes.STRING,
            field: 'unsub_mode'
        },
        alertType: {
            type: DataTypes.NUMBER,
            field: 'alert_type'
        },
        hasConsented: {
            type: DataTypes.NUMBER,
            field: 'has_consented'
        },
        tehsil: {
            type: DataTypes.STRING,
            field: 'tehsil'
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
            type: DataTypes.NUMBER,
            field: 'has_selected_loc'
        },
        chargeAttemptDateTime: {
            type: DataTypes.DATE,
            field: 'charge_attempt_dt'
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
        modelName: 'SubscriberUnsub',
        tableName: 'subscriber_unsub',
        timestamps: false
    });
    return SubscriberUnsub;
};

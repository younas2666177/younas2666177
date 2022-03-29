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
    };
    Subscriber.init({
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
        lastSubDateTime: {
            type: DataTypes.DATE,
            field: 'last_sub_dt'
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
        firstSubDt: {
            type: DataTypes.DATE,
            field: 'first_sub_dt'
        },
        alertType: {
            type: DataTypes.INTEGER,
            field: 'alert_type'
        },
        lastChargeDt: {
            type: DataTypes.DATE,
            field: 'last_charge_dt'
        },
        nextChargeDt: {
            type: DataTypes.DATE,
            field: 'next_charge_dt'
        },
        lastSubDt: {
            type: DataTypes.DATE,
            field: 'last_sub_dt'
        },
        chargeAttemptDt: {
            type: DataTypes.DATE,
            field: 'charge_attempt_dt'
        },
        graceExpireDt: {
            type: DataTypes.DATE,
            field: 'grace_expire_dt'
        },
        status: {
            type: DataTypes.INTEGER,
            field: 'status'
        },
        chargeCount: {
            type: DataTypes.INTEGER,
            field: 'charge_count'
        },
        lastUnsubDt: {
            type: DataTypes.DATE,
            field: 'last_unsub_dt'
        }
    }, {
        sequelize,
        modelName: 'Subscriber',
        tableName: 'subscriber',
        timestamps: false
    });
    return Subscriber;
};
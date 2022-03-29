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
        subDateTime: {
            type: DataTypes.DATE,
            field: 'sub_dt'
        },
        unsubDateTime: {
            type: DataTypes.DATE,
            field: 'unsub_dt'
        },
        subMode: {
            type: DataTypes.STRING,
            field: 'sub_mode'
        },
        unsubMode: {
            type: DataTypes.STRING,
            field: 'unsub_mode'
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
        op: {
            type: DataTypes.STRING,
            field: 'op'
        },
        status: {
            type: DataTypes.NUMBER,
            field: 'status'
        },
        serviceId: {
            type: DataTypes.NUMBER,
            field: 'service_id'
        },
        lastCallDateTime: {
            type: DataTypes.DATE,
            field: 'last_call_dt'
        },
    }, {
        sequelize,
        modelName: 'SubscriberUnsub',
        tableName: 'subscriber_unsub',
        timestamps: false
    });
    return SubscriberUnsub;
};
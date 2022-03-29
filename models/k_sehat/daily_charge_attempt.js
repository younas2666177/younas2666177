'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class DailyChargeAttempt extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    DailyChargeAttempt.init({
        id: {
            type: DataTypes.NUMBER,
            field: 'id',
            primaryKey: true
        },
        msisdn: {
            type: DataTypes.STRING,
            field: 'cell_no',
        },
        requestDateTime: {
            type: DataTypes.DATE,
            field: 'request_dt'
        },
        responseDateTime: {
            type: DataTypes.DATE,
            field: 'response_dt'
        },
        responseCode: {
            type: DataTypes.NUMBER,
            field: 'response_code'
        },
        responseMessage: {
            type: DataTypes.NUMBER,
            field: 'request_msg'
        },
        amount: {
            type: DataTypes.NUMBER,
            field: 'charge_amount'
        },
        serviceId: {
            type: DataTypes.NUMBER,
            field: 'service_id'
        },
        apiUrl: {
            type: DataTypes.STRING,
            field: 'api_url'
        },
        subMode: {
            type: DataTypes.STRING,
            field: 'sub_mode'
        },
        status: {
            type: DataTypes.NUMBER,
            field: 'status'
        }
    }, {
        sequelize,
        modelName: 'DailyChargeAttempt',
        tableName: 'daily_charge_attempts',
        timestamps: false
    });
    return DailyChargeAttempt;
};
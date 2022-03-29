'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ChargeAttempt extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    ChargeAttempt.init({
        id: {
            type: DataTypes.NUMBER,
            field: 'id',
            primaryKey: true
        },
        msisdn: {
            type: DataTypes.STRING,
            field: 'cellno',
        },
        currentDateTime: {
            type: DataTypes.DATE,
            field: "cur_dt"
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
        modelName: 'ChargeAttempt',
        tableName: 'charge_attempts',
        timestamps: false
    });
    return ChargeAttempt;
};
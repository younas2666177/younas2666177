'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class NewSubChargeResponse extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    NewSubChargeResponse.init({
        id: {
            type: DataTypes.NUMBER,
            field: 'id',
            primaryKey: true
        },
        msisdn: {
            type: DataTypes.STRING,
            field: 'cellno'
        },
        chargeAttemptDateTime: {
            type: DataTypes.DATE,
            field: 'charge_attempt_dt'
        },
        responseCode: {
            type: DataTypes.NUMBER,
            field: 'response_code'
        },
        response: {
            type: DataTypes.STRING,
            field: 'response'
        }
    }, {
        sequelize,
        modelName: 'NewSubChargeResponse',
        tableName: 'new_sub_charge_responses',
        timestamps: false
    });
    return NewSubChargeResponse;
};
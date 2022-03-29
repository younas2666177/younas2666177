'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class SuccessChargeDetail extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    SuccessChargeDetail.init({
        msisdn: {
            type: DataTypes.STRING,
            field: 'cellno',
            primaryKey: true
        },
        serviceId: {
            type: DataTypes.NUMBER,
            field: 'service_id',
            primaryKey: true
        },
        amount: {
            type: DataTypes.DECIMAL(10,2),
            field: 'amount'
        },
        chargeType: {
            type: DataTypes.NUMBER,
            field: 'charge_type'
        },
        created: {
            type: DataTypes.DATE,
            field: 'created'
        },
        chargedDateTime: {
            type: DataTypes.DATE,
            field: 'charged_dt'
        },
        subcriptionType: {
            type: DataTypes.STRING,
            field: 'sub_type'
        },
        processed: {
            type: DataTypes.BOOLEAN,
            field: 'processed'
        },
        message: {
            type: DataTypes.STRING,
            field: 'message'
        },
        responseCode : {
            type: DataTypes.STRING,
            field: 'response_code'
        }
    }, {
        sequelize,
        modelName: 'SuccessChargeDetail',
        tableName: 'success_charge_detail',
        timestamps: false
    });
    return SuccessChargeDetail;
};
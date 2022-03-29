'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ChargeProcess extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    ChargeProcess.init({
        msisdn: {
            type: DataTypes.STRING,
            field: 'cellno',
            primaryKey: true
        },
        amount: {
            type: DataTypes.NUMBER,
            field: 'amount'
        },
        status: {
            type: DataTypes.STRING,
            field: 'stat'
        },
        chargeType: {
            type: DataTypes.STRING,
            field: 'charge_type'
        }
    }, {
        sequelize,
        modelName: 'ChargeProcess',
        tableName: 'charge_process',
        timestamps: false
    });
    return ChargeProcess;
};
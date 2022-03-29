'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Service extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };

    Service.init({
        id: {
            type: DataTypes.NUMBER,
            field: 'id',
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            field: 'srvcname'
        },
        amount: {
            type: DataTypes.NUMBER,
            field: 'amount'
        },
        insuranceAmount: {
            type: DataTypes.NUMBER,
            field: 'insurance_amount'
        },
        chargeInterval: {
            type: DataTypes.NUMBER,
            field: 'charge_interval'
        },
        bundle: {
            type: DataTypes.NUMBER,
            field: 'bundle'
        }
    }, {
        sequelize,
        modelName: 'Service',
        tableName: 'service',
        timestamps: false
    });
    return Service;
};
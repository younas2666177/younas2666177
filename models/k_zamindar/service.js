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
        // `id` int NOT NULL,
        // `srvcname` varchar(50) NOT NULL,
        // `shortcode` varchar(10) NOT NULL,
        // `amount` varchar(20) DEFAULT NULL,
        // `charge_interval` int DEFAULT NULL,
        // `max_chargings_per_day` int DEFAULT NULL,
        // `max_attempts_per_day` int DEFAULT NULL,
        // `through_put` int DEFAULT NULL,
        // `op_name` varchar(50) DEFAULT NULL,
        // `tp_api_url` varchar(450) DEFAULT NULL,
        id: {
            type: DataTypes.NUMBER,
            field: 'id',
            primaryKey: true
        },
        srvcName: {
            type: DataTypes.STRING,
            field: 'srvcname'
        },
        shortCode: {
            type: DataTypes.STRING,
            field: 'shortcode'
        },
        amount: {
            type: DataTypes.STRING,
            field: 'amount'
        },
        chargeInterval: {
            type: DataTypes.NUMBER,
            field: 'charge_interval'
        },
        maxChargingsPerDay: {
            type: DataTypes.NUMBER,
            field: 'max_chargings_per_day'
        },
        maxAttemptsPerDay: {
            type: DataTypes.NUMBER,
            field: 'max_attempts_per_day'
        },
        throughPut: {
            type: DataTypes.NUMBER,
            field: 'through_put'
        },
        opName: {
            type: DataTypes.STRING,
            field: 'op_name'
        },
        tpApiUrl: {
            type: DataTypes.STRING,
            field: 'tp_api_url'
        }
    }, {
        sequelize,
        modelName: 'Service',
        tableName: 'service',
        timestamps: false
    });
    return Service;
};
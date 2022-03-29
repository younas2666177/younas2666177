'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ChargingLocationDef extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    ChargingLocationDef.init({
        id: {
            type: DataTypes.NUMBER,
            field: 'id',
            primaryKey: true
        },
        tehsil: {
            type: DataTypes.NUMBER,
            field: 'tehsile'
        },
        district: {
            type: DataTypes.STRING,
            field: 'district'
        },
        status: {
            type: DataTypes.STRING,
            field: 'status'
        }
    }, {
        sequelize,
        modelName: 'ChargingLocationDef',
        tableName: 'charging_loc_def',
        timestamps: false
    });
    return ChargingLocationDef;
};
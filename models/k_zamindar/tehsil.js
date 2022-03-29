'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Tehsil extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    Tehsil.init({
        id: {
            type: DataTypes.NUMBER,
            field: 'id',
            primaryKey: true
        },
        district: {
            type: DataTypes.STRING,
            field: 'district'
        },
        order: {
            type: DataTypes.NUMBER,
            field: 'order'
        },
        status: {
            type: DataTypes.NUMBER,
            field: 'status'
        },
        lat: {
            type: DataTypes.DECIMAL(9,6),
            field: 'lat'
        },
        lng: {
            type: DataTypes.DECIMAL(9,6),
            field: 'lng'
        },
        tpId: {
            type: DataTypes.NUMBER,
            field: 'tp_id'
        }
    }, {
        sequelize,
        modelName: 'Tehsil',
        tableName: 'tehsil',
        timestamps: false
    });
    return Tehsil;
};
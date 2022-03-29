'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Site extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    Site.init({
        id: {
            type: DataTypes.NUMBER,
            field: 'id',
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            field: 'name'
        },
        province: {
            type: DataTypes.DATE,
            field: 'province'
        },
        district: {
            type: DataTypes.DATE,
            field: 'district'
        },
        tehsil: {
            type: DataTypes.DATE,
            field: 'tehsil'
        },
        lat: {
            type: DataTypes.DECIMAL(9, 6),
            field: 'lat'
        },
        lng: {
            type: DataTypes.DECIMAL(9, 6),
            field: 'lng'
        },
        lastUpdateDateTime: {
            type: DataTypes.DATE,
            field: 'last_update_dt'
        },
        lockDateTime: {
            type: DataTypes.DATE,
            field: 'lock_dt'
        },
        status: {
            type: DataTypes.NUMBER,
            field: 'status'
        }
    }, {
        sequelize,
        modelName: 'Site',
        tableName: 'site',
        timestamps: false
    });
    return Site;
};
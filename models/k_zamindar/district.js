'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class District extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    District.init({
        id: {
            type: DataTypes.NUMBER,
            field: 'id',
            primaryKey: true
        },
        province: {
            type: DataTypes.STRING,
            field: 'province'
        },
        weatherType: {
            type: DataTypes.NUMBER,
            field: 'weather_type'
        },
        defaultCropId: {
            type: DataTypes.NUMBER,
            field: 'default_srvc_id'
        },
        status: {
            type: DataTypes.NUMBER,
            field: 'status'
        },
        locOrder: {
            type: DataTypes.NUMBER,
            field: 'loc_order'
        },
        tpId: {
            type: DataTypes.NUMBER,
            field: 'tp_id'
        }
    }, {
        sequelize,
        modelName: 'District',
        tableName: 'district',
        timestamps: false
    });
    return District;
};
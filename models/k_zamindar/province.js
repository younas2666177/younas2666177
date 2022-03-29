'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Province extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    Province.init({
        id: {
            type: DataTypes.STRING,
            field: 'id',
            primaryKey: true
        },
        advisoryType: {
            type: DataTypes.NUMBER,
            field: 'advisory_type'
        },
        menuType: {
            type: DataTypes.DATE,
            field: 'menu_type'
        },
        status: {
            type: DataTypes.NUMBER,
            field: 'status'
        },
        awType: {
            type: DataTypes.NUMBER,
            field: 'aw_type'
        },
        defaultLanguage: {
            type: DataTypes.STRING,
            field: 'default_lang'
        },
        eveStartTime: {
            type: DataTypes.TIME,
            field: 'eve_start_time'
        },
        eveEndTime: {
            type: DataTypes.TIME,
            field: 'eve_end_time'
        },
        hasDefaultCrop: {
            type: DataTypes.NUMBER,
            field: 'has_default_srvc'
        },
        hasLiveShow: {
            type: DataTypes.NUMBER,
            field: 'has_live_show'
        },
        tpId: {
            type: DataTypes.NUMBER,
            field: 'tp_id'
        },
        awValidityMin: {
            type: DataTypes.NUMBER,
            field: 'aw_validity_min'
        },
        hasMenu: {
            type: DataTypes.NUMBER,
            field: 'has_menu'
        },
    }, {
        sequelize,
        modelName: 'Province',
        tableName: 'province',
        timestamps: false
    });
    return Province;
};
'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class SmsContent extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    SmsContent.init({
        id: {
            type: DataTypes.STRING,
            field: 'sms_id',
            primaryKey: true
        },
        language: {
            type: DataTypes.STRING,
            field: 'lang'
        },
        content: {
            type: DataTypes.TEXT,
            field: 'sms_txt'
        }
    }, {
        sequelize,
        modelName: 'SmsContent',
        tableName: 'sms_content',
        timestamps: false
    });
    return SmsContent;
};
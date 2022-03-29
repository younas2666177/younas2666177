'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ServiceSms extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    ServiceSms.init({
        keyword: {
            type: DataTypes.STRING,
            field: 'key_word',
            primaryKey: true
        },
        smsText: {
            type: DataTypes.STRING,
            field: 'sms_text'
        }
    }, {
        sequelize,
        modelName: 'ServiceSms',
        tableName: 'service_sms',
        timestamps: false
    });
    return ServiceSms;
};
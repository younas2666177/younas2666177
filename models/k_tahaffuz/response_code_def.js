'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ResponseCodeDef extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    ResponseCodeDef.init({
        id: {
            type: DataTypes.NUMBER,
            field: 'id',
            primaryKey: true
        },
        responseCode: {
            type: DataTypes.STRING,
            field: 'response_code'
        },
        responseMessage: {
            type: DataTypes.NUMBER,
            field: 'response_msg'
        }
    }, {
        sequelize,
        modelName: 'ResponseCodeDef',
        tableName: 'response_codes_def',
        timestamps: false
    });
    return ResponseCodeDef;
};
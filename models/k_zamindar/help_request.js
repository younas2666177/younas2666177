'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class HelpRequest extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    HelpRequest.init({
        id: {
            type: DataTypes.NUMBER,
            field: 'id',
            primaryKey: true
        },
        msisdn: {
            type: DataTypes.STRING,
            field: 'cellno'
        },
        askThrough: {
            type: DataTypes.STRING,
            field: 'ask_through'
        },
        status: {
            type: DataTypes.NUMBER,
            field: 'status'
        },
        problemType: {
            type: DataTypes.STRING,
            field: 'problem_type'
        },
        userQuery: {
            type: DataTypes.TEXT,
            field: 'user_query'
        },
        supportProvided: {
            type: DataTypes.TEXT,
            field: 'support_provided'
        },
        createDateTime: {
            type: DataTypes.DATE,
            field: 'create_dt'
        },
        requestDateTime: {
            type: DataTypes.DATE,
            field: 'request_dt'
        },
        responseDateTime: {
            type: DataTypes.DATE,
            field: 'response_dt'
        },
        province: {
            type: DataTypes.STRING,
            field: 'province'
        }
    }, {
        sequelize,
        modelName: 'HelpRequest',
        tableName: 'help_requests',
        timestamps: false
    });
    return HelpRequest;
};
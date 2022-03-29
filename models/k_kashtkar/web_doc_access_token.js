'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class WebdocAccessToken extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association 
        }
    };
    WebdocAccessToken.init({
        id: {
            type: DataTypes.NUMBER,
            field: 'id',
            primaryKey: true
        },
        accessToken: {
            type: DataTypes.STRING,
            field: 'access_token',
        },
        expiresIn: {
            type: DataTypes.NUMBER,
            field: 'expires_in'
        },
        lastUpdated: {
            type: DataTypes.DATE,
            field: 'last_updated'
        }
    }, {
        sequelize,
        modelName: 'WebdocAccessToken',
        tableName: 'web_doc_access_token',
        timestamps: false
    });
    return WebdocAccessToken;
};
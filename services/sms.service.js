const env = process.env.NODE_ENV || "development"
const smsGatewayConfig = require('../config/sms_gateway.config.json')[env];
const axios = require('axios').default;
const iconv = require('iconv-lite');
/**
 * This function will send sms to provided msisdn.
  @param {} msisdn allowed value is 03xxxxxxxxx
  @param {} text  string that will be sent as sms
 */
async function sendSms(msisdn, text, fromMsisdn) {
    if (!msisdn || !text) {
        return false;
    }
    console.log('sms api called :');

    text = decodeURI(text);
    text = text.split("+").join(" ");
    console.log(`${msisdn} ${text}`);
    // const encodedUsername = encodeURIComponent(smsGatewayConfig.username);
    // const encodedMsisdn = encodeURIComponent(msisdn);
    // const encodedText = await encodeText(text);

    //const url = `http://10.248.216.197:5002/sendsms?data=${encodeURI(text)}&extension=${fromMsisdn}&phone=${msisdn}`;



    // const url = `${smsGatewayConfig.baseUrl}?username=${encodedUsername}&password=${smsGatewayConfig.password}&to=${encodedMsisdn}&hex-content=${encodedText}&from=${fromMsisdn}&coding=8`

    // return axios.get(url).then(resp => {
    //     console.log(resp.data);
    //     return true;
    // }).catch(error => {
    //     console.log(error)
    //     return false;
    // });

    let payload = {
        to: msisdn,
        extension: `${fromMsisdn}`,
        text
    };

    return axios.post('http://10.248.216.197:3003/sms/postsms', payload).then(resp => {
        console.log(`sms api response : ${JSON.stringify(resp.data)}`);
        return true;
    }).catch(error => {
        console.log(error)
        return false;
    });
}

/**
 * This function use iconv lib to encode the provided string into big-endian.
  @param {} text string that is need to be encoded.
 */
function encodeText(text) {
    text = decodeURIComponent(text);

    text = text.split("+").join(" ");

    const buff = iconv.encode(text, "utf16be");

    const hexData = Buffer.from(buff, "ascii").toString("hex");

    const result = iconv.decode(hexData, "utf8");

    return result;
}

module.exports = {
    sendSms
}
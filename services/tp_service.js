


const axios = require('axios').default;
const { TP_WEBSERVICE_URL } = require('../config/general.config.json');

function sendChargingRequest(msisdn, amount, token, partnerId, productId) {

    const apiUrl = `${TP_WEBSERVICE_URL}/kz_charging?cellno=${msisdn}&token=${token}&amount=${amount}&partnerID=${partnerId}&productID=${productId}`;

    return axios.get(apiUrl)
        .then(function (response) {
            // handle success
            return response.data;
        })
        .catch(function (error) {
            // handle error
            console.log(error);
            return null;
        })
}


function geCheckBalanceStatus(msisdn) {
    const apiUrl = `http://10.248.216.159/getBalance.php?msisdn=${msisdn}`

    return axios.get(apiUrl)
        .then(function (response) {
            // handle success
            console.log("============>", msisdn, response.data);
            let { data } = response;
            return data && data !== "" ? data : { status: "error" };

        }).catch(function (error) {
            // handle error
            console.log(error.message);
            return { status: "error" }
        });
}

async function chargeUser(msisdn, serviceDetails) {
    // let interval = 0;
    // let amount = 0;
    //chargeInterval
    //amount
    // if (serviceId == 1) {
    //     interval = 7;
    //     amount = 1.20;
    // }
    // if (serviceId == 2) {
    //     interval = 1;
    //     amount = 0.25;
    // }
    // if (serviceId == 3) {
    //     interval = 7;
    //     amount = 2.40;
    // }
    // if (serviceId == 4) {
    //     interval = 7;
    //     amount = 3.60;
    // }

    const { chargeInterval, amount } = serviceDetails;

    const apiUrl = `http://10.248.216.159:7080/charge?cellno=${msisdn}&amount=${amount}&interval=${chargeInterval}`;
    console.log(`http://10.248.216.159:7080/charge?cellno=${msisdn}&amount=${amount}&interval=${chargeInterval}`);

    let chargeAPI = await axios.get(apiUrl).catch(err => { console.log(`ERROR in Charging API for user : ${msisdn} serviceId : ${serviceId} ::::: ${err.message}`) });
    if (chargeAPI) {
        let apiResponse = chargeAPI.data;
        console.log(`chargeAPI Response : ${JSON.stringify(apiResponse)}`);
        if (apiResponse.hasOwnProperty('msg') && apiResponse.error_code == "100") {
            console.log("already charge ", apiResponse.error_code);
            console.log(`[ALREADY CHARGED] [${msisdn}] [${apiResponse.error_code}] [${apiResponse.msg}]`);
            return {
                throughUser: 1
            };
        }
        else if (apiResponse.isSuccess && apiResponse.error_code == "100" && apiResponse.status == "success") {
            console.log(`[CHARGED SUCCESSFULLY] [${msisdn}] [${apiResponse.error_code}] [${apiResponse.status}]`);
            return {
                throughUser: 1
            };
        } else {
            console.log(`[Unable To Charge] [${msisdn}] [${apiResponse.error_code}] [${apiResponse.status}]`);
            if (apiResponse.status == "The account balance is insufficient.") {
                return {
                    throughUser: 2
                };
            } else {
                return {
                    throughUser: 3
                };
            }
        }


    }

}

async function chargeUserAngan(msisdn, freshUser) {
    let interval = 0;
    if (freshUser == 1) {
        interval = 14;
    } else {
        interval = 7;
    }

    let amount = 4;
    // if (serviceId == 1) {
    //     interval = 7;
    //     amount = 1.20;
    // }
    // if (serviceId == 2) {
    //     interval = 1;
    //     amount = 0.25;
    // }
    const apiUrl = `http://10.248.216.159:7082/charge?cellno=${msisdn}&amount=${amount}&interval=${interval}`;
    console.log(`http://10.248.216.159:7082/charge?cellno=${msisdn}&amount=${amount}&interval=${interval}`);

    let chargeAPI = await axios.get(apiUrl).catch(err => { console.log(`ERROR in Charging API for user : ${msisdn}  ::::: ${err.message}`) });
    if (chargeAPI) {
        let apiResponse = chargeAPI.data;
        console.log(`chargeAPI Response : ${JSON.stringify(apiResponse)}`);
        if (apiResponse.hasOwnProperty('msg') && apiResponse.error_code == "100") {
            console.log("already charge ", apiResponse.error_code);
            console.log(`[ALREADY CHARGED] [${msisdn}] [${apiResponse.error_code}] [${apiResponse.msg}]`);
            return {
                throughUser: 1
            };
        }
        else if (apiResponse.isSuccess && apiResponse.error_code == "100" && apiResponse.status == "success") {
            console.log(`[CHARGED SUCCESSFULLY] [${msisdn}] [${apiResponse.error_code}] [${apiResponse.status}]`);
            return {
                throughUser: 1
            };
        } else {
            console.log(`[Unable To Charge] [${msisdn}] [${apiResponse.error_code}] [${apiResponse.status}]`);
            if (apiResponse.status == "The account balance is insufficient.") {
                return {
                    throughUser: 2
                };
            } else {
                return {
                    throughUser: 3
                };
            }
        }


    }

}


module.exports = {
    sendChargingRequest,
    geCheckBalanceStatus,
    chargeUser,
    chargeUserAngan
}

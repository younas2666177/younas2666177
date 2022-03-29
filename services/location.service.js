const axios = require('axios').default;
const axiosRetry = require('axios-retry');


const local = "http://127.0.0.1:4319";
const live = "http://10.248.216.157:4000";


axiosRetry(axios, {
    retries: 3, // number of retries
    retryDelay: (retryCount) => {
        console.log(`retry attempt: ${retryCount}`);
        return retryCount * 60000; // time interval between retries
    },
    retryCondition: (error) => {
        if (error) {
            console.log(error)
        }
        // if retry condition is not specified, by default idempotent requests are retried
        if (error && error.response) {
            return error.response.status >= 500;
        } else {
            return false;
        }
    },
});

function getLocationByMsisdn(msisdn) {
    return axios.get(`${live}/api/location?msisdn=${msisdn}`, {}, { timeout: 3000 })
        .then(function (response) {
            // handle success
            console.log(response.data);

            return response.data;
        })
        .catch(function (error) {
            // handle error
            console.log(error);
            return null;
        })
}

// async function getLocationByMsisdnV2(msisdn, retryCount = 0) {

//     return axios.get(`${local}/api/location?msisdn=${msisdn}`)
//         .then(function (response) {
//             // handle success
//             console.log(response.data);
//             return response.data;
//         })
//         .catch(function (error) {
//             console.log(error.message);
//             console.log(`Retrying request for ${msisdn} - count ${retryCount}`);
//             if (retryCount > 5) {
//                 return null;
//             } else {
//                 return handleRequest(msisdn, retryCount + 1);
//             }
//         });
// }

module.exports = {
    getLocationByMsisdn
}

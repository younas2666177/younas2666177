const { isMsisdnValid, isServiceIdValid } = require('../services/validation.service');
const kAnganService = require('../services/k_angan.service');
const { SUB_MODES, UNSUB_MODES, K_ANGAN } = require('../config/general.config.json');


async function getSubscriberDetail(payload) {
    let { cellno } = payload;
    if (!cellno) {
        return {
            responseCode: 900,
            message: "Params not found"
        }
    }

    const msisdnOk = isMsisdnValid(cellno);

    if (!msisdnOk.success) {
        return {
            responseCode: 900,
            message: msisdnOk.message
        }
    }

    const result = await kAnganService.getSubscriberDetail(payload);

    return result;
}

async function subscribeUser(payload) {
    let { cellno, subMode, serviceId } = payload;

    if (!cellno || !subMode || !serviceId) {
        return {
            responseCode: 900,
            message: "Params not found"
        }
    }

    const msisdnOk = isMsisdnValid(cellno);

    if (!msisdnOk.success) {
        return {
            responseCode: 900,
            message: msisdnOk.message
        }
    }

    if (SUB_MODES.indexOf(subMode) < 0) {
        if (!msisdnOk.success) {
            return {
                responseCode: 900,
                message: "Invalid subMode"
            }
        }
    }

    const serviceIdOk = isServiceIdValid(serviceId);

    if (serviceIdOk.success) {
        serviceId = serviceIdOk.data.serviceId;
    } else {
        serviceId = K_ANGAN.DEFAULT_SERVICE_ID;
    }

    const result = await kAnganService.subscribe(payload);

    return result;

}

async function unsubscribeUser(payload) {
    let { cellno, unSubMode } = payload;
    if (!cellno || !unSubMode) {
        return {
            responseCode: 900,
            message: "Params not found"
        }
    }

    const msisdnOk = isMsisdnValid(cellno);

    if (!msisdnOk.success) {
        return {
            responseCode: 900,
            message: msisdnOk.message
        }
    }

    if (UNSUB_MODES.indexOf(unSubMode) < 0) {
        if (!msisdnOk.success) {
            return {
                responseCode: 900,
                message: "Invalid unSubMode"
            }
        }
    }

    const result = await kAnganService.unsubscribe(payload);

    return result;
}

async function updateSubscriber(payload) {
    let { cellno } = payload;

    if (!cellno) {
        return {
            responseCode: 900,
            message: "Params not found"
        }
    }

    const msisdnOk = isMsisdnValid(cellno);

    if (!msisdnOk.success) {
        return {
            responseCode: 900,
            message: msisdnOk.message
        }
    }

    const result = await kAnganService.updateSubscriber(payload);

    return result;

}

module.exports = {
    getSubscriberDetail,
    subscribeUser,
    unsubscribeUser,
    updateSubscriber
}
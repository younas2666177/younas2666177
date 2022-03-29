const { isMsisdnValid, isServiceIdValid } = require('../services/validation.service');
const kSehatService = require('../services/k_sehat.service');
const { SUB_MODES, UNSUB_MODES, K_SEHAT } = require('../config/general.config.json');


async function getSubscriberDetail({ cellno }) {
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

    const result = await kSehatService.getSubscriberDetail(cellno);

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
        serviceId = K_SEHAT.DEFAULT_SERVICE_ID;
    }

    const result = await kSehatService.subscribe(payload);

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

    const result = await kSehatService.updateSubscriber(payload);

    return result;

}

async function unsubscribeUser(payload) {
    let { cellno, unsubMode } = payload;
    if (!cellno || !unsubMode) {
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

    if (UNSUB_MODES.indexOf(unsubMode) < 0) {
        if (!msisdnOk.success) {
            return {
                responseCode: 900,
                message: "Invalid unsubMode"
            }
        }
    }

    const result = await kSehatService.unsubscribe(payload);

    return result;
}

module.exports = {
    getSubscriberDetail,
    subscribeUser,
    unsubscribeUser,
    updateSubscriber
}
const { isMsisdnValid, isServiceIdValid } = require('../services/validation.service');
const kNamaService = require('../services/k_nama.service');
const { SUB_MODES, UNSUB_MODES, K_NAMA } = require('../config/general.config.json');


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

    const result = await kNamaService.getSubscriberDetail(cellno);

    return result;
}

async function subscribeUser({ cellno, subMode, serviceId }) {

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
        serviceId = K_NAMA.DEFAULT_SERVICE_ID;
    }

    const result = await kNamaService.subscribe(cellno, subMode, serviceId);

    return result;

}

async function unsubscribeUser({ cellno, unsubMode }) {
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

    const result = await kNamaService.unsubscribe(cellno, unsubMode);

    return result;
}

module.exports = {
    getSubscriberDetail,
    subscribeUser,
    unsubscribeUser
}
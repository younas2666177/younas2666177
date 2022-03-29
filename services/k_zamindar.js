const { isMsisdnValid, isServiceIdValid } = require('../services/validation.service');
const kZamindarService = require('../services/k_zamindar.service');
const { SUB_MODES, UNSUB_MODES, K_ZAMINDAR } = require('../config/general.config.json');


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

    const result = await kZamindarService.getSubscriberDetail(cellno);

    return result;
}

async function subscribeUser({ cellno, subMode, serviceId }) {

    if (!cellno || !subMode) {
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

    const result = await kZamindarService.subscribe(cellno, subMode, serviceId);

    return result;

}

async function unsubscribeUser({ cellno, unSubMode }) {
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
                message: "Invalid unsubMode"
            }
        }
    }

    const result = await kZamindarService.unsubscribe(cellno, unSubMode);

    return result;
}

async function updateUserProfile({ cellno, srvc_id, lang }) {
    if (!cellno) {
        return {
            responseCode: -100,
            message: "Params not found"
        }
    }

    const msisdnOk = isMsisdnValid(cellno);

    if (!msisdnOk.success) {
        return {
            responseCode: -100,
            message: msisdnOk.message
        }
    }

    const result = await kZamindarService.updateProfile(cellno, srvc_id, lang);

    return result;
}

async function sendSms({ cellno, smsKeyWord }) {

    if (!cellno || !smsKeyWord) {
        return {
            responseCode: -100,
            message: "Params not found"
        }
    }

    const msisdnOk = isMsisdnValid(cellno);

    if (!msisdnOk.success) {
        return {
            responseCode: -100,
            message: msisdnOk.message
        }
    }

    if (smsKeyWord == "UNSUB_SMS") {
        kZamindarService.sendUnSubscriptionSms(cellno, "punjab");
    }

    return {
        responseCode: 100,
        message: "Message sent."
    }


}

module.exports = {
    getSubscriberDetail,
    subscribeUser,
    unsubscribeUser,
    updateUserProfile,
    sendSms
}
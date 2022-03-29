const {
    Subscriber,
    SubscriberUnsub,
    Service,
    SuccessChargeDetail,
    ChargeAttempt,
    DailyChargeAttempt,
    WebdocAccessToken,
    NewSubChargeResponse,
    ResponseCodeDef,
    ServiceSms,
    Sequelize,
    sequelize
} = require('../models/k_nama');
const { K_NAMA, DEFAULT_OPERATOR } = require('../config/general.config.json');
const { addDays, add, compareAsc, getDate, format } = require('date-fns');
const tpService = require('../services/tp_service');
const smsService = require("../services/sms.service");

const { Op } = Sequelize;

function compareDate(firstDate, secondDate) {
    var newFirstDate = new Date(firstDate);
    var newSecondDate = new Date(secondDate);
    newFirstDate.setTime(0);
    newSecondDate.setTime(0);
    if (newFirstDate > newSecondDate) {
        return 1;
    } else if (newFirstDate < newSecondDate) {
        return -1;
    } else {
        return 0;
    }
}

async function getSubscriberDetail(msisdn) {

    const foundSubscriber = await Subscriber.findOne({
        where: {
            msisdn: msisdn,
            status: 100
        }
    });

    let hasGrace = false;
    let hasService = false;

    if (foundSubscriber) {
        const currentTime = new Date();

        if (foundSubscriber.graceExpireDateTime) {
            const graceTime = new Date(foundSubscriber.graceExpireDateTime);

            if (graceTime > currentTime) {
                hasGrace = true
            }
        }


        if (foundSubscriber.lastChargeDateTime) {
            if (foundSubscriber.nextChargeDateTime) {
                const nextChargeDatetime = new Date(foundSubscriber.nextChargeDateTime);

                if (nextChargeDatetime > currentTime) {
                    hasService = true;
                }
            }

        }

    }

    const response = {
        responseCode: 100,
        isSubscriber: foundSubscriber ? 'Y' : 'N',
        hasService: hasService ? 'Y' : 'N',
        hasGrace: hasGrace ? 'Y' : 'N',
        lastSubscriptionDate: foundSubscriber ? foundSubscriber.subDateTime : null,
        lastChargeStatus: foundSubscriber ? foundSubscriber.lastChargeStatus : null,
        message: foundSubscriber ? "user found" : "user not found",
        serviceId: foundSubscriber ? foundSubscriber.serviceId : null
    }


    return {
        responseCode: response.responseCode,
        IS_SUB: response.isSubscriber,
        HAS_SERVICE: response.hasService,
        HAS_GRACE: response.hasGrace,
        LAST_SUB_DT: response.lastSubscriptionDate,
        LCR_STATUS: response.lastChargeStatus,
        message: response.message,
        SERVICE_ID: response.serviceId
    }


}

async function subscribe(msisdn, subMode, serviceId) {
    try {

        const foundSubscriber = await getSubscriberDetail(msisdn);

        if (foundSubscriber.IS_SUB == "Y") {
            return {
                responseCode: 100,
                message: `cellno: ${msisdn}, is already an active subscriber.`,
                IS_RETURNING_USER: null,
                HAS_GRACE: foundSubscriber.HAS_GRACE,
                HAS_SERVICE: foundSubscriber.HAS_SERVICE,
                cellno: msisdn,
                sub_mode: null,
                province: null,
                district: null,
                tehsil: null,
                lat: null,
                lng: null,
                site_name: null,
                lang: null,
                srvc_id: foundSubscriber.SERVICE_ID,
                IS_SUBSCRIBED: "Y",
                LAST_SUB_DT: foundSubscriber.LAST_SUB_DT
            }
        }

        let isReturningUser = false;


        let chargeAmount = null;
        const foundServiceAmount = await getAmountAgainstService(serviceId);

        if (foundServiceAmount.success && foundServiceAmount.data.amount) {
            chargeAmount = foundServiceAmount.data.amount;
        } else {
            chargeAmount = K_NAMA.AMOUNT_TO_CHARGE;
            serviceId = K_NAMA.DEFAULT_SERVICE_ID;
        }

        //const graceExpireDateTime = format(addDays(new Date(), K_NAMA.GRACE_INTERVAL_UNCHARGED), "yyyy-MM-dd HH:mm:ss");

        var currentTime = add(new Date(), {
            hours: 5
        });
        const subscriberUnsubCount = await SubscriberUnsub.count({ where: { msisdn: msisdn } });

        if (subscriberUnsubCount > 0) {//returning user
            const chargingStatus = await SuccessChargeDetail.count({
                where: {
                    msisdn: msisdn,
                    serviceId: serviceId,
                    processed: true,
                    responseCode: 100,
                    [Op.and]: [
                        sequelize.literal(`DATE_ADD(date(charged_dt), INTERVAL ${K_NAMA.CHARGE_INTERVAL} DAY ) > date(now())`)
                    ]
                }
            });

            const foundUnsubInfo = await SubscriberUnsub.findOne({ where: { msisdn: msisdn } });
            var selectedGrace = null;
            if ([1].includes(compareDate(foundUnsubInfo.graceExpireDateTime, currentTime))) {
                selectedGrace = foundUnsubInfo.graceExpireDateTime
            } else {
                selectedGrace = add(new Date(), {
                    hours: 5,
                    days: 7
                });
            }
            await Subscriber.create({
                msisdn: msisdn,
                subDateTime: currentTime,
                unsubDateTime: foundUnsubInfo ? foundUnsubInfo.unsubDateTime : null,
                subMode: subMode,
                unsubMode: foundUnsubInfo ? foundUnsubInfo.unsubMode : null,
                chargeAttemptDateTime: foundUnsubInfo ? foundUnsubInfo.chargeAttemptDateTime : null,
                lastChargeDateTime: foundUnsubInfo ? foundUnsubInfo.lastChargeDateTime : null,
                nextChargeDateTime: foundUnsubInfo && chargingStatus > 0 ? foundUnsubInfo.nextChargeDateTime : null,
                graceExpireDateTime: selectedGrace,
                op: foundUnsubInfo ? foundUnsubInfo.op : null,
                status: foundUnsubInfo ? foundUnsubInfo.status : null,
                serviceId: serviceId
            });

            // SEND SMS HERE, and send charge amount in sms

            sendInfoSms(msisdn, "SUB_SMS", chargeAmount, null, null);

            return {
                responseCode: 100,
                message: `Successfully subscribed to this service.`,
                IS_RETURNING_USER: "Y",
                HAS_LOCATION: null,
                cellno: msisdn,
                sub_mode: subMode,
                province: null,
                district: null,
                tehsil: null,
                lat: null,
                lng: null,
                site_name: null,
                lang: null,
                srvc_id: serviceId,
                IS_SUBSCRIBED: "Y",
                LAST_SUB_DT: currentTime,
                graceExpireDateTime: selectedGrace
            }
        }
        const newUserGraceExpireDateTime = add(new Date(), {
            hours: 5,
            days: K_NAMA.GRACE_INTERVAL_FIRST_CHARGED
        });
        await Subscriber.create({
            msisdn: msisdn,
            subDateTime: currentTime,
            subMode: subMode,
            op: DEFAULT_OPERATOR,
            status: 100,
            serviceId: serviceId,
            graceExpireDateTime: newUserGraceExpireDateTime
        });

        // SEND SMS HERE, and send charge amount in sms

        sendInfoSms(msisdn, "SUB_SMS", chargeAmount, null, null);

        return {
            responseCode: 100,
            message: `Successfully subscribed to this service.`,
            IS_RETURNING_USER: "N",
            HAS_LOCATION: null,
            cellno: msisdn,
            sub_mode: subMode,
            province: null,
            district: null,
            tehsil: null,
            lat: null,
            lng: null,
            site_name: null,
            lang: null,
            srvc_id: serviceId,
            IS_SUBSCRIBED: "Y",
            LAST_SUB_DT: currentTime,
            graceExpireDateTime: newUserGraceExpireDateTime
        }

    } catch (error) {
        console.log(error);
        return {
            responseCode: 900,
            message: "Something went wrong. Please try again later"
        }
    }


}

async function unsubscribe(msisdn, unsubMode) {
    try {

        const foundSubscriber = await Subscriber.findOne({ where: { msisdn: msisdn } });

        if (!foundSubscriber) {
            return {
                responseCode: 100,
                message: "User is not an active subscriber, unable to unsubscribe.",
                cellno: msisdn,
                unsub_mode: unsubMode,
                IS_UN_SUB: "N",
                sub_dt: "",
                total_charged_amount: ""
            }
        } else {
            var currentTime = new Date();
            currentTime = add(new Date(), {
                hours: 5
            });
            const t = await sequelize.transaction();

            await SubscriberUnsub.upsert({
                msisdn,
                subDateTime: foundSubscriber.subDateTime,
                unsubDateTime: currentTime,
                subMode: foundSubscriber.subMode,
                unsubMode: unsubMode,
                chargeAttemptDateTime: foundSubscriber.chargeAttemptDateTime,
                lastChargeDateTime: foundSubscriber.lastChargeDateTime,
                nextChargeDateTime: foundSubscriber.nextChargeDateTime,
                graceExpireDateTime: foundSubscriber.graceExpireDateTime,
                status: foundSubscriber.status,
                op: foundSubscriber.op,
                serviceId: foundSubscriber.serviceId,
                lastCallDateTime: foundSubscriber.lastCallDateTime
            }, { returning: true, transaction: t });

            await Subscriber.destroy({ where: { msisdn: msisdn }, transaction: t });

            await t.commit();

            const totalChargedAmount = await getTotalChargedAmount(msisdn);

            sendInfoSms(msisdn, "UNSUB_SMS", null, null, null);

            return {
                responseCode: 100,
                message: "Successfully unsubscribed from service.",
                cellno: msisdn,
                unsub_mode: unsubMode,
                IS_UN_SUB: "Y",
                sub_dt: foundSubscriber.subDateTime,
                total_charged_amount: totalChargedAmount
            }
        }


    } catch (error) {
        console.log(error);
        return {
            responseCode: 900,
            message: "Something went wrong. Please try again later"
        }
    }
}

async function getAmountAgainstService(serviceId) {
    const foundService = await Service.findOne({ where: { id: serviceId } });

    if (foundService) {
        return {
            success: true,
            message: "ok",
            data: {
                amount: foundService.amount,
                insuranceAmount: foundService.insuranceAmount
            }
        }
    }

    return {
        success: false,
        message: "Service not found."
    }
}

async function getTotalChargedAmount(msisdn) {
    const newSubscriptionChargeAmount = await ChargeAttempt.sum("amount", {
        where: {
            responseCode: 100,
            msisdn: msisdn
        }
    });
    const serviceRenewlChargeAmount = await DailyChargeAttempt.sum("amount", {
        where: {
            responseCode: 100,
            msisdn: msisdn
        }
    });

    return (newSubscriptionChargeAmount || 0) + (serviceRenewlChargeAmount || 0);
}

async function charging(msisdn) {

    const foundChargingStatus = await Subscriber.count({
        where: {
            msisdn: msisdn,
            subMode: {
                [Op.ne]: "API"
            },
            lastChargeStatus: {
                [Op.ne]: 50
            }
        }
    });

    if (foundChargingStatus <= 0) {
        `cellno: ${msisdn}, already in charging state or submode is API`;
    }

    // updating charging status
    await Subscriber.update({ lastChargeStatus: 50 }, { where: { msisdn: msisdn } });

    const subscriberUnsubCount = await SubscriberUnsub.count({ where: { msisdn: msisdn } });

    const isReturningUser = subscriberUnsubCount && subscriberUnsubCount > 0 ? true : false;

    const foundSubscriber = await Subscriber.findOne({ where: { msisdn: msisdn } });

    const userValidToCharge = await isValidToCharge(msisdn);

    if (!userValidToCharge) {
        //update user here
        return "charging failed due to already charged";
    }

    const { serviceId, subMode } = foundSubscriber;

    const { data } = await getAmountAgainstService(serviceId);

    const { amount, insuranceAmount } = data || { amount: null, insuranceAmount: null };

    if (!amount || amount <= 0) {
        return `cellno: ${msisdn}, charging failed due to amount: ${amount}`;
    }

    const accessToken = await getChargingApiAccessToken();

    if (!accessToken) {
        return `Cellno: ${msisdn}, charging failed due to token expiration, token value: ${access_token}`;
    }

    const apiUrl = `/kz_charging?cellno=${msisdn}&token=${accessToken}&amount=${amount}&partnerID=${K_NAMA.PARTNER_ID}&productID=${K_NAMA.PRODUCT_ID}`

    const newChargeAttempt = await saveChargeAttempt(msisdn, serviceId, subMode, apiUrl);
    const chargingRequestResp = await tpService.sendChargingRequest(msisdn, amount, accessToken, K_NAMA.PARTNER_ID, K_NAMA.PRODUCT_ID);
    console.log(chargingRequestResp);

    // updating charging status
    await foundSubscriber.update({ lastChargeStatus: 100 });

    if (chargingRequestResp) {
        await updateChargeAttempt(msisdn, 404, null, null, "-100", serviceId, newChargeAttempt.id);
        await saveChargingResponse(msisdn, 404, null)
        return `Charging failed due to  ${chargingRequestResp}`;
    }

    const { responseCode, message, IS_SUCCESS_CHARGE } = chargingRequestResp;

    const codeAgainstMsg = await getCodeAgainstMessage(message);

    if (String(responseCode).trim() !== "100") {
        await updateChargeAttempt(msisdn, codeAgainstMsg, message, amount, "-100", serviceId, newChargeAttempt.id);

        // take backup of charge atttempt in sm_charge_attempt here.

        await saveChargingResponse(msisdn, codeAgainstMsg, message);

        return `Charging failed due to ${message}`;
    }

    if (String(responseCode).trim() == "100" && IS_SUCCESS_CHARGE !== "N") {
        await updateSuccessSubChargeDetail(msisdn, serviceId, amount, subMode, responseCode, message);
        const nextChargeDT = addDays(new Date(), K_NAMA.CHARGE_INTERVAL);
        let graceExpireDT = null;

        if (foundSubscriber.graceExpireDateTime) {
            const currentTime = new Date();
            const currentGraceTime = new Date(foundSubscriber.graceExpireDateTime);
            const extraGraceTime = addDays(currentGraceTime, K_NAMA.GRACE_GRANT_INERVAL);

            if (currentTime <= extraGraceTime) {
                graceExpireDT = addDays(new Date(), K_NAMA.GRACE_INTERVAL_RENEW_CHARGED);
            } else {
                graceExpireDT = addDays(new Date(), K_NAMA.GRACE_INTERVAL_FIRST_CHARGED);
            }

        } else {
            graceExpireDT = addDays(new Date(), K_NAMA.GRACE_INTERVAL_FIRST_CHARGED);
        }

        await Subscriber.update({
            chargeAttemptDateTime: new Date(),
            lastChargeDateTime: new Date(),
            nextChargeDateTime: nextChargeDT,
            graceExpireDateTime: graceExpireDT
        }, {
            where: {
                msisdn: msisdn
            }
        });

        await updateChargeAttempt(msisdn, codeAgainstMsg, message, amount, "100", serviceId, newChargeAttempt.id);
        await saveChargingResponse(msisdn, codeAgainstMsg, message);

        return "100";
    }

    await updateChargeAttempt(msisdn, codeAgainstMsg, message, amount, "-100", serviceId, newChargeAttempt.id);
    await saveChargingResponse(msisdn, codeAgainstMsg, message);
    return `Charging failed due to ${message}`;
}

async function isValidToCharge(msisdn) {
    const foundSubscriber = await Subscriber.findOne({
        attributes: ['nextChargeDateTime'],
        where: {
            msisdn: msisdn
        }
    });

    if (foundSubscriber) {
        if (foundSubscriber.nextChargeDateTime) {
            const chargeTime = new Date(foundSubscriber.nextChargeDateTime);
            const currentTime = new Date();

            if (currentTime > chargeTime) {
                return true;
            }

            return false;
        }

        return true;
    }

    return false;
}

function getChargingApiAccessToken() {
    return WebdocAccessToken.findOne({
        order: [
            [lastUpdated, "DESC"]
        ]
    }).then(result => {
        return result.accessToken;
    }).catch(error => {
        return null;
    });
}

function saveChargeAttempt(msisdn, serviceId, subMode, apiUrl) {
    const currentDateTime = new Date();
    const currentDate = format(currentDateTime, "yyyy-MM-dd");
    return ChargeAttempt.create({
        msisdn: msisdn,
        currentTime: currentDate,
        requestDateTime: currentDateTime,
        serviceId: serviceId,
        apiUrl: apiUrl,
        status: 50,
        subMode: subMode
    }).then(result => {
        return result;
    }).catch(error => {
        console.log(error);
        return null;
    })
}

function updateChargeAttempt(msisdn, responseCode, responseMessage, amount, status, serviceId, chargeAttemptId) {

    return ChargeAttempt.update({
        msisdn: msisdn,
        responseCode,
        responseMessage,
        responseDateTime: new Date(),
        amount,
        status,
        serviceId,
    }, {
        where: {
            id: chargeAttemptId
        }
    }).then(result => {
        return result;
    }).catch(error => {
        console.log(error);
        return null;
    })
}

function saveChargingResponse(msisdn, responseCode, response) {
    return NewSubChargeResponse.create({
        msisdn,
        chargeAttemptDateTime: new Date(),
        responseCode,
        response
    }).then(result => {
        return result;
    }).catch(error => {
        console.log(error);
        return null;
    })
}

function getCodeAgainstMessage(respMsg) {
    return ResponseCodeDef.findOne({
        where: {
            responseMessage: respMsg
        }
    }).then(result => {
        return result.responseCode;
    }).catch(error => {
        console.log(error);
        return null;
    })
}

function updateSuccessSubChargeDetail(msisdn, serviceId, amount, subscriptionType, responseCode, message) {
    return SuccessChargeDetail.create({
        msisdn,
        serviceId,
        amount,
        chargeType: 0,
        created: new Date(),
        chargedDateTime: new Date(),
        subscriptionType,
        responseCode,
        message,
        processed: true
    }).then(result => {
        return result;
    }).catch(error => {
        console.log(error);
        return null;
    })
}

async function sendInfoSms(msisdn, smsKeyword, amount, insuranceAmount, nextChargeDateTime) {

    const foundSmsContent = await ServiceSms.findOne({
        where: {
            keyword: smsKeyword
        }
    });

    if (!foundSmsContent || !foundSmsContent.smsText) {
        return;
    }
    console.log(foundSmsContent.smsText);

    let smsText = String(foundSmsContent.smsText);

    if (amount) {
        smsText.replace("<amount>", amount);
    }

    if (insuranceAmount) {
        smsText.replace("<insurance amount>", insuranceAmount);
    }

    if (nextChargeDateTime) {
        smsText.replace("<next_charge_dt>", format(new Date(nextChargeDateTime), "yyyy-MM-dd HH:mm:ss"));
    }


    await smsService.sendSms(msisdn, smsText, 727288);

}
module.exports = {
    getSubscriberDetail,
    unsubscribe,
    subscribe,
    charging
}
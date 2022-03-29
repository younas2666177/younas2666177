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
} = require('../models/k_sehat');
const { K_SEHAT, DEFAULT_OPERATOR } = require('../config/general.config.json');
const { addDays, compareAsc, getDate, format } = require('date-fns');
const tpService = require('../services/tp_service');
const axios = require('axios').default;
const smsService = require("../services/sms.service");
var add = require('date-fns/add');
const moment = require('moment');
const log = console.log;
const mask = "727233";
const liveChargeUrl = `http://10.248.216.169:7224/live-charge/telenor`;
const { Op } = Sequelize;

async function alreadySubSms(msisdn) {
    const content = "آپ کے نمبر پر یہ سروس پہلے سے لگی ہوئی ہے،شکریہ";
    await smsService.sendSms(msisdn, content, `${mask}`);
}

async function notSubSms(msisdn) {
    const content = "آپ کے نمبر پر یہ سروس موجود نہیں، سروس حاصل کرنے کے لیے sub لکھ کر اسی نمبر پر بھیجیں، یا 727233 ملا کر 1 کا بٹن دبائیں۔ شکریہ";
    await smsService.sendSms(msisdn, content, `${mask}`);
}

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


async function updateSubscriber(payload) {
    let { nextChargeDt, lastChargeDt, chargeAttemptDt, graceDt, serviceId, cellno } = payload;

    try {
        let nextChargeDate = moment(nextChargeDt).format(`YYYY-MM-DD HH:mm:ss`);
        let lastChargeDate = moment(lastChargeDt).format(`YYYY-MM-DD HH:mm:ss`);
        let chargeAttemptDate = moment(chargeAttemptDt).format(`YYYY-MM-DD HH:mm:ss`);
        let graceDate = moment(graceDt).format(`YYYY-MM-DD HH:mm:ss`);
        let user = await Subscriber.update({
            chargeAttemptDateTime: chargeAttemptDate,
            lastChargeDateTime: lastChargeDate,
            nextChargeDateTime: nextChargeDate,
            graceExpireDateTime: graceDate,
            serviceId
        },
            { where: { msisdn: cellno } });


        if (user) {
            return {
                responseCode: 100,
                message: `Successfully updated subscriber record.`,
                msisdn: cellno,
                nextChargeDt: nextChargeDate,
                lastChargeDt: lastChargeDate,
                chargeAttemptDt: chargeAttemptDate,
                graceDt: graceDate,
                serviceId
            };
        }
        else {
            return {
                responseCode: 900,
                message: `Subscriber does not exist.`,
                msisdn: cellno,
                nextChargeDt: nextChargeDate,
                lastChargeDt: lastChargeDate,
                chargeAttemptDt: chargeAttemptDate,
                graceDt: graceDate,
                serviceId
            };

        }
    } catch (error) {
        console.log(`error in updating subscriber ${cellno} : ${error.message}`);
        return {
            responseCode: 900,
            message: `unable to update subscriber ${cellno}`
        };
    }
}


async function subscribe(payload) {
    let { cellno: msisdn, subMode, serviceId } = payload;
    try {
        let userNextChargeDate = null;
        let userLastChargeDate = null;
        let userChargeAttemptDate = null;
        let userGraceDate = null;
        let today = moment().format(`YYYY-MM-DD HH:mm:ss`);
        let userChargingData = {
            "cellno": `${msisdn}`,
            "amount": "",
            "ref": "live_charge",
            "paidwall": "k_sehat",
            "chargeInterval": "",
            "serviceId": `${serviceId}`
        };
        let smsKey = "sub_sms";
        let chargeSmsKey = "charging_success_test";
        // serviceId == "1" ? smsKey = "sub_sms_weekly" : smsKey = "sub_sms_daily";
        const foundSubscriber = await getSubscriberDetail(msisdn);

        if (foundSubscriber.IS_SUB == "Y") {
            // alreadySubSms(msisdn);
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
        userChargingData.amount = `${foundServiceAmount.data.amount}`;
        userChargingData.chargeInterval = `${foundServiceAmount.data.interval}`;

        if (foundServiceAmount.success && foundServiceAmount.data.amount) {
            chargeAmount = foundServiceAmount.data.amount;
        } else {
            chargeAmount = K_SEHAT.AMOUNT_TO_CHARGE;
        }

        const currentTime = add(new Date(), {
            hours: 5
        });

        const subscriberUnsubCount = await SubscriberUnsub.count({ where: { msisdn: msisdn } });

        if (subscriberUnsubCount > 0) {//returning user

            const foundUnsubInfo = await SubscriberUnsub.findOne({ where: { msisdn: msisdn } });

            if (SubscriberUnsub.serviceId == serviceId) {
                let checkDt = moment().format(`YYYY-MM-DD`);
                let userGrace = moment(foundUnsubInfo.graceExpireDateTime).format(`YYYY-MM-DD`);
                let chargeDt = moment(foundUnsubInfo.nextChargeDateTime).format(`YYYY-MM-DD`);
                let selectedGrace = foundUnsubInfo.graceExpireDateTime;

                if ((moment(chargeDt).isSameOrBefore(checkDt) || foundUnsubInfo.nextChargeDateTime == null) && ((payload.bundle == "0") || (!payload.bundle))) {

                    const { data } = await axios.post(liveChargeUrl, userChargingData);
                    if (data.data.errorCode == "100" && data.data.status == "success") {
                        userNextChargeDate = data.data.nextChargeDate;
                        userLastChargeDate = data.data.lastChargeDt;
                        userChargeAttemptDate = moment().format(`YYYY-MM-DD HH:mm:ss`);
                        userGraceDate = data.data.graceExpireDate;
                        sendInfoSms(msisdn, chargeSmsKey, foundServiceAmount.data.amount, null, moment(userNextChargeDate).format(`YYYY-MM-DD`));
                    } else {
                        userNextChargeDate = foundUnsubInfo.nextChargeDateTime || null;
                        userLastChargeDate = foundUnsubInfo.lastChargeDateTime || null;
                        userChargeAttemptDate = foundUnsubInfo.chargeAttemptDateTime || null;
                        userGraceDate = foundUnsubInfo.graceExpireDateTime || null;
                    }
                } else {
                    userNextChargeDate = foundUnsubInfo.nextChargeDateTime || null;
                    userLastChargeDate = foundUnsubInfo.lastChargeDateTime || null;
                    userChargeAttemptDate = foundUnsubInfo.chargeAttemptDateTime || null;
                    userGraceDate = foundUnsubInfo.graceExpireDateTime || null;
                }

            } else {

                // SEND SMS HERE, and send charge amount in sms
                if ((payload.bundle == "0") || (!payload.bundle)) {

                    const { data } = await axios.post(liveChargeUrl, userChargingData);

                    if (data.data.errorCode == "100" && data.data.status == "success") {

                        userNextChargeDate = data.data.nextChargeDate;
                        userLastChargeDate = data.data.lastChargeDt;
                        userChargeAttemptDate = moment().format(`YYYY-MM-DD HH:mm:ss`);
                        userGraceDate = data.data.graceExpireDate;
                        sendInfoSms(msisdn, chargeSmsKey, foundServiceAmount.data.amount, null, moment(userNextChargeDate).format(`YYYY-MM-DD`));

                    } else {
                        userNextChargeDate = foundUnsubInfo.nextChargeDateTime || null;
                        userLastChargeDate = foundUnsubInfo.lastChargeDateTime || null;
                        userChargeAttemptDate = foundUnsubInfo.chargeAttemptDateTime || null;
                        userGraceDate = foundUnsubInfo.graceExpireDateTime || null;
                    }

                } else {
                    userNextChargeDate = foundUnsubInfo.nextChargeDateTime || null;
                    userLastChargeDate = foundUnsubInfo.lastChargeDateTime || null;
                    userChargeAttemptDate = foundUnsubInfo.chargeAttemptDateTime || null;
                    userGraceDate = foundUnsubInfo.graceExpireDateTime || null;
                }
            }

            await Subscriber.create({
                msisdn: msisdn,
                subDateTime: today,
                unsubDateTime: foundUnsubInfo ? foundUnsubInfo.unsubDateTime : null,
                subMode: subMode,
                unsubMode: foundUnsubInfo ? foundUnsubInfo.unsubMode : null,
                chargeAttemptDateTime: userChargeAttemptDate,
                lastChargeDateTime: userLastChargeDate,
                nextChargeDateTime: userNextChargeDate,
                graceExpireDateTime: userGraceDate,
                op: foundUnsubInfo ? foundUnsubInfo.op : null,
                status: foundUnsubInfo ? foundUnsubInfo.status : null,
                serviceId: serviceId
            });

            if ((payload.bundle == "0") || (!payload.bundle)) {
                sendInfoSms(msisdn, smsKey, chargeAmount, null, null);
            }
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
                LAST_SUB_DT: today,
                graceExpireDateTime: userGraceDate
            }
        }
        //new user

        if ((payload.bundle == "0") || (!payload.bundle)) {
            const { data } = await axios.post(liveChargeUrl, userChargingData);
            if (data.data.errorCode == "100" && data.data.status == "success") {
                userNextChargeDate = data.data.nextChargeDate;
                userLastChargeDate = data.data.lastChargeDt;
                userChargeAttemptDate = moment().format(`YYYY-MM-DD HH:mm:ss`);
                userGraceDate = data.data.graceExpireDate;
                sendInfoSms(msisdn, chargeSmsKey, foundServiceAmount.data.amount, null, moment(userNextChargeDate).format(`YYYY-MM-DD`));
            } else {
                userNextChargeDate = null;
                userLastChargeDate = null;
                userChargeAttemptDate = null;
                userGraceDate = moment(today).add(7, 'days').format(`YYYY-MM-DD HH:mm:ss`);
            }
        } else {
            userNextChargeDate = null;
            userLastChargeDate = null;
            userChargeAttemptDate = null;
            userGraceDate = moment(today).add(7, 'days').format(`YYYY-MM-DD HH:mm:ss`);
        }

        await Subscriber.create({
            msisdn: msisdn,
            subDateTime: today,
            subMode: subMode,
            op: DEFAULT_OPERATOR,
            status: 100,
            serviceId: serviceId,
            chargeAttemptDateTime: userChargeAttemptDate,
            lastChargeDateTime: userLastChargeDate,
            nextChargeDateTime: userNextChargeDate,
            graceExpireDateTime: userGraceDate,
        });
        if ((payload.bundle == "0") || (!payload.bundle)) {
            sendInfoSms(msisdn, smsKey, chargeAmount, null, null);
        }
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
            LAST_SUB_DT: today,
        }

    } catch (error) {
        console.log(error);
        return {
            responseCode: 900,
            message: "Something went wrong. Please try again later"
        }
    }


}

async function unsubscribe(payload) {
    let { cellno: msisdn, unsubMode } = payload;
    try {

        const foundSubscriber = await Subscriber.findOne({ where: { msisdn: msisdn } });


        if (!foundSubscriber) {
            //      notSubSms(msisdn);
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
            const service = await Service.findOne({ where: { id: foundSubscriber.serviceId } });
            // console.log("unsubscribe service", JSON.stringify(service));
            if (service.bundle == "1" && payload.bundle == "1") {
                console.log(`user ${msisdn} is unsubscribed through bundle`);
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
                return {
                    responseCode: 100,
                    message: "Successfully unsubscribed from service.",
                    cellno: msisdn,
                    unsub_mode: unsubMode,
                    IS_UN_SUB: "Y",
                    sub_dt: foundSubscriber.subDateTime,
                    total_charged_amount: totalChargedAmount
                }
            } else if (service.bundle == "1" && (!payload.bundle || payload.bundle == "0")) {
                console.log(`user ${msisdn} is in bundle`);
                return {
                    responseCode: 100,
                    message: "User is in bundle, unable to unsubscribe.",
                    cellno: msisdn,
                    unsub_mode: unsubMode
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
                //smsService.sendSms(msisdn, "Khushaal Aamdani Service apkay number say khatam kardi gaye hai. Service dobara hasil karnay k liyay 727240 milain. Ya SUB likh kay 727240 pe sms karain. Shukria", 727240);

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
                insuranceAmount: foundService.insuranceAmount,
                interval: foundService.chargeInterval,
                bundle: foundService.bundle
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
    console.log(msisdn, foundSmsContent);
    //console.log(foundSmsContent.smsText);
    if (!foundSmsContent || !foundSmsContent.smsText) {
        return;
    }

    let smsText = String(foundSmsContent.smsText);
    if (amount) {
        smsText = smsText.replace("<amount>", `${amount}`);
    }

    if (insuranceAmount) {
        smsText = smsText.replace("<insurance amount>", insuranceAmount);
    }

    if (nextChargeDateTime) {
        smsText = smsText.replace("<next_charge_dt>", `${nextChargeDateTime}`);
    }
    console.log(msisdn, smsText);

    smsService.sendSms(msisdn, smsText, 727233);

}



module.exports = {
    getSubscriberDetail,
    unsubscribe,
    subscribe,
    updateSubscriber
}
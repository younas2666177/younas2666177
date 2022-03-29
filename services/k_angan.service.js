const {
    Subscriber,
    SubscriberProfile,
    SubscriberUnsub,
    SubscriberStats,
    SubscriberDailyUsageStats,
    SmsContent,
    HelpRequest,
    District,
    ChargingLocationDef,
    Service,
    Sequelize,
    sequelize
} = require('../models/k_angan');
const { K_ANGAN } = require('../config/general.config.json');
const enUS = require('date-fns/locale/en-US');
const moment = require(`moment`);
const tpService = require('../services/tp_service');
const { addDays, compareAsc, getDate, format } = require('date-fns');
const { sendSms } = require('../services/sms.service');
const smsService = require("../services/sms.service");
var add = require('date-fns/add');
let subSms = `آپکے نمبر پر خوشحال آنگن سروس کامیابی سے لگا دی گیی ہے۔ اگر آپ اس سروس کو  اپنے نمبر سے ختم کرنا چاہتے ہیں تو  UNSUB  لکھ کر  727251  پر میسج کریں۔  سروس پر دی گئی معلومات حاصل کرنے کے  لیے 727251  ملائیں۔`;
let unsubSms = `آپکے نمبر سے خوشحال آنگن سروس ختم کر دی گئی ہے۔ سروس دوبارہ حاصل کرنے کے  لیے 727251 ملا کر  1  کا بٹن دبائیں۔`;

const mask = "727251";
const { Op, QueryTypes } = Sequelize;

async function alreadySubSms(msisdn) {
    const content = "آپکے نمبر پر خوشحال آنگن سروس پہلے سے موجود ہے۔";
    await smsService.sendSms(msisdn, content, `${mask}`);
}

async function notSubSms(msisdn) {
    const content = "آپ کے نمبر پر یہ سروس موجود نہیں، سروس حاصل کرنے کے لیے sub لکھ کر اسی نمبر پر بھیجیں، یا 727251 ملا کر 1 کا بٹن دبائیں۔ شکریہ";
    await smsService.sendSms(msisdn, content, `${mask}`);
}

async function updateSubscriber(payload) {
    let { nextChargeDt, lastChargeDt, chargeAttemptDt, graceDt, serviceId, cellno } = payload;

    try {
        let nextChargeDate = moment(nextChargeDt).format(`YYYY-MM-DD HH:mm:ss`);
        let lastChargeDate = moment(lastChargeDt).format(`YYYY-MM-DD HH:mm:ss`);
        let chargeAttemptDate = moment(chargeAttemptDt).format(`YYYY-MM-DD HH:mm:ss`);
        let graceDate = moment(graceDt).format(`YYYY-MM-DD HH:mm:ss`);
        let user = await Subscriber.update({
            chargeAttemptDt: chargeAttemptDate,
            lastChargeDt: lastChargeDate,
            nextChargeDt: nextChargeDate,
            graceExpireDt: graceDate,
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

async function getSubscriberDetail(payload) {
    console.log("getSubscriberDetail : ", payload);
    let { cellno: msisdn } = payload;
    let response = {
        responseCode: 100,
        srvc_id: "",
        lang: "",
        sub_name: K_ANGAN.DEFAULT_SUB_NAME,
        bc_mode: K_ANGAN.DEFAULT_PROFILE_BC_MODE,
        status: null,
        last_unsub_dt: null,
        first_sub_dt: null,
        last_sub_dt: null,
        lastChargeDt: null,
        alert_type: K_ANGAN.DEFAULT_PROFILE_ALERT_TYPE,
        IS_SUB: "N",
        HAS_SERVICE: "N",
        HAS_GRACE: "N",
        charge_attempt_dt: null,
        last_charge_dt: null,
        next_charge_dt: null,
        grace_expire_dt: null,
        service_id: null,
        message: "User not found.",
        callState: ""
    }

    const foundSubscriber = await Subscriber.findOne({
        where: {
            msisdn: msisdn
        }
    });
    console.log(`getSubscriberDetail foundSubscriber ${JSON.stringify(foundSubscriber)}`)

    if (!foundSubscriber) {
        const foundSubscriberUnsub = await SubscriberUnsub.findOne({
            where: {
                msisdn: msisdn
            }
        });

        if (foundSubscriberUnsub) {
            response.lang = foundSubscriberUnsub.lang;
            response.sub_name = foundSubscriberUnsub.subscriberName;
            response.bc_mode = foundSubscriberUnsub.bcMode;
            response.status = foundSubscriberUnsub.status;
            response.first_sub_dt = foundSubscriberUnsub.firstSubDt ? format(new Date(foundSubscriberUnsub.firstSubDt), "yyyy-MM-dd HH:mm:ss") : null;
            response.last_sub_dt = foundSubscriberUnsub.lastSubDt;
            response.last_unsub_dt = foundSubscriberUnsub.lastUnsubDt;
            response.alert_type = foundSubscriberUnsub.alertType;
            // response.lastChargeDt = foundSubscriberUnsub.lastChargeDt ? format(new Date(foundSubscriberUnsub.lastChargeDt), "yyyy-MM-dd HH:mm:ss") : null;
            response.srvcId = foundSubscriberUnsub.srvcId;
            response.charge_attempt_dt = foundSubscriberUnsub.chargeAttemptDt ? format(new Date(foundSubscriberUnsub.chargeAttemptDt), "yyyy-MM-dd HH:mm:ss") : null;
            response.last_charge_dt = foundSubscriberUnsub.lastChargeDt ? format(new Date(foundSubscriberUnsub.lastChargeDt), "yyyy-MM-dd HH:mm:ss") : null;
            response.next_charge_dt = foundSubscriberUnsub.nextChargeDt ? format(new Date(foundSubscriberUnsub.nextChargeDt), "yyyy-MM-dd HH:mm:ss") : null;
            response.grace_expire_dt = foundSubscriberUnsub.graceExpireDt || null;
            response.IS_SUB = "R";
            response.message = "User found in subscriber_unsub";
            // response.HAS_SERVICE = "Y";
            // response.HAS_GRACE = "Y";

            if (response.next_charge_dt) {
                // const lastChargeTime = new Date(response.last_charge_dt);
                const nextChargeTime = new Date(response.next_charge_dt);

                if (nextChargeTime >= (new Date())) {
                    response.HAS_SERVICE = "Y";
                } else {
                    response.HAS_SERVICE = "N";
                }
            } else {
                response.HAS_SERVICE = "N";
            }

            if (foundSubscriberUnsub.graceExpireDt) {
                const graceTime = format(foundSubscriberUnsub.graceExpireDt, "yyyy-MM-dd");
                const { hasGrace } = (await sequelize.query(`SELECT CURRENT_DATE <= DATE("${graceTime}") as hasGrace`, { type: QueryTypes.SELECT }))[0];
                console.log(` ${msisdn} unsub hasGrace ${hasGrace}`)
                response.HAS_GRACE = hasGrace ? "Y" : "N";

            } else {
                response.HAS_GRACE = "N";
            }


            return response;
        } else {
            return response;
        }
    } else {
        const service = await Service.findOne({ where: { id: foundSubscriber.serviceId } });
        response.lang = foundSubscriber.lang;
        response.sub_name = foundSubscriber.subscriberName;
        response.bc_mode = foundSubscriber.bcMode;
        response.first_sub_dt = foundSubscriber.firstSubDt ? format(new Date(foundSubscriber.firstSubDt), "yyyy-MM-dd HH:mm:ss") : null;
        response.last_sub_dt = foundSubscriber.lastSubDateTime ? format(new Date(foundSubscriber.lastSubDateTime), "yyyy-MM-dd HH:mm:ss") : null;
        response.alert_type = foundSubscriber.alertType;
        response.charge_attempt_dt = foundSubscriber.chargeAttemptDt ? format(new Date(foundSubscriber.chargeAttemptDt), "yyyy-MM-dd HH:mm:ss") : null;
        response.last_charge_dt = foundSubscriber.lastChargeDt ? format(new Date(foundSubscriber.lastChargeDt), "yyyy-MM-dd HH:mm:ss") : null;
        response.next_charge_dt = foundSubscriber.nextChargeDt ? format(new Date(foundSubscriber.nextChargeDt), "yyyy-MM-dd HH:mm:ss") : null;
        response.grace_expire_dt = foundSubscriber.graceExpireDt || null;
        response.IS_SUB = "Y";
        response.message = "user found";
        if (foundSubscriber.nextChargeDt) {
            const nextChargeTime = new Date(foundSubscriber.nextChargeDt);

            if (nextChargeTime >= (new Date())) {
                response.HAS_SERVICE = "Y";
            } else {
                response.HAS_SERVICE = "N";
            }
        } else {
            response.HAS_SERVICE = "N";
        }
        if (foundSubscriber.graceExpireDt) {
            const graceTime = format(foundSubscriber.graceExpireDt, "yyyy-MM-dd");
            const { hasGrace } = (await sequelize.query(`SELECT CURRENT_DATE <= DATE("${graceTime}") as hasGrace`, { type: QueryTypes.SELECT }))[0];
            console.log(`${msisdn} sub hasGrace ${hasGrace}`)
            if (hasGrace) {
                response.HAS_GRACE = "Y";
            } else {
                // const foundBalance = await checkBalanceStatus(msisdn);
                // response.HAS_GRACE = foundBalance ? "Y" : "N";
                response.HAS_GRACE = "N";
            }
        } else {
            response.HAS_GRACE = "N";
        }
        if (service.bundle == "0") {
            if (response.next_charge_dt == null) {
                let callCondition = await tpService.chargeUserAngan(msisdn, 0);
                console.log(`callCondition.throughUser ${callCondition.throughUser}`);
                response.callState = callCondition.throughUser;
            }
            if (response.next_charge_dt) {
                let NCD = moment(response.next_charge_dt).format(`YYYY-MM-DD`);
                let today = moment().format(`YYYY-MM-DD`);
                console.log(`${msisdn} :::::::::::: NCD ${NCD} :::::::::::::::: today ${today}`);
                if (moment(NCD).isSameOrBefore(today)) {
                    console.log(`Charge user ${msisdn} true`);
                    let callCondition = await tpService.chargeUserAngan(msisdn, 0);
                    console.log(`callCondition.throughUser ${callCondition.throughUser}`);
                    response.callState = callCondition.throughUser;
                }
            }
        }
        return response;
    }
}

async function subscribe(payload) {
    let { cellno: msisdn, subMode, serviceId } = payload;
    console.log(`subscribe payload : `, payload);
    try {

        let response = {
            IS_RETURNING_USER: null,
            HAS_LOCATION: null,
            cellno: null,
            sub_mode: null,
            lang: null,
            srvc_id: null,
            last_sub_dt: null,
            responseCode: null,
            IS_SUB: null,
            HAS_SERVICE: "N",
            HAS_GRACE: "N",
            message: null,
            callState: ""
        }

        const foundSubscriber = await Subscriber.findOne({ where: { msisdn: msisdn } });

        var currentTime = new Date();
        currentTime = add(new Date(), {
            hours: 5
        });

        if (!foundSubscriber) {

            const foundSubscriberUnsub = await SubscriberUnsub.findOne({ where: { msisdn: msisdn } });
            let serviceUnsub = await Service.findOne({ where: { id: serviceId } });
            console.log(`foundSubscriberUnsub : ${JSON.stringify(foundSubscriberUnsub)}`);
            console.log(`serviceUnsub : ${JSON.stringify(serviceUnsub)}`);

            if (!serviceUnsub) {
                serviceUnsub = await Service.findOne({ where: { id: 1 } });
            }

            const selectedServiceId = serviceUnsub.id || 1; /* Hamza change*/

            if (foundSubscriberUnsub) {
                // Returning User
                const t = await sequelize.transaction();

                await Subscriber.create({
                    msisdn: msisdn,
                    subscriberName: foundSubscriberUnsub.subscriberName,
                    lang: foundSubscriberUnsub.lang,
                    subMode: subMode,
                    bcMode: foundSubscriberUnsub.bcMode,
                    alertType: foundSubscriberUnsub.alertType,
                    srvcId: foundSubscriberUnsub.srvcId,
                    status: 100,
                    province: "punjab",
                    location: "unknown",
                    firstSubDt: foundSubscriberUnsub.firstSubDt,
                    lastSubDateTime: format(currentTime, "yyyy-MM-dd HH:mm:ss"),
                    lastUnsubDt: foundSubscriberUnsub.lastUnsubDt,
                    lastChargeDt: foundSubscriberUnsub.lastChargeDt,
                    chargeAttemptDt: foundSubscriberUnsub.chargeAttemptDt,
                    nextChargeDt: foundSubscriberUnsub.nextChargeDt,
                    graceExpireDt: foundSubscriberUnsub.graceExpireDt,
                    chargeCount: foundSubscriberUnsub.chargeCount,
                    serviceId: selectedServiceId

                }, { transaction: t });

                await t.commit();

                response.IS_RETURNING_USER = "100";
                response.HAS_LOCATION = "100";
                response.cellno = msisdn;
                response.sub_mode = subMode;
                response.lang = foundSubscriberUnsub.lang || K_ANGAN.DEFAULT_LANGUAGE || null;
                response.srvc_id = foundSubscriberUnsub.srvcId || null;
                response.last_sub_dt = format(currentTime, "yyyy-MM-dd HH:mm:ss");
                response.responseCode = 100;
                response.IS_SUB = "R";
                response.message = "Successfully subscribed to this service."

                // Checking user service status
                if (foundSubscriberUnsub.nextChargeDt) {
                    // const lastChargeTime = new Date(foundSubscriberUnsub.lastChargeDt);
                    const nextChargeTime = new Date(foundSubscriberUnsub.nextChargeDt);

                    if (nextChargeTime >= (new Date())) {
                        response.HAS_SERVICE = "Y";
                    } else {
                        response.HAS_SERVICE = "N";
                    }
                } else {
                    response.HAS_SERVICE = "N";
                }

                // Checking User Grace
                if (foundSubscriberUnsub.graceExpireDt) {
                    const graceTime = format(foundSubscriberUnsub.graceExpireDt, "yyyy-MM-dd");
                    const { hasGrace } = (await sequelize.query(`SELECT CURRENT_DATE <= DATE("${graceTime}") as hasGrace`, { type: QueryTypes.SELECT }))[0];

                    if (hasGrace) {
                        response.HAS_GRACE = "Y";
                    } else {
                        response.HAS_GRACE = "N";
                    }
                } else {
                    response.HAS_GRACE = "N";
                }
                if ((serviceUnsub.bundle == "0") || (!payload.bundle) || (payload.bundle && payload.bundle == "0")) {
                    if (response.next_charge_dt == null) {
                        console.log(`Charge date null user ${msisdn} true`);
                        let callCondition = await tpService.chargeUserAngan(msisdn, 0);
                        console.log(`callCondition.throughUser ${callCondition.throughUser}`);
                        response.callState = callCondition.throughUser;
                    }
                    if (response.next_charge_dt) {
                        let NCD = moment(response.next_charge_dt).format(`YYYY-MM-DD`);
                        let today = moment().format(`YYYY-MM-DD`);
                        console.log(`${msisdn} :::::::::::: NCD ${NCD} :::::::::::::::: today ${today}`);
                        if (moment(NCD).isSameOrBefore(today)) {
                            console.log(`Charge user ${msisdn} true`);
                            let callCondition = await tpService.chargeUserAngan(msisdn, 0);
                            console.log(`callCondition.throughUser ${callCondition.throughUser}`);
                            response.callState = callCondition.throughUser;
                        }
                    }

                    await smsService.sendSms(msisdn, subSms, `${mask}`);
                }

                return response;
            } else {

                let graceTime = format(addDays(new Date(), K_ANGAN.GRACE_INTERVAL_NEW_USER), 'yyyy-MM-dd hh:mm:ss zzzz', { locale: enUS });

                console.log("<<<<<NEW USER WITH GRACE: ", graceTime, ">>>>>");

                // New User
                const t = await sequelize.transaction();

                await Subscriber.create({
                    msisdn: msisdn,
                    subscriberName: K_ANGAN.DEFAULT_SUB_NAME,
                    lang: K_ANGAN.DEFAULT_LANGUAGE,
                    subMode: subMode,
                    bcMode: K_ANGAN.DEFAULT_PROFILE_BC_MODE,
                    alertType: K_ANGAN.DEFAULT_PROFILE_ALERT_TYPE,
                    hasConsented: K_ANGAN.DEFAULT_HAS_CONSENTED,
                    srvcId: "wheat",
                    status: 100,
                    province: "punjab",
                    location: "unknown",
                    lastCallDateTime: currentTime,
                    firstSubDt: currentTime,
                    graceExpireDt: graceTime,
                    lastSubDateTime: currentTime,
                    serviceId: serviceId || 1
                }, { transaction: t });


                await t.commit();

                response.IS_RETURNING_USER = "-100";
                response.HAS_LOCATION = K_ANGAN.DEFAULT_HAS_LOCATION;
                response.cellno = msisdn;
                response.sub_mode = subMode;
                response.lang = K_ANGAN.DEFAULT_LANGUAGE;
                response.srvc_id = K_ANGAN.DEFAULT_CROP;
                response.last_sub_dt = format(currentTime, "yyyy-MM-dd HH:mm:ss");;
                response.responseCode = 100;
                response.IS_SUB = "N";
                response.message = "Successfully subscribed to this service."


                if ((serviceUnsub.bundle == "0") || (!payload.bundle) || (payload.bundle && payload.bundle == "0")) {
                    let callCondition = await tpService.chargeUserAngan(msisdn, 1);
                    console.log(`Charging for new user ${msisdn} true ::::::::::: callCondition ${callCondition.throughUser}`);
                    response.callState = callCondition.throughUser;
                    await smsService.sendSms(msisdn, subSms, `${mask}`);
                }
                return response;
            }

        } else {
            response.lang = foundSubscriber.language;
            response.IS_SUB = "Y";
            response.HAS_SERVICE = "Y";
            response.HAS_GRACE = "Y";
            response.responseCode = 100;
            response.message = "Already subscribed to the service";
            if (foundSubscriber.nextChargeDt) {
                // const lastChargeTime = new Date(foundSubscriber.lastChargeDt);
                const nextChargeTime = new Date(foundSubscriber.nextChargeDt);

                if (nextChargeTime >= (new Date())) {
                    response.HAS_SERVICE = "Y";
                } else {
                    response.HAS_SERVICE = "N";
                }
            } else {
                response.HAS_SERVICE = "N";
            }
            // alreadySubSms(msisdn);
            return response;
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
    let { cellno: msisdn, unSubMode } = payload;
    try {

        let response = {
            responseCode: null,
            cellno: null,
            unsub_mode: null,
            IS_SUB: null,
            message: null
        }

        const foundSubscriber = await Subscriber.findOne({ where: { msisdn: msisdn } });
        console.log(`unsubscribe foundSubscriber ${JSON.stringify(foundSubscriber)}`)

        if (!foundSubscriber) {
            console.log(`subscriber not found ${msisdn}`);
            response.responseCode = 100;
            response.message = "User is not an active subscriber, unable to unsubscribe.";
            response.cellno = msisdn;
            response.unsub_mode = unSubMode;
            response.IS_SUB = "N";
            // notSubSms(msisdn);
            return response;
        } else {
            const service = await Service.findOne({ where: { id: foundSubscriber.serviceId } });
            if (service.bundle == "1" && payload.bundle == "1") {
                console.log(`user ${msisdn} is unsubscribed through bundle`);
                var currentTime = new Date();
                currentTime = add(new Date(), {
                    hours: 5
                });

                console.log("going to unsub foundSubscriber :", foundSubscriber);

                await SubscriberUnsub.upsert({
                    msisdn,
                    lang: "punjabi",
                    subscriberName: foundSubscriber.subscriberName || null,
                    firstSubDt: foundSubscriber.firstSubDt || null,
                    lastSubDt: foundSubscriber.lastSubDt || null,
                    lastUnsubDt: currentTime,
                    subMode: foundSubscriber.subMode || null,
                    bcMode: foundSubscriber.bcMode || null,
                    lastCallDt: foundSubscriber.lastCallDt || null,
                    lastUpdateDt: foundSubscriber.lastUpdateDt || null,
                    lastUpdateBy: foundSubscriber.lastUpdateBy || null,
                    lastChargeDt: foundSubscriber.lastChargeDt,
                    chargeAttemptDt: foundSubscriber.chargeAttemptDt,
                    nextChargeDt: foundSubscriber.nextChargeDt,
                    graceExpireDt: foundSubscriber.graceExpireDt,
                    chargeCount: foundSubscriber.chargeCount,
                    serviceId: foundSubscriber.serviceId || 1,
                    gender: "female",
                    occupation: "Farmer",
                    village: "Chak Default",
                    landSize: 1,
                    landUnit: "Qilla",
                    comment: "Default",
                    dt: currentTime,
                    unsubMode: unSubMode,
                    alertType: foundSubscriber.alertType || null,
                    location: foundSubscriber.location || null,
                    srvcId: foundSubscriber.srvcId || null
                }, {
                    returning: true
                });

                await Subscriber.destroy({
                    where: { msisdn: msisdn }
                });

                return {
                    responseCode: 100,
                    message: "Successfully unsubscribed from service.",
                    cellno: msisdn,
                    unsub_mode: unSubMode,
                    IS_SUB: "Y",
                }
            } else if (service.bundle == "1" && (!payload.bundle || payload.bundle == "0")) {
                console.log(`user ${msisdn} is in bundle`);
                return {
                    responseCode: 100,
                    message: "User is in bundle, unable to unsubscribe.",
                    cellno: msisdn,
                    unsub_mode: unSubMode
                }
            } else {
                var currentTime = new Date();
                currentTime = add(new Date(), {
                    hours: 5
                });

                console.log("going to unsub foundSubscriber :", foundSubscriber);

                await SubscriberUnsub.upsert({
                    msisdn,
                    lang: "punjabi",
                    subscriberName: foundSubscriber.subscriberName || null,
                    firstSubDt: foundSubscriber.firstSubDt || null,
                    lastSubDt: foundSubscriber.lastSubDt || null,
                    lastUnsubDt: currentTime,
                    subMode: foundSubscriber.subMode || null,
                    bcMode: foundSubscriber.bcMode || null,
                    lastCallDt: foundSubscriber.lastCallDt || null,
                    lastUpdateDt: foundSubscriber.lastUpdateDt || null,
                    lastUpdateBy: foundSubscriber.lastUpdateBy || null,
                    lastChargeDt: foundSubscriber.lastChargeDt,
                    chargeAttemptDt: foundSubscriber.chargeAttemptDt,
                    nextChargeDt: foundSubscriber.nextChargeDt,
                    graceExpireDt: foundSubscriber.graceExpireDt,
                    chargeCount: foundSubscriber.chargeCount,
                    serviceId: foundSubscriber.serviceId || 1,
                    gender: "female",
                    occupation: "Farmer",
                    village: "Chak Default",
                    landSize: 1,
                    landUnit: "Qilla",
                    comment: "Default",
                    dt: currentTime,
                    unsubMode: unSubMode,
                    alertType: foundSubscriber.alertType || null,
                    location: foundSubscriber.location || null,
                    srvcId: foundSubscriber.srvcId || null
                }, {
                    returning: true
                });

                await Subscriber.destroy({
                    where: { msisdn: msisdn }
                });

                await smsService.sendSms(msisdn, unsubSms, `${mask}`);

                return {
                    responseCode: 100,
                    message: "Successfully unsubscribed from service.",
                    cellno: msisdn,
                    unsub_mode: unSubMode,
                    IS_SUB: "Y",
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


async function updateProfile(msisdn, crop, language) {

    const subscriberCount = Subscriber.count({ msisdn: msisdn });

    if (subscriberCount <= 0) {
        return {
            responseCode: 200,
            message: "Subscriber not found"
        }
    }

    let data = {};


    if (crop) {
        data.crop = crop;
    }

    if (language) {
        data.language = language;
    }

    if (Object.keys(data).length > 0) {
        await Subscriber.update(data, {
            where: {
                msisdn: msisdn
            }
        });

        return {
            responseCode: 100,
            message: "Record Updated"
        }


    } else {
        return {
            responseCode: 100,
            message: "No Value Found For update"
        }
    }


}

async function sendSubscriptionSms(msisdn, location) {

    let id = "punjab_sub_conf_without_location";

    if (location == "gb") {
        id = "gb_sub_conf_without_location";
    }

    if (id) {
        const foundContent = await SmsContent.findOne({
            where: {
                id: id
            }
        });

        await sendSms(msisdn, foundContent.content, 7272);
    }

}

async function sendUnSubscriptionSms(msisdn, location) {
    let id = "punjab_unsub";

    if (location == "gb") {
        id = "gb_unsub";
    }

    if (id) {
        const foundContent = await SmsContent.findOne({
            where: {
                id: id
            }
        });

        sendSms(msisdn, foundContent.content, 7272);
    }
}

module.exports = {
    getSubscriberDetail,
    unsubscribe,
    subscribe,
    updateProfile,
    updateSubscriber
}
const {
    Subscriber,
    SubscriberProfile,
    SubscriberUnsub,
    SubscriberStats,
    SubscriberDailyUsageStats,
    SubscriberUnsubHistory,
    SmsContent,
    HelpRequest,
    Site,
    District,
    Province,
    Tehsil,
    Service,
    ChargingLocationDef,
    Sequelize,
    sequelize
} = require('../models/k_zamindar');
const { K_ZAMINDAR } = require('../config/general.config.json');
const moment = require(`moment`);
const { addDays, format, addMinutes, isAfter } = require('date-fns');
const enUS = require('date-fns/locale/en-US');
const tpService = require('../services/tp_service');
const locationService = require('../services/location.service');
const { sendSms } = require('../services/sms.service');
const { Op, QueryTypes } = Sequelize;

async function getSubscriberDetail(msisdn) {

    let response = {
        responseCode: 100,
        province: K_ZAMINDAR.DEFAULT_PROVINCE,
        district: K_ZAMINDAR.DEFAULT_DISTRICT,
        tehsil: K_ZAMINDAR.DEFAULT_TEHSIL,
        lat: K_ZAMINDAR.DEFAULT_LAT,
        lng: K_ZAMINDAR.DEFAULT_LNG,
        site_name: null,
        srvc_id: "",
        lang: "urdu",
        sub_name: K_ZAMINDAR.DEFAULT_SUB_NAME,
        bc_mode: K_ZAMINDAR.DEFAULT_PROFILE_BC_MODE,
        status: null,
        last_unsub_dt: null,
        first_sub_dt: null,
        last_sub_dt: null,
        gender: null,
        occupation: null,
        village: null,
        land_size: null,
        land_unit: null,
        comment: null,
        mo_call: null,
        mt_call: null,
        mo_sms: null,
        mt_sms: null,
        alert_type: K_ZAMINDAR.DEFAULT_PROFILE_ALERT_TYPE,
        IS_SUB: "N",
        HAS_SERVICE: "N",
        HAS_GRACE: "N",
        last_update_dt: null,
        last_lr_dt: null,
        last_lc_dt: null,
        has_selected_loc: null,
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
            msisdn: msisdn,
            status: {
                [Op.gt]: 0
            }
        }
    });

    if (!foundSubscriber) {
        const foundSubscriberUnsub = await SubscriberUnsub.findOne({
            where: {
                msisdn: msisdn
            }
        });


        if (foundSubscriberUnsub) {
            response.province = foundSubscriberUnsub.province;
            response.tehsil = foundSubscriberUnsub.tehsil;
            response.district = foundSubscriberUnsub.district;
            response.lat = foundSubscriberUnsub.lat;
            response.lng = foundSubscriberUnsub.lng;
            response.lang = foundSubscriberUnsub.language;
            response.srvc_id = foundSubscriberUnsub.crop;
            response.sub_name = foundSubscriberUnsub.subscriberName;
            response.bc_mode = foundSubscriberUnsub.bcMode;
            response.status = foundSubscriberUnsub.status;
            response.first_sub_dt = foundSubscriberUnsub.firstSubDateTime ? format(new Date(foundSubscriberUnsub.firstSubDateTime), "yyyy-MM-dd HH:mm:ss") : null;
            response.last_sub_dt = foundSubscriberUnsub.lastSubDateTime;
            response.last_unsub_dt = foundSubscriberUnsub.lastUnsubDateTime;
            response.gender = foundSubscriberUnsub.gender;
            response.occupation = foundSubscriberUnsub.occupation;
            response.village = foundSubscriberUnsub.village;
            response.land_size = foundSubscriberUnsub.landSize;
            response.land_unit = foundSubscriberUnsub.landUnit;
            response.comment = foundSubscriberUnsub.comment;
            response.mo_call = foundSubscriberUnsub.moCall;
            response.mt_call = foundSubscriberUnsub.mtCall;
            response.mo_sms = foundSubscriberUnsub.moSms;
            response.mt_sms = foundSubscriberUnsub.mtSms;
            response.alert_type = foundSubscriberUnsub.alertType;
            response.has_selected_loc = foundSubscriberUnsub.hasSelectedLocation;
            response.charge_attempt_dt = foundSubscriberUnsub.chargeAttemptDateTime ? format(new Date(foundSubscriberUnsub.chargeAttemptDateTime), "yyyy-MM-dd HH:mm:ss") : null;
            response.last_charge_dt = foundSubscriberUnsub.lastChargeDateTime ? format(new Date(foundSubscriberUnsub.lastChargeDateTime), "yyyy-MM-dd HH:mm:ss") : null;
            response.next_charge_dt = foundSubscriberUnsub.nextChargeDateTime ? format(new Date(foundSubscriberUnsub.nextChargeDateTime), "yyyy-MM-dd HH:mm:ss") : null;
            response.grace_expire_dt = foundSubscriberUnsub.graceExpireDateTime || null;
            response.service_id = foundSubscriberUnsub.serviceId;
            response.IS_SUB = "R";
            response.message = "User found in subscriber_unsub";


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

            if (foundSubscriberUnsub.graceExpireDateTime) {
                const graceTime = formateInTimezone(foundSubscriberUnsub.graceExpireDateTime, "yyyy-MM-dd");
                const { hasGrace } = (await sequelize.query(`SELECT CURRENT_DATE <= DATE("${graceTime}") as hasGrace`, { type: QueryTypes.SELECT }))[0];
                response.HAS_GRACE = hasGrace ? "Y" : "N";

            } else {
                response.HAS_GRACE = "N";
            }


            return response;
        } else {
            return response;
        }
    } else {
        const foundSite = await Site.findOne({ where: { lat: foundSubscriber.lat, lng: foundSubscriber.lng } });

        response.province = foundSubscriber.province;
        response.district = foundSubscriber.district;
        response.tehsil = foundSubscriber.tehsil;
        response.lat = foundSubscriber.lat;
        response.lng = foundSubscriber.lng;
        response.srvc_id = foundSubscriber.crop;
        response.lang = foundSubscriber.language;
        response.sub_name = foundSubscriber.subscriberName;
        response.bc_mode = foundSubscriber.bcMode;
        response.last_sub_dt = foundSubscriber.lastSubDateTime ? format(new Date(foundSubscriber.lastSubDateTime), "yyyy-MM-dd HH:mm:ss") : null;
        response.alert_type = foundSubscriber.alertType;
        response.last_update_dt = foundSite ? format(new Date(foundSite.lastUpdateDateTime), "yyyy-MM-dd HH:mm:ss") : null;
        response.charge_attempt_dt = foundSubscriber.chargeAttemptDateTime ? format(new Date(foundSubscriber.chargeAttemptDateTime), "yyyy-MM-dd HH:mm:ss") : null;
        response.last_charge_dt = foundSubscriber.lastChargeDateTime ? format(new Date(foundSubscriber.lastChargeDateTime), "yyyy-MM-dd HH:mm:ss") : null;
        response.next_charge_dt = foundSubscriber.nextChargeDateTime ? format(new Date(foundSubscriber.nextChargeDateTime), "yyyy-MM-dd HH:mm:ss") : null;
        response.grace_expire_dt = foundSubscriber.graceExpireDateTime || null;
        response.service_id = foundSubscriber.serviceId;
        response.IS_SUB = "Y";
        response.message = "user found";


        if (foundSubscriber.nextChargeDateTime) {
            // const lastChargeTime = new Date(response.last_charge_dt);
            const nextChargeTime = new Date(foundSubscriber.nextChargeDateTime);

            if (nextChargeTime >= (new Date())) {
                response.HAS_SERVICE = "Y";
            } else {
                response.HAS_SERVICE = "N";
            }
        } else {
            response.HAS_SERVICE = "N";
        }

        if (foundSubscriber.graceExpireDateTime) {
            const graceTime = format(foundSubscriber.graceExpireDateTime, "yyyy-MM-dd");
            const { hasGrace } = (await sequelize.query(`SELECT CURRENT_DATE <= DATE("${graceTime}") as hasGrace`, { type: QueryTypes.SELECT }))[0];

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

        let serviceDetails = await Service.findOne({ where: { id: foundSubscriber.serviceId } });

        if (response.next_charge_dt == null) {
            console.log(`Charge date null user ${msisdn} true`);
            let callCondition = await tpService.chargeUser(msisdn, serviceDetails);
            console.log(`callCondition.throughUser ${callCondition.throughUser}`);
            response.callState = callCondition.throughUser;
        }

        if (response.next_charge_dt) {
            let NCD = moment(response.next_charge_dt).format(`YYYY-MM-DD`);
            let today = moment().format(`YYYY-MM-DD`);
            console.log(`${msisdn} :::::::::::: NCD ${NCD} :::::::::::::::: today ${today}`);
            if (moment(NCD).isSameOrBefore(today)) {
                console.log(`Charge user ${msisdn} true`);
                let callCondition = await tpService.chargeUser(msisdn, serviceDetails);
                console.log(`callCondition.throughUser ${callCondition.throughUser}`);
                response.callState = callCondition.throughUser;
            }
        }

        if (
            (
                foundSubscriber.tehsil == "unknown" ||
                foundSubscriber.tehsil == "unknown2" ||
                foundSubscriber.district == "unknown" ||
                foundSubscriber.district == "unknown2"
            ) && (
                !foundSubscriber.lat ||
                foundSubscriber.lat <= 0 ||
                !foundSubscriber.lng ||
                foundSubscriber.lng <= 0
            )
        ) {
            updateLocation(foundSubscriber.msisdn);
        }
        console.log(`get user detail sub response : ${response}`)
        return response;
    }
}


async function checkBalanceStatus(msisdn) {

    const response = await tpService.geCheckBalanceStatus(msisdn);

    if (response.status == "error") {
        return true;
    }

    if (response.status == "success" && response.hasBalance) {
        return true;
    } else {
        return false;
    }
}

async function subscribe(msisdn, subMode, serviceId) {
    try {

        let response = {
            IS_RETURNING_USER: null,
            HAS_LOCATION: null,
            cellno: null,
            sub_mode: "",
            province: "",
            district: "",
            tehsil: "",
            lat: 0.0,
            lng: 0.0,
            site_name: "",
            lang: "",
            srvc_id: null,
            last_sub_dt: null,
            responseCode: null,
            IS_SUB: "N",
            HAS_SERVICE: "N",
            HAS_GRACE: "N",
            message: "",
            callState: ""
        }

        const foundSubscriber = await Subscriber.findOne({ where: { msisdn: msisdn } });
        const foundDistrict = await District.findOne({
            where: {
                id: K_ZAMINDAR.DEFAULT_DISTRICT
            }
        });

        if (!foundSubscriber) {

            const foundSubscriberUnsub = await SubscriberUnsub.findOne({ where: { msisdn: msisdn } });

            if (foundSubscriberUnsub) {

                // Returning User Subscription
                const t = await sequelize.transaction();

                await Subscriber.create({
                    msisdn: msisdn,
                    district: foundSubscriberUnsub.district,
                    province: foundSubscriberUnsub.province,
                    tehsil: foundSubscriberUnsub.tehsil,
                    lat: foundSubscriberUnsub.lat,
                    lng: foundSubscriberUnsub.lng,
                    subscriberName: foundSubscriberUnsub.subscriberName,
                    crop: foundSubscriberUnsub.crop,
                    language: foundSubscriberUnsub.language,
                    subMode: subMode,
                    bcMode: foundSubscriberUnsub.bcMode,
                    alertType: foundSubscriberUnsub.alertType,
                    hasConsented: foundSubscriberUnsub.hasConsented,
                    serviceId: serviceId || K_ZAMINDAR.DEFAULT_SERVICE_ID,
                    status: 100,
                    lastUnsubDateTime: foundSubscriberUnsub.lastUnsubDateTime,
                    lastChargeDateTime: foundSubscriberUnsub.lastChargeDateTime,
                    lastCallDateTime: new Date(),
                    firstSubDateTime: foundSubscriberUnsub.firstSubDateTime,
                    lastSubDateTime: new Date(),
                    chargeAttemptDateTime: foundSubscriberUnsub.chargeAttemptDateTime,
                    nextChargeDateTime: foundSubscriberUnsub.nextChargeDateTime,
                    graceExpireDateTime: foundSubscriberUnsub.graceExpireDateTime,
                    chargeCount: foundSubscriberUnsub.chargeCount,
                    lastObdDt: foundSubscriberUnsub.lastObdDt

                }, { transaction: t });

                await SubscriberProfile.upsert({
                    msisdn: msisdn,
                    gender: foundSubscriberUnsub.gender,
                    occupation: foundSubscriberUnsub.occupation,
                    village: foundSubscriberUnsub.village,
                    landSize: foundSubscriberUnsub.landSize,
                    landUnit: foundSubscriberUnsub.landUnit,
                    comment: foundSubscriberUnsub.comment
                }, { transaction: t });

                await SubscriberStats.upsert({
                    msisdn: msisdn,
                    lastUpdateDateTime: new Date(),
                    lastUpdatedBy: null,
                    moCall: 0
                }, { transaction: t });

                await SubscriberDailyUsageStats.upsert({
                    msisdn: msisdn,
                    usageDate: new Date(),
                    subscriptionDateTime: new Date(),
                    moSms: 1,
                    mtSms: 1,
                    province: foundSubscriberUnsub.province
                }, { transaction: t });

                await t.commit();

                updateLocation(msisdn, true);

                response.IS_RETURNING_USER = "100";
                response.HAS_LOCATION = "100";
                response.cellno = msisdn;
                response.sub_mode = subMode;
                response.province = foundSubscriberUnsub.province;
                response.district = foundSubscriberUnsub.district;
                response.tehsil = foundSubscriberUnsub.tehsil;
                response.lat = foundSubscriberUnsub.lat;
                response.lng = foundSubscriberUnsub.lng;
                response.lang = foundSubscriberUnsub.language;
                response.srvc_id = foundSubscriberUnsub.crop;
                response.last_sub_dt = format(new Date(), "yyyy-MM-dd HH:mm:ss");
                response.responseCode = 100;
                response.IS_SUB = "R";
                response.message = "Successfully subscribed to this service."

                // Checking user service status
                if (foundSubscriberUnsub.nextChargeDateTime) {
                    // const lastChargeTime = new Date(foundSubscriberUnsub.lastChargeDateTime);
                    const nextChargeTime = new Date(foundSubscriberUnsub.nextChargeDateTime);

                    if (nextChargeTime >= (new Date())) {
                        response.HAS_SERVICE = "Y";
                    } else {
                        response.HAS_SERVICE = "N";
                    }
                } else {
                    response.HAS_SERVICE = "N";
                }

                // Checking User Grace
                if (foundSubscriberUnsub.graceExpireDateTime) {
                    const graceTime = format(foundSubscriberUnsub.graceExpireDateTime, "yyyy-MM-dd");
                    const { hasGrace } = (await sequelize.query(`SELECT CURRENT_DATE <= DATE("${graceTime}") as hasGrace`, { type: QueryTypes.SELECT }))[0];

                    if (hasGrace) {
                        response.HAS_GRACE = "Y";
                    } else {
                        // const foundBalance = await checkBalanceStatus(msisdn);
                        // if (foundBalance) {
                        //     response.HAS_GRACE = "Y";
                        // } else {
                        //     response.HAS_GRACE = "N";
                        // }
                        response.HAS_GRACE = "N";
                    }
                } else {
                    response.HAS_GRACE = "N";
                }

                let serviceDetails = await Service.findOne({ where: { id: serviceId } });
                if (response.next_charge_dt == null) {
                    console.log(`Charge date null user ${msisdn} true`);
                    let callCondition = await tpService.chargeUser(msisdn, serviceDetails);
                    console.log(`callCondition.throughUser ${callCondition.throughUser}`);
                    response.callState = callCondition.throughUser;
                }
                if (response.next_charge_dt) {
                    let NCD = moment(response.next_charge_dt).format(`YYYY-MM-DD`);
                    let today = moment().format(`YYYY-MM-DD`);
                    console.log(`${msisdn} :::::::::::: NCD ${NCD} :::::::::::::::: today ${today}`);
                    if (moment(NCD).isSameOrBefore(today)) {
                        console.log(`Charge user ${msisdn} true`);
                        let callCondition = await tpService.chargeUser(msisdn, serviceDetails);
                        console.log(`callCondition.throughUser ${callCondition.throughUser}`);
                        response.callState = callCondition.throughUser;
                    }
                }

                return response;
            } else {

                // Setting Grace Period

                let graceTime = format(addDays(new Date(), K_ZAMINDAR.GRACE_INTERVAL_NEW_USER), 'yyyy-MM-dd hh:mm:ss zzzz', { locale: enUS });

                console.log("<<<<<NEW USER WITH GRACE: ", graceTime, ">>>>>");

                // New User Subscription
                const t = await sequelize.transaction();

                await Subscriber.create({
                    msisdn: msisdn,
                    district: K_ZAMINDAR.DEFAULT_DISTRICT,
                    province: K_ZAMINDAR.DEFAULT_PROVINCE,
                    tehsil: K_ZAMINDAR.DEFAULT_TEHSIL,
                    lat: K_ZAMINDAR.DEFAULT_LAT,
                    lng: K_ZAMINDAR.DEFAULT_LNG,
                    subscriberName: K_ZAMINDAR.DEFAULT_SUB_NAME,
                    crop: foundDistrict.defaultCropId || null,
                    language: K_ZAMINDAR.DEFAULT_LANGUAGE || null,
                    subMode: subMode,
                    bcMode: K_ZAMINDAR.DEFAULT_PROFILE_BC_MODE,
                    alertType: K_ZAMINDAR.DEFAULT_PROFILE_ALERT_TYPE,
                    hasConsented: K_ZAMINDAR.DEFAULT_HAS_CONSENTED,
                    serviceId: serviceId || K_ZAMINDAR.DEFAULT_SERVICE_ID,
                    status: 100,
                    firstSubDateTime: new Date(),
                    lastSubDateTime: new Date(),
                    graceExpireDateTime: graceTime,
                    chargeCount: 0
                }, { transaction: t });

                await SubscriberProfile.upsert({
                    msisdn: msisdn,
                    gender: K_ZAMINDAR.DEFAULT_GENDER,
                    occupation: K_ZAMINDAR.DEFAULT_OCCUPATION,
                    village: K_ZAMINDAR.DEFAULT_VILLAGE,
                    landSize: K_ZAMINDAR.DEFAULT_LAND_SIZE,
                    landUnit: K_ZAMINDAR.DEFAULT_LAND_UNIT,
                    comment: K_ZAMINDAR.DEFAULT_COMMENT
                }, { transaction: t });

                await SubscriberStats.upsert({
                    msisdn: msisdn,
                    lastUpdateDateTime: new Date(),
                    lastUpdatedBy: null,
                    moCall: 0
                }, { transaction: t });

                await SubscriberDailyUsageStats.upsert({
                    msisdn: msisdn,
                    usageDate: new Date(),
                    subscriptionDateTime: new Date(),
                    moSms: 1,
                    mtSms: 1,
                    province: K_ZAMINDAR.DEFAULT_PROVINCE || null
                }, { transaction: t });

                await t.commit();

                updateLocation(msisdn, true);

                response.IS_RETURNING_USER = "-100";
                response.HAS_LOCATION = K_ZAMINDAR.DEFAULT_HAS_LOCATION;
                response.cellno = msisdn;
                response.sub_mode = subMode;
                response.province = K_ZAMINDAR.DEFAULT_PROVINCE;
                response.district = K_ZAMINDAR.DEFAULT_DISTRICT;
                response.tehsil = K_ZAMINDAR.DEFAULT_TEHSIL;
                response.lat = K_ZAMINDAR.DEFAULT_LAT;
                response.lng = K_ZAMINDAR.DEFAULT_LNG;
                response.lang = K_ZAMINDAR.DEFAULT_LANGUAGE || null;
                response.srvc_id = foundDistrict.defaultCropId || null;
                response.last_sub_dt = format(new Date(), "yyyy-MM-dd HH:mm:ss");
                response.responseCode = 100;
                response.IS_SUB = "Y";
                response.message = "Successfully subscribed to this service."

                let serviceDetails = await Service.findOne({ where: { id: serviceId } });
                let callCondition = await tpService.chargeUser(msisdn, serviceDetails);
                console.log(`Charging for new user ${msisdn} true ::::::::::: callCondition ${callCondition.throughUser}`);
                response.callState = callCondition.throughUser;

                return response;
            }

        } else {
            response.province = foundSubscriber.province;
            response.district = foundSubscriber.district;
            response.tehsil = foundSubscriber.tehsil;
            response.lat = foundSubscriber.lat;
            response.lng = foundSubscriber.lng;
            response.lang = foundSubscriber.language;
            response.IS_SUB = "Y";
            response.HAS_SERVICE = "N";
            response.HAS_GRACE = "Y";
            response.responseCode = 100;
            response.message = "Already subscribed to the service";

            if (foundSubscriber.nextChargeDateTime) {
                // const lastChargeTime = new Date(foundSubscriber.lastChargeDateTime);
                const nextChargeTime = new Date(foundSubscriber.nextChargeDateTime);

                if (nextChargeTime >= (new Date())) {
                    response.HAS_SERVICE = "Y";
                } else {
                    response.HAS_SERVICE = "N";
                }
            } else {
                response.HAS_SERVICE = "N";
            }

            alreadySubSms(msisdn);

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

async function unsubscribe(msisdn, unSubMode) {

    try {

        let response = {
            responseCode: null,
            cellno: null,
            unsub_mode: null,
            IS_SUB: null,
            message: null
        }

        const foundSubscriber = await Subscriber.findOne({ where: { msisdn: msisdn } });

        if (!foundSubscriber) {

            response.responseCode = 100;
            response.message = "User is not an active subscriber, unable to unsubscribe.";
            response.cellno = msisdn;
            response.unsub_mode = unSubMode;
            response.IS_SUB = "N";

            //notSubSms(msisdn);
            return response;

        } else {
            let currentTime = new Date();
            currentTime.setHours(currentTime.getHours() + 5);

            const foundSubscriberProfile = await SubscriberProfile.findOne({ where: { msisdn: msisdn } });
            const foundSubscriberStats = await SubscriberStats.findOne({ where: { msisdn: msisdn } });

            const t = await sequelize.transaction();

            await SubscriberUnsub.upsert({
                msisdn,
                tehsil: foundSubscriber.tehsil || null,
                district: foundSubscriber.district || null,
                province: foundSubscriber.province || null,
                lat: foundSubscriber.lat,
                lng: foundSubscriber.lng,
                crop: foundSubscriber.crop || null,
                language: foundSubscriber.language || null,
                subscriberName: foundSubscriber.subscriberName || null,
                firstSubDateTime: foundSubscriber.firstSubDateTime || null,
                lastSubDateTime: foundSubscriber.lastSubDateTime || null,
                lastUnsubDateTime: new Date(),
                subMode: foundSubscriber.subMode || null,
                bcMode: foundSubscriber.bcMode || null,
                lastCallDateTime: foundSubscriberStats ? foundSubscriberStats.lastCallDateTime : null,
                lastUpdateDateTime: foundSubscriberStats ? foundSubscriberStats.lastUpdateDateTime : null,
                lastUpdatedBy: foundSubscriberStats ? foundSubscriberStats.lastUpdatedBy : null,
                moCall: foundSubscriberStats ? foundSubscriberStats.moCall : null,
                mtCall: foundSubscriberStats ? foundSubscriberStats.mtCall : null,
                moSms: foundSubscriberStats ? foundSubscriberStats.moSms : null,
                mtSms: foundSubscriberStats ? foundSubscriberStats.mtSms : null,
                gender: foundSubscriberProfile ? foundSubscriberProfile.gender : null,
                occupation: foundSubscriberProfile ? foundSubscriberProfile.occupation : null,
                village: foundSubscriberProfile ? foundSubscriberProfile.village : null,
                landSize: foundSubscriberProfile ? foundSubscriberProfile.landSize : null,
                landUnit: foundSubscriberProfile ? foundSubscriberProfile.landUnit : null,
                comment: foundSubscriberProfile ? foundSubscriberProfile.comment : null,
                datetime: new Date(),
                unsubMode: unSubMode,
                alertType: foundSubscriber.alertType || null,
                hasConsented: foundSubscriber.hasConsented || null,
                hasSelectedLocation: foundSubscriber.hasSelectedLocation || null,
                chargeAttemptDateTime: foundSubscriber.chargeAttemptDateTime || null,
                nextChargeDateTime: foundSubscriber.nextChargeDateTime || null,
                graceExpireDateTime: foundSubscriber.graceExpireDateTime || null,
                serviceId: foundSubscriber.serviceId || null,
                lastChargeDateTime: foundSubscriber.lastChargeDateTime,
                chargeCount: foundSubscriber.chargeCount,
                lastObdDt: foundSubscriber.lastObdDt

            }, { returning: true, transaction: t });

            await Subscriber.destroy({ where: { msisdn: msisdn }, transaction: t });
            await SubscriberProfile.destroy({ where: { msisdn: msisdn }, transaction: t });
            await SubscriberStats.destroy({ where: { msisdn: msisdn }, transaction: t });

            await t.commit();

            // await HelpRequest.update({
            //     status: 900
            // }, {
            //     where: {
            //         msisdn: msisdn,
            //         status: { [Op.ne]: 100 }
            //     },
            // });

            sendUnSubscriptionSms(msisdn, foundSubscriber.province || "")

            return {
                responseCode: 100,
                message: "Successfully unsubscribed from service.",
                cellno: msisdn,
                unsub_mode: unSubMode,
                IS_SUB: "Y",
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


async function updateLocation(msisdn, newSub = false) {
    console.log("<===========================Fetching Location===========================>");

    let msisdnFormated = String(msisdn);

    if (msisdnFormated.length < 11) {
        return false;
    }

    if (msisdn.length == 11) {
        msisdnFormated = `92${msisdn.substring(1)}`;
    } else if (msisdn.length == 10) {
        msisdnFormated = `92${msisdn}`;
    }

    const result = await locationService.getLocationByMsisdn(msisdnFormated);

    let data = result ? result.data : null;

    let locInfo = null;

    if (data && Array.isArray(data)) {
        locInfo = data[0];
    }

    let foundProvince = null;
    let foundDistrict = null;
    let foundTehsil = null;

    if (locInfo) {
        const foundProvinceTpId = getProvinceTpId(locInfo.PROVINCE);
        foundProvince = await Province.findOne({ where: { tpId: foundProvinceTpId } });

        if (foundProvince) {
            foundDistrict = await District.findOne({ where: { tpId: locInfo.DISTRICT } });
            foundTehsil = await Tehsil.findOne({ where: { tpId: locInfo.TEHSIL } });
        }

    }

    const lat = locInfo ? locInfo.LATE : 0.0;
    const lng = locInfo ? locInfo.LONGITUDE : 0.0;

    if (lat > 0 && lng > 0) {
        await Subscriber.update({
            lat: lat,
            lng: lng,
            province: foundProvince ? foundProvince.id : "punjab",
            district: foundDistrict ? foundDistrict.id : "unknown2",
            tehsil: foundTehsil ? foundTehsil.id : "unknown2",
            language: foundProvince ? foundProvince.defaultLanguage : 'urdu'
        }, {
            where: { msisdn: msisdn }
        });

        if (newSub) {
            if (foundProvince) {
                sendSubscriptionSms(msisdn, foundProvince.id || "");
            } else {
                sendSubscriptionSms(msisdn, "");
            }
        }
    }

    console.log("<===========================Location Updated===========================>");

    return true;

}


function getProvinceTpId(value) {
    const punjabValues = ['Federal Capital Territory', 'FEDERAL CAPITAL', 'PUNJAB'];
    const sindhValues = ['SINDH'];
    const kpkValues = ['NWFP', 'kpk', 'Khyber Pakhtunkhwa', 'FATA'];
    const gbValues = ['gb', 'NORTHERN AREAS']

    if (punjabValues.indexOf(value) >= 0) {
        return "PUNJAB"
    } else if (sindhValues.indexOf(value) >= 0) {
        return "SINDH"
    } else if (kpkValues.indexOf(value) >= 0) {
        return "KPK"
    } else if (gbValues.indexOf(value) >= 0) {
        return "GB"
    } else {
        return "unknown";
    }
}

async function updateProfile(msisdn, crop, language, subscriberName, occupation, province, district, tehsil, village, landSize, landUnit, alertType, bcMode, comment) {

    const langProvinceWise = {
        sindh: ['sindhi', 'urdu'],
        gb: ['urdu'],
        kpk: ['pashto', 'urdu'],
        punjab: ['punjabi', 'saraiki', 'urdu']
    }

    const foundSubscriber = await Subscriber.findOne({
        where: { msisdn: msisdn }
    });

    if (!foundSubscriber) {
        return {
            responseCode: 200,
            message: "Subscriber not found"
        }
    }

    let data = {};

    if (crop) {
        data.crop = crop;
    }

    if (subscriberName) {
        data.subscriberName = subscriberName;
    }

    if (province) {
        if (district && tehsil) {
            if (language) {
                const allowedLang = langProvinceWise[String(province).toLowerCase()];
                if (allowedLang && allowedLang.length > 0) {
                    if (allowedLang.indexOf(String(language).toLowerCase()) >= 0) {
                        data.language = language;
                        data.province = province;
                        data.district = district;
                        data.tehsil = tehsil;
                        const foundTehsil = await Tehsil.findOne({ where: { id: tehsil } });
                        if (foundTehsil) {
                            data.lat = foundTehsil.lat;
                            data.lng = foundTehsil.lng;
                        }
                    }
                }
            }
        }

    } else if (district) {
        if (tehsil) {
            data.district = district;
            data.tehsil = tehsil;
            const foundTehsil = await Tehsil.findOne({ where: { id: tehsil } });
            if (foundTehsil) {
                data.lat = foundTehsil.lat;
                data.lng = foundTehsil.lng;
            }

            if (language) {
                const allowedLang = langProvinceWise[String(foundSubscriber.language).toLowerCase()];
                if (allowedLang && allowedLang.length > 0) {
                    if (allowedLang.indexOf(String(language).toLowerCase()) >= 0) {
                        data.language = language;
                    }
                }
            }
        }
    } else if (tehsil) {
        data.tehsil = tehsil;
        const foundTehsil = await Tehsil.findOne({ where: { id: tehsil } });
        if (foundTehsil) {
            data.lat = foundTehsil.lat;
            data.lng = foundTehsil.lng;
        }
        if (language) {
            const allowedLang = langProvinceWise[String(foundSubscriber.language).toLowerCase()];
            if (allowedLang && allowedLang.length > 0) {
                if (allowedLang.indexOf(String(language).toLowerCase()) >= 0) {
                    data.language = language;
                }
            }
        }
    } else if (language) {
        const allowedLang = langProvinceWise[String(foundSubscriber.language).toLowerCase()];
        if (allowedLang && allowedLang.length > 0) {
            if (allowedLang.indexOf(String(language).toLowerCase()) >= 0) {
                data.language = language;
            }
        }
    }

    if (alertType) {
        data.alertType = alertType;
    }

    if (bcMode) {
        data.bcMode = bcMode;
    }

console.log ("==>", data);

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

    let subId = "punjab_sub_conf_without_location";
    let extendedCodeId = "punjab_sub_extended_code_list";

    if (location == "gb") {
        subId = "gb_sub_conf_without_location";
        extendedCodeId = "gb_sub_extended_code_list"
    }

    const foundSubContent = await SmsContent.findOne({
        where: {
            id: subId,
            language: "urdu"
        }
    });

    await sendSms(msisdn, foundSubContent.content, 7272);

    // const foundExtendedCodeContent = await SmsContent.findOne({
    //     where: {
    //         id: extendedCodeId,
    //         language: "urdu"
    //     }
    // });

    // await sendSms(msisdn, foundExtendedCodeContent.content, 7272);



}

async function alreadySubSms(msisdn) {
    const content = "آپ کے نمبر پر یہ سروس پہلے سے لگی ہوئی ہے،شکریہ";
    await sendSms(msisdn, content, 7272);
}

async function notSubSms(msisdn) {
    const content = "آپ کے نمبر پر یہ سروس موجود نہیں، سروس حاصل کرنے کے لیے sub لکھ کر اسی نمبر پر بھیجیں، یا 7272 ملا کر 1 کا بٹن دبائیں۔ شکریہ";
    await sendSms(msisdn, content, 7272);
}

async function sendUnSubscriptionSms(msisdn, location) {
    let id = "punjab_unsub";

    if (location == "gb") {
        id = "gb_unsub";
    }

    if (id) {
        const foundContent = await SmsContent.findOne({
            where: {
                id: id,
                language: "urdu"
            }
        });

        sendSms(msisdn, foundContent.content, 7272);
    }
}

function formateInTimezone(date, formateType) {

    return format(addMinutes(new Date(date), new Date().getTimezoneOffset()), formateType);

}


module.exports = {
    getSubscriberDetail,
    unsubscribe,
    subscribe,
    updateProfile,
    sendUnSubscriptionSms
}

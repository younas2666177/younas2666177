function isMsisdnValid(msisdn) {
    msisdn = String(msisdn);

    if (msisdn.length !== 11) {
        return {
            success: false,
            message: "Length of msisdn should be 11."
        }
    }

    if (!msisdn.startsWith("0")) {
        return {
            success: false,
            message: "Msisdn should start with '0'"
        }
    }

    return {
        success: true,
        message: "Valid!"
    }

}

function isServiceIdValid (serviceId) {
    serviceId = Number(serviceId);

    if (isNaN(serviceId)) {
        return {
            success: false,
            message: "serviceId is not a number"
        }
    }

    return {
        success: true,
        message: "serviceId is Valid",
        data: {
            serviceId
        }
    }
}


module.exports = {
    isMsisdnValid,
    isServiceIdValid
}
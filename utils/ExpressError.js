class ExpressError extends Error {
    constructor(message, statusCode) {
        super()    //calls the Error class
        this.message = message
        this.statusCode = statusCode
    }
}

module.exports = ExpressError
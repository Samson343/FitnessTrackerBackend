
async function isAuthorized(req, res, next) {
    if (!req.user) {
        res.status(401).send({
            error: "NotAthorized",
            message: "You must be logged in to perform this action",
            name: "notLoggedIn"
        })
    }
    next()
}

module.exports = {
    isAuthorized
}
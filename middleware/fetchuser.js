const jwt = require('jsonwebtoken')

const SECRET = "singhisking"

const fetchuser = (req, res, next) => {
    try {
        // Get the token from the request header and check if the token exists
        let token = req.header('auth-token')
        if (!token) {
            res.status(401).json({error: "Invalid request token!"})
        }

        const data = jwt.verify(token, SECRET)
        req.user = data.user
        next()
    } catch (error) {
        res.status(401).json({error: "Invalid request token!"})
    }
}

module.exports = fetchuser
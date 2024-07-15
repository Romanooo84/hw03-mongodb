const passport = require('passport');

const authMiddleware = (req, res, next) => {
    passport.authenticate(
        'jwt',
        {
            sesion: false,
        },
        (err, user) => {
            if (!user || err) {
               return res.status(401)
                   .json({message: 'Unuthorize'})
            }
            res.locals.user = user
            next()
        }
    )(req, res, next)
}

module.exports=authMiddleware
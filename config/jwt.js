const passport = require('passport');
const { ExtractJwt, Strategy: JWTStrategy } = require('passport-jwt')
const { Users } = require('../models/models')


const setJWTStrategy = () => {
    const secret = process.env.SECRET;
    

    const params = {
    secretOrKey: secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};
    passport.use(
        new JWTStrategy(
            params,
            async function (payload, done) {
                try {
                    const user = await Users.findOne({
                        _id: payload.id
                    }).lean()

                    if (!user) {
                        return done(new Error('User not found'))
                    } else if (user.token == null) {
                        return done(new Error('Plese log in'))
                    }

                    return done(null, user)
                } catch (e){
                    return done (e)
                }
            }
        )
    )
}

module.exports = setJWTStrategy;



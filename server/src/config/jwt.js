import jwt from 'jsonwebtoken'

export const TOKEN_SECRET = process.env.JWT_SECRET || "dev_secret_key_DO_NOT_USE_IN_PROD";
export function creatAccesToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            TOKEN_SECRET,
            {
                expiresIn:"1d",
            },
            (err,token) => {
                if (err) reject(err)
                resolve(token)
            }
            );
    });
}


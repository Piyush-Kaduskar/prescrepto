import jwt from 'jsonwebtoken'
export const authDoctor = async (req, res, next) => {
    try {
        const { dtoken } = req.headers;
        if (!dtoken) {
            return res.json({
                success: false,
                message: 'Not Authorized login again'
            })
        }
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);
        req.user = { id: token_decode.id };
       
        next();

    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: error.message
        })

    }
}
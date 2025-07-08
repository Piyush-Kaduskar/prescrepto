import jwt from 'jsonwebtoken'
export const authUser = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.json({
                success: false,
                message: 'Not Authorized login again'
            })
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
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
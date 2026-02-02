import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

        const user = await User.findById(decoded.id).populate('organization');

        if (!user) {
            return res.status(401).json({ success: false, message: 'User no longer exists' });
        }

        (req as any).user = user;

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = (req as any).user.role;
        if (!roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `User role ${userRole} is not authorized to access this route`,
            });
        }
        next();
    };
};

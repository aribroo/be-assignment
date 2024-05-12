import jwt from "jsonwebtoken";

class TokenUtil {
  static generateToken(payload: any): string {
    return jwt.sign(payload, process.env.SECRET_KEY as string, {
      algorithm: "HS256",
      expiresIn: "1d",
    });
  }

  static verifyToken(token: string): string | jwt.JwtPayload {
    return jwt.verify(token, process.env.SECRET_KEY as string, {
      algorithms: ["HS256"],
    });
  }
}

export default TokenUtil;

// // pages/api/auth/verify-token.ts
// import { NextApiRequest, NextApiResponse } from "next";
// import { verifyToken } from "@/utils/verifyToken";
// import { nc } from "next-connect";

// interface DecodedToken {
//   id: string;
//   email: string;
//   role?: string;
//   iat: number;
//   exp: number;
// }

// const handler = nc<NextApiRequest, NextApiResponse>({
//   onError(error: any, req: any, res: any) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   },
//   onNoMatch(req: any, res: any) {
//     res.status(405).json({ message: `Method ${req.method} Not Allowed` });
//   },
// });

// handler.post((req: any, res: any) => {
//   const { token } = req.body;

//   if (!token) {
//     return res.status(400).json({ message: "Token is required" });
//   }

//   const decoded = verifyToken(token);

//   if (!decoded) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }

//   return res.status(200).json({
//     message: "Token is valid",
//     user: {
//       id: decoded.id,
//       email: decoded.email,
//       role: decoded.role,
//     },
//   });
// });

// export default handler;

// // src/pages/api/upload.ts

// import type { NextApiRequest, NextApiResponse } from "next";
// import formidable from "formidable";
// import fs from "fs";
// import path from "path";

// export const config = {
//   api: {
//     bodyParser: false, // Disable built-in body parser to handle file uploads
//   },
// };

// const uploadDir = path.join(process.cwd(), "/public/uploads");

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method === "POST") {
//     const form = formidable({ multiples: true, uploadDir });

//     form.parse(req, (err:any, fields:any, files:any) => {
//       if (err) {
//         console.error("Error parsing the files", err);
//         res
//           .status(500)
//           .json({ status: "fail", message: "Error parsing the files" });
//         return;
//       }

//       // Process the uploaded files
//       const uploadedFiles: any = [];
//       const fileArray = Array.isArray(files.files)
//         ? files.files
//         : [files.files];

//       fileArray.forEach((file:any) => {
//         const tempPath = file.filepath;
//         const fileName = file.originalFilename;
//         const newPath = path.join(uploadDir, fileName);

//         fs.renameSync(tempPath, newPath);

//         uploadedFiles.push({
//           name: fileName,
//           path: `/uploads/${fileName}`, // Relative path to the file
//         });
//       });

//       res.status(200).json({ status: "success", files: uploadedFiles });
//     });
//   } else {
//     res.setHeader("Allow", "POST");
//     res.status(405).json({ status: "fail", message: "Method Not Allowed" });
//   }
// }

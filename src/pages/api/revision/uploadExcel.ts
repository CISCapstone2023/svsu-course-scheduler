import { NextConfig, type NextApiRequest, type NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "src/server/db";
import xlsx from "node-xlsx";
import multiparty from "multiparty";
import fs from "fs";
/**
 * UploadExcelFile
 *
 * Upload an excel file to the server
 * @param req
 * @param res
 */
const UploadExcelFile = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (session) {
    const form = new multiparty.Form();
    /*form.on("part", function (part) {
      if (part.filename) {
        console.log("Got chunk");
        const chunks: any = [];
        part.on("data", function (chunk) {
          chunks.push(chunk);
        });
        part.on("end", function () {
          console.log("end stream");
          const file = Buffer.concat(chunks);
          const workSheetsFromBuffer = xlsx.parse(file);
          console.log(workSheetsFromBuffer);
        });
      }
    });*/
    await form.parse(req, async (error, fields, file) => {
      const workSheetsFromBuffer = xlsx.parse(
        fs.readFileSync(file.file[0].path)
      );
      console.log(JSON.stringify(workSheetsFromBuffer));
      return;
    });
    res.status(200);
  } else {
    res.status(401);
  }
  res.end();
};

export const config: NextConfig = {
  api: {
    bodyParser: false,
  },
};

export default UploadExcelFile;

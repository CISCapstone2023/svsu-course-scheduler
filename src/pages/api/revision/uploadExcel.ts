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

    const [fields, files] = await promisifyUpload(req);

    if (
      files.file[0].headers["content-type"] ==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      files.file[0].headers["content-type"] == "application/vnd.ms-excel"
    ) {
      /*
      await prisma.scheduleRevision.create({
        data: {
          file: fs.readFileSync(files.file[0].path),
          name: "hello",
        },
      });*/

      const result = xlsx.parse(fs.readFileSync(files.file[0].path));
      console.log(result[0]?.data);
      //Return the data to the hook
      res.json({
        tuid: [],
        columns: result[0]?.data,
      });
    }
    res.status(401);
  } else {
    res.status(401);
  }
  res.end();
};

/**
 * promisifyUpload
 * Gets a file from the form and return it as an async
 * when read
 * @param req
 * @returns
 */
const promisifyUpload = (req: NextApiRequest) =>
  new Promise<[any, any]>((resolve, reject) => {
    const form = new multiparty.Form();

    form.parse(req, function (err, fields, files) {
      if (err) return reject(err);

      return resolve([fields, files]);
    });
  });

export const config: NextConfig = {
  api: {
    bodyParser: false,
  },
};

export default UploadExcelFile;

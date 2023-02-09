import { NextConfig, type NextApiRequest, type NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "src/server/db";
import xlsx from "node-xlsx";
import multiparty from "multiparty";
import fs from "fs";
import { number } from "zod";
/**
 * UploadExcelFile
 *
 * Upload an excel file to the server
 * @param req
 * @param res
 */
const UploadExcelFile = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (session && session.user) {
    const id = session.user?.id;

    const form = new multiparty.Form();

    const [fields, files] = await promisifyUpload(req);

    if (
      files.file[0].headers["content-type"] ==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      files.file[0].headers["content-type"] == "application/vnd.ms-excel"
    ) {
      const result = xlsx.parse(fs.readFileSync(files.file[0].path));
      if (result.length >= 1) {
        const revision = await prisma.scheduleRevision.create({
          data: {
            file: fs.readFileSync(files.file[0].path),
            name: "test",
            user: {
              connect: {
                id: id,
              },
            },
          },
        });

        //console.log(result[0]?.data);
        if (result[0] != undefined) {
          // console.log("inside if statement");
          // const transposed = (result[0].data[0] as any).map(
          //   (_: any, colIndex: number) =>
          //     (result[0]?.data as any).map((row: any) => row[colIndex])
          // );
          // console.log(transposed);

          res.json({
            tuid: revision.tuid,
            table: result[0]?.data,
          });
        }
      }
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

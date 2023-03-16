import { NextConfig, type NextApiRequest, type NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "src/server/db";
import xlsx from "node-xlsx";
import multiparty from "multiparty";
import fs from "fs";
import { number } from "zod";
import stream, { Readable } from "stream";
import { promisify } from "util";

const pipeline = promisify(stream.pipeline);
//make interface for data
type ExcelDataColumns = Array<Array<string | undefined>>;
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

    //Grab the revision tuid by the query param like so

    // <HOST>/api/revision/<id>/downloadReport
    const revisionTuid = req.query.revisionTuid as string;

    //Query the revision
    const revision = await prisma.scheduleRevision.findUnique({
      where: {
        tuid: revisionTuid,
      },
      select: {
        name: true,
        exported_file: true,
        file: true,
      },
    });

    //Check if the revision is not null
    if (revision != undefined) {
      //Check if we have the file to be exported.
      if (revision.exported_file == null) {
        return res.status(200).json({
          status: "error",
          msg: "File does not exist",
        });
      }

      //const manifestBuffer = fs.createReadStream(revision.exported_file);

      //Set the header type of the excel file, which is not a normal office
      //docx file but again it still works fine
      try {
        res.setHeader("Content-Type", "application/vnd.ms-excel");

        //Generate the file from a buffer and call it a day
        await pipeline(Readable.from(revision.exported_file), res);
      } catch {
        res.status(500).json({
          error: "error",
          message: "Sorry, something went wrong!",
        });
        res.end();
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

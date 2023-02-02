import { NextConfig, type NextApiRequest, type NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import formidable from "formidable";
import multiparty from "multiparty";
/**
 * UploadExcelFile
 *
 * Upload an excel file to the server
 * @param req
 * @param res
 */
const UploadExcelFile = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req.headers);
  const session = await unstable_getServerSession(req, res, authOptions);
  if (session) {
    console.log("Signed in");
    const form = new multiparty.Form();

    await form.parse(req, (error, fields, file) => {
      console.log(error);
      console.log(fields);
      console.log(file);
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

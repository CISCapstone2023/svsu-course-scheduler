import { NextConfig, type NextApiRequest, type NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import formidable from "formidable";
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
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      console.log(err, fields, files);
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

import {
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import fs from "fs";
import { s3client } from "./s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const { S3_BUCKET } = process.env;

export const uploadFile = async (
  name: string,
  path: string,
  contentType?: string
) => {
  const fileStream = fs.createReadStream(path);
  const putParams: PutObjectCommandInput = {
    Bucket: S3_BUCKET,
    Key: name,
    Body: fileStream,
    ContentType: contentType,
  };
  const command = new PutObjectCommand(putParams);
  return s3client.send(command);
};

export const getFileUrl = async (name: string) => {
  const getParams: GetObjectCommandInput = {
    Bucket: S3_BUCKET,
    Key: name,
  };
  return getSignedUrl(s3client, new GetObjectCommand(getParams), {
    expiresIn: 15 * 60,
  });
};

export const deleteFile = async (name: string) => {
  const deleteParams: DeleteObjectCommandInput = {
    Bucket: S3_BUCKET,
    Key: name,
  };
  const command = new DeleteObjectCommand(deleteParams);
  return s3client.send(command);
};

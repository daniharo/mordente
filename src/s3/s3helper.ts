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

export const uploadFile = async (name: string, path: string) => {
  const fileStream = fs.createReadStream(path);
  const putParams: PutObjectCommandInput = {
    Bucket: "mordente",
    Key: name,
    Body: fileStream,
  };
  const command = new PutObjectCommand(putParams);
  return s3client.send(command);
};

export const getFileUrl = async (name: string) => {
  const getParams: GetObjectCommandInput = {
    Bucket: "mordente",
    Key: name,
  };
  return getSignedUrl(s3client, new GetObjectCommand(getParams), {
    expiresIn: 15 * 60,
  });
};

export const deleteFile = async (name: string) => {
  const deleteParams: DeleteObjectCommandInput = {
    Bucket: "mordente",
    Key: name,
  };
  const command = new DeleteObjectCommand(deleteParams);
  return s3client.send(command);
};

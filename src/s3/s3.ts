import { S3Client } from "@aws-sdk/client-s3";

const { S3_ENDPOINT } = process.env;

export const s3client = new S3Client({
  forcePathStyle: false,
  region: "us-east-1",
  endpoint: S3_ENDPOINT,
  credentials: {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    accessKeyId: process.env.S3_KEY!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    secretAccessKey: process.env.S3_SECRET!,
  },
});

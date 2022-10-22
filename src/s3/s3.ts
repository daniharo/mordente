import { S3Client } from "@aws-sdk/client-s3";

export const s3client = new S3Client({
  forcePathStyle: false,
  region: "us-east-1",
  endpoint: "https://fra1.digitaloceanspaces.com",
  credentials: {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    accessKeyId: process.env.SPACES_KEY!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    secretAccessKey: process.env.SPACES_SECRET!,
  },
});

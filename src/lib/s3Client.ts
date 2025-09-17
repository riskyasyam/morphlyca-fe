import { S3Client } from "@aws-sdk/client-s3";


export function getS3Client() {
  const endpoint = process.env.S3_ENDPOINT!;
  const region = process.env.S3_REGION ?? "us-east-1";
  const forcePathStyle = String(process.env.S3_FORCE_PATH_STYLE ?? "true") === "true";
  const accessKeyId = process.env.S3_ACCESS_KEY!;
  const secretAccessKey = process.env.S3_SECRET_KEY!;

  return new S3Client({
    region,
    endpoint,
    forcePathStyle,
    credentials: { accessKeyId, secretAccessKey },
  });
}

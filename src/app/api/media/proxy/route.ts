import { NextRequest } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client } from "@/lib/s3Client";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const p = url.searchParams.get("p"); // format: "<bucket>/<key...>"
  if (!p) return new Response("Missing p", { status: 400 });

  const [bucket, ...parts] = p.split("/");
  const key = parts.join("/");
  if (!bucket || !key) return new Response("Invalid p", { status: 400 });

  const client = getS3Client();

  // Signed URL untuk streaming inline
  const signed = await getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      // Opsi override mime kalau perlu:
      // ResponseContentType: "video/mp4",
    }),
    { expiresIn: 60 } // 60 detik cukup; boleh dinaikkan
  );

  // Redirect 302 ke signed URL MinIO
  return Response.redirect(signed, 302);
}

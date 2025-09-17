import { NextRequest } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client } from "@/lib/s3Client";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const p = url.searchParams.get("p"); // "<bucket>/<key...>"
  const filename = url.searchParams.get("filename") || "download";
  if (!p) return new Response("Missing p", { status: 400 });

  const [bucket, ...parts] = p.split("/");
  const key = parts.join("/");
  if (!bucket || !key) return new Response("Invalid p", { status: 400 });

  const client = getS3Client();

  // Kita pakai signed URL juga, tapi override jadi attachment
  const signed = await getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${filename}"`,
      // ResponseContentType: "application/octet-stream", // opsional
    }),
    { expiresIn: 60 }
  );

  return Response.redirect(signed, 302);
}

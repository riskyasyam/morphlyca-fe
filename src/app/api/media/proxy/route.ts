import { NextRequest } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client } from "@/lib/s3Client";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const p = url.searchParams.get("p"); // format: "<bucket>/<key...>"
    if (!p) return new Response("Missing p", { status: 400 });

    const [bucket, ...parts] = p.split("/");
    const key = parts.join("/");
    if (!bucket || !key) return new Response("Invalid p", { status: 400 });

    const client = getS3Client();

    // Get object directly and stream it
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await client.send(command);
    
    if (!response.Body) {
      return new Response("File not found", { status: 404 });
    }

    // Convert stream to array buffer
    const chunks = [];
    const reader = response.Body.transformToWebStream().getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const arrayBuffer = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    );
    
    let offset = 0;
    for (const chunk of chunks) {
      arrayBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    // Return the file with proper headers
    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': response.ContentType || 'application/octet-stream',
        'Content-Length': response.ContentLength?.toString() || '',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Media proxy error:', error);
    return new Response(`Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}

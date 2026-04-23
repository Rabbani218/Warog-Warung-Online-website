import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { subscribeKotUpdate } from "@/lib/kot-events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive"
  };
}

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const write = (event, payload) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      write("connected", { ok: true, at: Date.now() });

      const unsubscribe = subscribeKotUpdate((payload) => {
        write("kot-update", payload);
      });

      const heartbeat = setInterval(() => {
        write("heartbeat", { t: Date.now() });
      }, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    }
  });

  return new Response(stream, { headers: sseHeaders() });
}

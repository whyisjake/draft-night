import { addSubscriber, removeSubscriber } from '@/lib/events';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;

  const stream = new ReadableStream({
    start(controller) {
      const subscriber = addSubscriber(id, controller);

      // Send initial connection message
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode('event: connected\ndata: {}\n\n'));

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        removeSubscriber(subscriber);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

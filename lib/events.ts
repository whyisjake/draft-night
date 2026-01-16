type Subscriber = {
  controller: ReadableStreamDefaultController;
  draftId: string;
};

const subscribers: Map<string, Set<Subscriber>> = new Map();

export function addSubscriber(draftId: string, controller: ReadableStreamDefaultController): Subscriber {
  const subscriber: Subscriber = { controller, draftId };

  if (!subscribers.has(draftId)) {
    subscribers.set(draftId, new Set());
  }
  subscribers.get(draftId)!.add(subscriber);

  return subscriber;
}

export function removeSubscriber(subscriber: Subscriber): void {
  const draftSubscribers = subscribers.get(subscriber.draftId);
  if (draftSubscribers) {
    draftSubscribers.delete(subscriber);
    if (draftSubscribers.size === 0) {
      subscribers.delete(subscriber.draftId);
    }
  }
}

export function broadcast(draftId: string, eventType: string, data: unknown): void {
  const draftSubscribers = subscribers.get(draftId);
  if (!draftSubscribers) return;

  const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(message);

  const deadSubscribers: Subscriber[] = [];

  for (const subscriber of draftSubscribers) {
    try {
      subscriber.controller.enqueue(encoded);
    } catch {
      // Subscriber disconnected
      deadSubscribers.push(subscriber);
    }
  }

  // Clean up dead subscribers
  for (const dead of deadSubscribers) {
    draftSubscribers.delete(dead);
  }
}

export function getSubscriberCount(draftId: string): number {
  return subscribers.get(draftId)?.size ?? 0;
}

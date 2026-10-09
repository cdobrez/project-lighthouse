export const ORDER_FLOW: Record<string, string[]> = {
  pickup: ["placed", "accepted", "cooking", "ready", "picked_up"],
  dropoff: ["placed", "accepted", "cooking", "out_for_delivery", "delivered"],
  delivery: ["placed", "accepted", "cooking", "out_for_delivery", "delivered"],
};

export const STATUS_LABELS: Record<string, string> = {
  placed: "Order placed",
  accepted: "Cook accepted",
  cooking: "Cooking now",
  ready: "Ready for pickup",
  out_for_delivery: "On its way",
  delivered: "Delivered",
  picked_up: "Picked up",
  cancelled: "Cancelled",
};

export function nextStatus(fulfillment: string, status: string): string | null {
  const flow = ORDER_FLOW[fulfillment] ?? ORDER_FLOW.pickup;
  const i = flow.indexOf(status);
  return i >= 0 && i < flow.length - 1 ? flow[i + 1] : null;
}

export function isFinal(fulfillment: string, status: string): boolean {
  const flow = ORDER_FLOW[fulfillment] ?? ORDER_FLOW.pickup;
  return status === "cancelled" || flow[flow.length - 1] === status;
}

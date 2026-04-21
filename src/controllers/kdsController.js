const { orderEvents } = require("../utils/orderEvents");

function streamKdsOrders(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

  const handler = (payload) => {
    res.write(`data: ${JSON.stringify({ type: "order-updated", payload })}\n\n`);
  };

  orderEvents.on("order-updated", handler);

  req.on("close", () => {
    orderEvents.off("order-updated", handler);
  });
}

module.exports = { streamKdsOrders };

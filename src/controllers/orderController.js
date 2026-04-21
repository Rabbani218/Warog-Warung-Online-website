const { getAvailableMenus } = require("../models/menuModel");
const { getOrderQueue, getOrdersForAdmin } = require("../models/orderModel");
const { getInventoryList } = require("../models/inventoryModel");
const { getDashboardMetrics, getRecipeCatalog } = require("../models/dashboardModel");
const { createOrderWithAtomicStockDeduction, updateOrderStatus } = require("../services/orderService");
const { splitReceiptAndKotByOrderId } = require("../services/receiptKotService");
const { markTransactionPaid } = require("../services/transactionService");

async function listMenus(req, res, next) {
  try {
    const data = await getAvailableMenus();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function checkoutOrder(req, res, next) {
  try {
    const result = await createOrderWithAtomicStockDeduction({
      ...req.body,
      created_by: req.user?.id || null
    });
    res.status(201).json({ message: "Order berhasil dibuat.", data: result });
  } catch (error) {
    next(error);
  }
}

async function getReceiptAndKot(req, res, next) {
  try {
    const orderId = Number(req.params.orderId);
    const data = await splitReceiptAndKotByOrderId(orderId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function listAdminOrders(req, res, next) {
  try {
    const data = await getOrdersForAdmin();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function payOrder(req, res, next) {
  try {
    const orderId = Number(req.params.orderId);
    const data = await markTransactionPaid(orderId, {
      ...req.body,
      paid_by: req.user?.id || req.body.paid_by || null
    });
    res.status(200).json({ message: "Pembayaran berhasil diproses.", data });
  } catch (error) {
    next(error);
  }
}

async function listInventory(req, res, next) {
  try {
    const data = await getInventoryList();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function listKitchenQueue(req, res, next) {
  try {
    const data = await getOrderQueue();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function updateKitchenStatus(req, res, next) {
  try {
    const orderId = Number(req.params.orderId);
    const { status } = req.body;
    const data = await updateOrderStatus(orderId, status);
    res.status(200).json({ message: "Status pesanan diperbarui.", data });
  } catch (error) {
    next(error);
  }
}

async function getAdminDashboard(req, res, next) {
  try {
    const data = await getDashboardMetrics();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function listRecipes(req, res, next) {
  try {
    const data = await getRecipeCatalog();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listMenus,
  checkoutOrder,
  getReceiptAndKot,
  listAdminOrders,
  payOrder,
  listInventory,
  listKitchenQueue,
  updateKitchenStatus,
  getAdminDashboard,
  listRecipes
};

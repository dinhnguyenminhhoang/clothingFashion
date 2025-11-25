const { SuccessResponse, CREATED } = require("../core/success.response");
const { SummaryService } = require("../services/summary.service");

class SummaryController {
  getTotalSumary = async (req, res, next) => {
    new SuccessResponse({
      data: await SummaryService.getTotalSumary(),
    }).send(res);
  };
  getBrandSummary = async (req, res, next) => {
    const { type } = req.params;
    new SuccessResponse({
      data: await SummaryService.getBrandSummary(type),
    }).send(res);
  };
  getOrderSummary = async (req, res, next) => {
    const { type } = req.params;
    new SuccessResponse({
      data: await SummaryService.getOrderSummary(type),
    }).send(res);
  };
  getUserSummary = async (req, res, next) => {
    const { type } = req.params;
    new SuccessResponse({
      data: await SummaryService.getUserSummary(type),
    }).send(res);
  };
  getProductSummary = async (req, res, next) => {
    const { type } = req.params;
    new SuccessResponse({
      data: await SummaryService.getProductSummary(type),
    }).send(res);
  };

  getRevenueSummary = async (req, res, next) => {
    const { type } = req.params;
    new SuccessResponse({
      data: await SummaryService.getRevenueSummary(type),
    }).send(res);
  };

  getOrderStatusSummary = async (req, res, next) => {
    new SuccessResponse({
      data: await SummaryService.getOrderStatusSummary(),
    }).send(res);
  };

  getTopSellingProducts = async (req, res, next) => {
    const { limit } = req.query;
    new SuccessResponse({
      data: await SummaryService.getTopSellingProducts(limit ? parseInt(limit) : 5),
    }).send(res);
  };

  getRecentOrders = async (req, res, next) => {
    const { limit } = req.query;
    new SuccessResponse({
      data: await SummaryService.getRecentOrders(limit ? parseInt(limit) : 5),
    }).send(res);
  };
}
module.exports = new SummaryController();

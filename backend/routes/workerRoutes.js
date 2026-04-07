const express = require('express');
const router = express.Router();
const {
  getWorkers,
  addWorker,
  updateWorker,
  deleteWorker,
  getWorkerPerformance
} = require('../controllers/workerController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('admin'), getWorkers)
  .post(protect, authorize('admin'), addWorker);

router.route('/:id')
  .put(protect, authorize('admin'), updateWorker)
  .delete(protect, authorize('admin'), deleteWorker);

router.get('/:id/performance', protect, authorize('admin'), getWorkerPerformance);

module.exports = router;

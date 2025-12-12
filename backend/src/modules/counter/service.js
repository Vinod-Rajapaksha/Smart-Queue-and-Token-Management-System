import Counter from '../../database/models/Counter.js';
import Branch from '../../database/models/Branch.js';
import ApiError from '../../core/apiError.js';
import { getPagination } from '../../core/pagination.js';

const ensureBranchExists = async (branchId) => {
  const branch = await Branch.findById(branchId);
  if (!branch) throw new ApiError(404, 'Branch not found');
  return branch;
};

export const createCounter = async ({ branchId, name, code, services }) => {
  await ensureBranchExists(branchId);

  if (code) {
    const exists = await Counter.findOne({ branch: branchId, code });
    if (exists) throw new ApiError(409, 'Counter code already exists in this branch');
  }

  const counter = await Counter.create({
    branch: branchId,
    name: name.trim(),
    ...(code ? { code: code.trim() } : {}),
    ...(services ? { services } : {}),
  });

  return counter;
};

export const listCounters = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    branchId,
    isActive,
    search,
  } = query;

  const { skip, perPage } = getPagination(page, limit);

  const filter = {};
  if (branchId) filter.branch = branchId;
  if (isActive !== undefined) filter.isActive = String(isActive) === 'true';

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Counter.find(filter)
      .populate('branch', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage),
    Counter.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: perPage,
      total,
      pages: Math.ceil(total / perPage),
    },
  };
};

export const getCounterById = async (id) => {
  const counter = await Counter.findById(id).populate('branch', 'name code');
  if (!counter) throw new ApiError(404, 'Counter not found');
  return counter;
};

export const updateCounter = async (id, payload = {}) => {
  const counter = await Counter.findById(id);
  if (!counter) throw new ApiError(404, 'Counter not found');

  if (payload.name !== undefined) counter.name = payload.name.trim();
  if (payload.code !== undefined) counter.code = payload.code?.trim?.() ?? payload.code;
  if (payload.isActive !== undefined) counter.isActive = payload.isActive;
  if (payload.services !== undefined) counter.services = payload.services;

  // enforce unique code per branch
  if (payload.code) {
    const dup = await Counter.findOne({
      _id: { $ne: id },
      branch: counter.branch,
      code: payload.code,
    });
    if (dup) throw new ApiError(409, 'Counter code already exists in this branch');
  }

  await counter.save();
  return counter;
};

export const setCounterStatus = async (id, isActive) => {
  const counter = await Counter.findById(id);
  if (!counter) throw new ApiError(404, 'Counter not found');

  counter.isActive = isActive;
  await counter.save();
  return counter;
};

// soft delete
export const deleteCounter = async (id) => {
  const counter = await Counter.findById(id);
  if (!counter) throw new ApiError(404, 'Counter not found');

  counter.isActive = false;
  await counter.save();
  return counter;
};

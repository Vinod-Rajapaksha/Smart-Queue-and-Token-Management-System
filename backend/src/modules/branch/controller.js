import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../core/apiResponse.js';
import {
  createBranchService,
  getBranchesService,
  getBranchByIdService,
  updateBranchService,
  deactivateBranchService,
  activateBranchService,
} from './service.js';

export const createBranch = asyncHandler(async (req, res) => {
  const branch = await createBranchService(req.body);

  return new ApiResponse(201, 'Branch created successfully', branch).send(res);
});

export const getBranches = asyncHandler(async (req, res) => {
  const branches = await getBranchesService(req.query);

  return new ApiResponse(200, 'Branches fetched successfully', branches).send(
    res
  );
});

export const getBranchById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const branch = await getBranchByIdService(id);

  return new ApiResponse(200, 'Branch fetched successfully', branch).send(res);
});

export const updateBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const branch = await updateBranchService(id, req.body);

  return new ApiResponse(200, 'Branch updated successfully', branch).send(res);
});

export const deactivateBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const branch = await deactivateBranchService(id);

  return new ApiResponse(200, 'Branch deactivated successfully', branch).send(
    res
  );
});

export const activateBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const branch = await activateBranchService(id);

  return new ApiResponse(200, 'Branch activated successfully', branch).send(
    res
  );
});

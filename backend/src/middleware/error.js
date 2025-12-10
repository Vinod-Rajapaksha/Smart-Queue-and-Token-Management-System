import ApiError from "../core/apiError.js";
import ApiResponse from "../core/apiResponse.js";

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, err.message, null));
  }

  return res
    .status(500)
    .json(new ApiResponse(500, "Internal Server Error", null));
};

export default errorHandler;

import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  return res.json({
    status: "ok",
    message: "API running",
  });
});

export default router;

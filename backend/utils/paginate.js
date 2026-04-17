/**
 * Parse pagination parameters from a request.
 * Usage in controllers:
 *   const { page, limit, skip } = getPagination(req, { defaultLimit: 20, maxLimit: 100 });
 *   const [items, total] = await Promise.all([
 *     Model.find(filter).sort(sort).skip(skip).limit(limit),
 *     Model.countDocuments(filter),
 *   ]);
 *   res.json({ success: true, data: items, pagination: buildPagination(page, limit, total) });
 */
function getPagination(req, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const rawLimit = parseInt(req.query.limit, 10) || defaultLimit;
  const limit = Math.max(1, Math.min(maxLimit, rawLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function buildPagination(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

module.exports = { getPagination, buildPagination };

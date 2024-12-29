const paginate = async ({
  model,
  query = {},
  limit = 10,
  page = 1,
  projection = null,
  options = {},
  populate = null,
}) => {
  const skip = (page - 1) * limit;

  const queryChain = model
    .find(query, projection, options)
    .skip(skip)
    .limit(limit)
    .lean();

  if (populate) {
    queryChain.populate(populate);
  }

  const [data, total] = await Promise.all([
    queryChain,
    model.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      limit: +limit,
      page: +page,
      totalPages,
    },
  };
};

module.exports = { paginate };

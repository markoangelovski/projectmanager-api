exports.getQueryConditions = async (req, Model, ...rest) => {
  let { skip = 0, limit = 10, sort = "title" } = req.query;

  skip = !isNaN(Number(skip)) ? Number(skip) : 0;
  skip = skip >= 0 ? skip : 0;

  limit = !isNaN(Number(limit)) ? Number(limit) : 20;
  limit = limit <= 0 || limit > 10 ? 10 : limit;

  const globalOptions = [
    "title",
    "description",
    "date",
    "pl",
    "kanboard",
    "dev",
    "stage",
    "prod",
    "live",
    "nas",
    "order",
    "openTasksCount",
    "closedTasksCount",
    "column",
    "dueDate",
    "order",
    "eventsCount",
    "notesCount",
    "tags",
    "createdAt",
    "updatedAt"
  ];

  const sortArray = sort.split(",").map(opt => opt.trim());

  const allowedOptions = sortArray
    .map(option =>
      option[0] === "-" ? option.slice(1, option.length) : option
    )
    .filter(option => globalOptions.indexOf(option) > -1);

  let sortOptions = sortArray.filter(
    option => allowedOptions.findIndex(opt => new RegExp(opt).test(option)) > -1
  );

  sortOptions = sortOptions.join(" ");

  const sortOrder = sortOptions[0] === "-" ? "descending" : "ascending";

  if (!sortOptions.length) sortOptions = "title";

  const query = { owner: req.user._id, ...rest[0] };

  const [docsCount, docs] = await Promise.all([
    Model.countDocuments(query),
    Model.find(query, null, { skip }).sort(sortOptions).limit(limit)
  ]);

  let remaining = docsCount - (skip + limit);
  remaining = remaining > 0 ? remaining : 0;

  const stats = {
    total: docsCount,
    remaining,
    skipped: skip,
    results: docs.length,
    sortOrder,
    sortBy: allowedOptions.length ? allowedOptions.join() : "title"
  };

  return { stats, docs };
};

const Task = require("../../api/tasks/v1/tasks.model");

const getTasksAggrCond = async (cond, aggregateCall) => {
  let { skip, sort, ownerId, done, column } = cond;

  let query = { owner: ownerId };

  if (done !== null) query.done = done;
  if (column !== undefined) query.column = column;

  const [count, docs] = await Promise.all([
    Task.countDocuments(query),
    aggregateCall(skip, sort, query)
  ]);

  let remaining = count - (skip + 50);
  remaining = remaining > 0 ? remaining : 0;

  const stats = {
    total: count,
    remaining,
    skipped: skip,
    results: docs.length
  };

  return { stats, docs };
};

module.exports = { getTasksAggrCond };

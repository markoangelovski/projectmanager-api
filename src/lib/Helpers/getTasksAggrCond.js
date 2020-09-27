const Task = require("../../api/tasks/v1/tasks.model");

const getTasksAggrCond = async (cond, aggregateCall) => {
  let { skip, ownerId, done } = cond;

  let query = { owner: ownerId };

  if (done !== null) query.done = done;

  const [count, docs] = await Promise.all([
    Task.countDocuments(query),
    aggregateCall(skip, query)
  ]);

  let remaining = count - (skip + 20);
  remaining = remaining > 0 ? remaining : 0;

  const sortedDocs = docs.sort((prev, next) => {
    if (prev.tasks[0].createdAt > next.tasks[0].createdAt) {
      return -1;
    } else {
      return 1;
    }
  });

  const stats = {
    total: count,
    remaining,
    skipped: skip,
    results: docs.reduce((acc, cur) => (acc += cur.tasks.length), 0)
  };

  return { stats, docs: sortedDocs };
};

module.exports = { getTasksAggrCond };

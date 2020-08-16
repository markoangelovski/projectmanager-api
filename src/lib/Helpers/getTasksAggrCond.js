const Task = require("../../api/tasks/v1/tasks.model");

const getTasksAggrCond = async (cond, aggregateCall) => {
  let { skip, ownerId } = cond;

  const [count, docs] = await Promise.all([
    Task.countDocuments({ owner: ownerId }),
    aggregateCall({ skip, ownerId })
  ]);

  let remaining = count - (skip + 20);
  remaining = remaining > 0 ? remaining : 0;

  const stats = {
    total: count,
    remaining,
    skipped: skip,
    results: docs.reduce((acc, cur) => (acc += cur.tasks.length), 0)
  };

  return { stats, docs };
};

module.exports = { getTasksAggrCond };

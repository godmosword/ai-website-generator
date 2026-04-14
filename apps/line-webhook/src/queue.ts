type Job = () => Promise<void>;

const queue: Job[] = [];
let running = false;
const MAX_QUEUE_SIZE = 500;

async function runNext(): Promise<void> {
  if (running) {
    return;
  }

  running = true;
  try {
    while (queue.length > 0) {
      const next = queue.shift();
      if (!next) {
        continue;
      }

      try {
        await next();
      } catch (error) {
        console.error("queue job failed", error);
      }
    }
  } finally {
    running = false;
  }
}

export function enqueue(job: Job): boolean {
  if (queue.length >= MAX_QUEUE_SIZE) {
    return false;
  }

  queue.push(job);
  void runNext();
  return true;
}

import express from 'express';
import { InitResponse, IncrementResponse, DecrementResponse } from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort, scheduler } from '@devvit/web/server';
import { createPost } from './core/post';
import { leaderboardKey, leaderboardCacheKey } from './redisKeys';
import { LeaderboardEntry } from '../types';

const app = express();

// Middleware for JSON body parsing
app.use(express.json({ limit: '50mb' }));
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const [count, username, user] = await Promise.all([
        redis.get('count'),
        reddit.getCurrentUsername(),
        reddit.getCurrentUser(),
      ]);

      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
        username: username ?? 'anonymous',
        user: user ?? {},
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<{ postId: string }, IncrementResponse | { status: string; message: string }, unknown>(
  '/api/increment',
  async (_req, res): Promise<void> => {
    const { postId } = req.context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', 1),
      postId,
      type: 'increment',
    });
  }
);

router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const { postId } = req.context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', -1),
      postId,
      type: 'decrement',
    });
  }
);

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

// GET leaderboard (top 5)
router.get('/api/leaderboard/:puzzleId', async (req, res) => {
  const { puzzleId } = req.params;
  const key = `lb:${puzzleId}`;
  const today = new Date().toISOString().split('T')[0];
  const entries = await redis.zRange(key, 0, 4, { reverse: true });
  const leaderboard = entries.map((e: any) => ({
    username: e.member,
    time: Number(-e.score), // We stored negative time
  }));

  res.json({ leaderboard });
});

// POST new score
router.post('/api/submitScore', async (req, res) => {
  const { puzzleId, username, time } = req.body;

  if (!puzzleId || !username || time == null) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const key = `lb:${puzzleId}`;
  await redis.zAdd(key, { member: username, score: -time }); // Negative = lower time = higher rank
  res.json({ success: true });
});

// Add these routes
router.get('/api/appUser', async (req, res) => {
  try {
    const user = await reddit.getAppUser();
    console.log('user api', username);

    res.json({ username: username ?? 'Guest' });
  } catch (error) {
    res.json({ username: 'Guest' });
  }
});

router.get('/api/currentUser', async (req, res) => {
  try {
    const user = await reddit.getCurrentUser();

    res.json({ username: user ?? 'Guest' });
  } catch (error) {
    res.json({ username: 'Guest' });
  }
});

// Add these routes
router.get('/api/currentUsername', async (req, res) => {
  try {
    const username = await reddit.getCurrentUsername();
    console.log('username api', username);

    res.json({ username: username ?? 'Guest' });
  } catch (error) {
    res.json({ username: 'Guest' });
  }
});

router.get('/api/userStreak/:username', async (req, res) => {
  const { username } = req.params;
  const key = `streak:${username}`;
  // Check if a key exists
  const streak = Number(await redis.get(key)) || 0;
  res.json({ currentStreak: streak });
});

// GET daily players
router.get('/api/dailyPlayers', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const count = (await redis.zCard(`daily:${today}`)) || 0;
  res.json({ count });
});

// POST update streak
router.post('/api/updateStreak', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Missing username' });

  const today = new Date().toISOString().split('T')[0];
  const lastKey = `last:${username}`;
  const streakKey = `streak:${username}`;
  const dailyKey = `daily:${today}`;

  try {
    // 1. Safely get last played date (null if never played)
    const last = (await redis.get(lastKey)) ?? null;

    // 2. Safely get current streak (0 if never played)
    const rawStreak = await redis.get(streakKey);
    let streak = rawStreak ? parseInt(rawStreak, 10) : 0;
    if (isNaN(streak)) streak = 0;

    // 3. Update logic — safe from race conditions
    if (last === today) {
      // Already played today → no change to streak
    } else if (last === getYesterday(today)) {
      streak += 1;
    } else {
      streak = 1; // New streak
    }

    // 4. Save all at once
    await Promise.all([
      redis.set(lastKey, today),
      redis.set(streakKey, streak.toString()),
      redis.zAdd(dailyKey, { member: username, score: streak }),
    ]);

    res.json({ success: true, streak });
  } catch (error) {
    console.error('updateStreak error:', error);
    res.status(500).json({ error: 'Failed to update streak' });
  }
});

// === SAVE GAME ===
router.post('/api/save', async (req, res) => {
  const { postId, userId } = context;
  const body = req.body as {
    placedPieces: number[]; // indices of correctly placed pieces
    timerSeconds: number; // elapsed time
    moves?: number;
  };

  if (!postId || !userId) {
    return res.status(400).json({ error: 'Missing context' });
  }

  const key = `jigsawdit:save:${postId}:${userId}`;
  await redis.set(
    key,
    JSON.stringify({
      ...body,
      savedAt: new Date().toISOString(),
    }),
    { expiration: '30d' }
  ); // keep for 30 days

  res.json({ success: true });
});

// === LOAD GAME ===
router.get('/api/load', async (req, res) => {
  const { postId, userId } = context;
  if (!postId || !userId) {
    return res.json({ found: false });
  }

  const key = `jigsawdit:save:${postId}:${userId}`;
  const data = await redis.get(key);

  if (!data) {
    return res.json({ found: false });
  }

  res.json({ found: true, data: JSON.parse(data) });
});

// Scheduling try
router.post('/internal/scheduler/post-daily-puzzle', async (req, res) => {
  // In scheduler (run daily)
  const themes = [
    'Meme Monday',
    'Aww Tuesday',
    'WTF Wednesday',
    'Throwback Thursday',
    'User Friday',
  ];
  const today = new Date().getDay(); // 0 = Sunday
  const theme = themes[today === 1 ? 0 : today - 1]; // adjust

  try {
    // If the queue is empty, return
    const hasQueue = await redis.exists('data:queue');
    if (!hasQueue) {
      res.status(200).json({
        status: 'success',
        message: 'No items to process',
      });
      return;
    }

    const { subredditName } = context;
    //  const subredditName = 'Jigsawdit';
    if (!subredditName) {
      res.status(400).json({ status: 'error', message: 'subredditName is required' });
      return;
    }

    // Obtain levelName and gameData from Redis queue
    const queuedItems = await redis.hGetAll('data:queue');

    // For each record found...
    const records = Object.entries(queuedItems);
    for (const record of records) {
      // Extract levelName and gameData from record
      const [levelName, gameData] = record;

      console.log('levelName', levelName);
      console.log('gameData', gameData);

      // Add game data to redis (level name as key)
      // NOTE: This is not required, but an example if "game data" is larger than the 2kb allowed in postData

      // Create new post!
      await reddit.submitCustomPost({
        subredditName: subredditName,
        title: 'DAILY JIGSAWDIT: ',
        splash: {
          appDisplayName: 'Level ',
          heading: 'Level ',
          description: `Solve today’s r/aww  ${theme} masterpiece!`,
          // backgroundUri: 'default-splash.png',
          buttonLabel: 'Ckick to Start',
          // appIconUri: 'default-icon.png'
        },

        // Note postData contains the level name, which will be used in the init API to fetch the level game data
        // from the redis key set above!
      });
    }

    // Remove all items from the queue
    await redis.del('data:queue');
    res.json({ status: 'success', message: `Posts created in subreddit ${subredditName}` });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'Scheduled action failed',
    });
  }
});

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/postId',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }
    res.json({ postId });
  }
);

// Helper: get yesterday's date string
function getYesterday(date: string): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);

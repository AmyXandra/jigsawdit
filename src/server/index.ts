import express from 'express';
import { InitResponse, IncrementResponse, DecrementResponse } from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPost } from './core/post';
import { media } from '@devvit/media';

const app = express();

// Middleware for JSON body parsing
app.use(express.json({ limit: '50mb' }));
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

// CORS middleware for all routes
router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

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
      const [count, username, post] = await Promise.all([
        redis.get('count'),
        reddit.getCurrentUsername(),
        reddit.getPostById(postId),
      ]);

      // Get custom puzzle data from post if it exists
      let customPuzzleData = null;
      try {
        const postData = await post.getPostData();
        if (postData && typeof postData === 'object') {
          customPuzzleData = {
            imageUrl: postData.imageUrl as string,
            gridSize: postData.gridSize as number,
            difficulty: postData.difficulty as string,
            creatorUsername: postData.creatorUsername as string,
          };
        }
      } catch (error) {
        console.log('No custom puzzle data found for this post');
      }

      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
        username: username ?? 'anonymous',
        customPuzzle: customPuzzleData,
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
    const { postId } = context;
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
    const { postId } = context;
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

router.post('/internal/form/image-submit', async (req, res): Promise<void> => {
  const { myImage } = req.body;
  // Use the mediaUrl to store in redis and display it in an <image> block, or send to external service to modify
  console.log('Image uploaded:', myImage);

  res.json({
    showToast: 'Image uploaded successfully!',
    image: myImage,
  });
});

// GET leaderboard (top 5)
router.get('/api/leaderboard/:puzzleId', async (req, res) => {
  const { puzzleId } = req.params;
  const key = `lb:${puzzleId}`;
  const entries = await redis.zRange(key, 0, 4, { by: 'rank', reverse: true });
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
router.get('/api/currentUser', async (_req, res) => {
  try {
    const username = await reddit.getCurrentUsername();
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
router.get('/api/dailyPlayers', async (_req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const count = (await redis.zCard(`daily:${today}`)) || 0;
  res.json({ count });
});

// POST update streak
router.post('/api/updateStreak', async (req, res) => {
  const { username } = req.body as { username?: string };
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Missing username' });
  }

  const usernameStr: string = username; // Type assertion for TypeScript
  const today: string = new Date().toISOString().split('T')[0] as string;
  const lastKey = `last:${usernameStr}`;
  const streakKey = `streak:${usernameStr}`;
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
      redis.zAdd(dailyKey, { member: usernameStr, score: streak }),
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
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  await redis.set(
    key,
    JSON.stringify({
      ...body,
      savedAt: new Date().toISOString(),
    }),
    { expiration: new Date(Date.now() + thirtyDaysInMs) }
  ); // keep for 30 days

  res.json({ success: true });
});

// === LOAD GAME ===
router.get('/api/load', async (_req, res) => {
  const { postId, userId } = context;
  if (!postId || !userId) {
    return res.json({ found: false });
  }

  const key = `jigsawdit:save:${postId}:${userId}`;
  const data = await redis.get(key);

  // Get featured post from r/travel with gallery images
  let featuredPost = null;
  try {
    const posts = await getPosts('travel');
    
    // Filter posts: must not be NSFW and must have a thumbnail
    const filtered = posts
      .filter((post) => !post.nsfw)
      .filter((post) => post.thumbnail && post.thumbnail.url)
      .sort((a, b) => b.score - a.score); // Sort by score descending

    for (const post of filtered) {
      // Try to get gallery images (gallery is a property, not a method)
      const gallery = post.gallery;
      
      if (gallery && gallery.length > 0) {
        // Extract gallery image URLs
        const galleryImages = gallery.map((item: any) => item.url).filter(Boolean);
        
        featuredPost = {
          id: post.id,
          title: post.title,
          authorName: post.authorName,
          score: post.score,
          url: post.url,
          galleryImages: galleryImages,
          thumbnail: post.thumbnail?.url,
        };
        
        console.log('[LOAD] Featured post found:', post.title, 'with', galleryImages.length, 'gallery images');
        break; // Found a post with gallery, use it
      }
    }
  } catch (error) {
    console.error('[LOAD] Error fetching featured post:', error);
  }

  if (!data) {
    return res.json({ 
      found: false,
      featuredPost: featuredPost
    });
  }

  res.json({ 
    found: true, 
    data: JSON.parse(data),
    featuredPost: featuredPost
  });
});

// POST Completion Comment
router.post('/api/submitCompletionComment', async (req, res) => {
  try {
    const { subredditName, postId } = context;
    if (!subredditName) {
      throw new Error('subredditName is required');
    }
    if (!postId) {
      return res.status(400).json({ error: 'No post context (are you in an interactive post?)' });
    }
    const { comment = '' } = req.body as {
      comment: string;
    };

    await reddit.submitComment({
      id: postId, // Replace with the actual post ID
      text: comment,
      runAs: 'USER', // Optional: specify the user to run as
    });

    res.json({ success: true, message: 'Completion comment posted!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// POST Upload Image
router.post('/api/submitImage', async (_req, res) => {
  try {
    await media.upload({
      url: 'https://media2.giphy.com/media/xTiN0CNHgoRf1Ha7CM/giphy.gif',
      type: 'gif',
    });

    res.json({ success: true, message: 'Image uploaded!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// POST User Post
router.post('/api/userGeneratedContent', async (req, res) => {
  const { title = '' } = req.body as {
    image: string;
    title: string;
  };

  try {
    const subreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      title: title,
      subredditName: subreddit.name,
      richtext: [
        {
          e: 'text',
          t: title,
        },
      ],
    });
    res.json({ success: true, message: 'Post created!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// POST Convert image URL to base64
router.post('/api/convertImageToBase64', async (req, res) => {
  try {
    const { imageUrl } = req.body as { imageUrl: string };
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    console.log('[CONVERT] Converting image to base64:', imageUrl);

    // Fetch the image from Reddit CDN
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.error('[CONVERT] Failed to fetch image:', response.status);
      return res.status(502).json({ 
        error: `Failed to fetch image: ${response.statusText}` 
      });
    }

    // Get the image as buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Convert to base64
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    console.log('[CONVERT] Image converted successfully, size:', buffer.length, 'bytes');

    res.json({ 
      success: true,
      dataUrl,
      size: buffer.length
    });
  } catch (error) {
    console.error('[CONVERT] Error:', error);
    res.status(500).json({ 
      error: 'Failed to convert image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST Create Custom Puzzle Post
router.post('/api/createCustomPuzzle', async (req, res) => {
  const { imageUrl, gridSize, difficulty } = req.body as {
    imageUrl: string;
    gridSize: number;
    difficulty: string;
  };

  try {
    const { subredditName } = context;
    if (!subredditName) {
      return res.status(400).json({ error: 'subredditName is required' });
    }

    const username = (await reddit.getCurrentUsername()) ?? 'anonymous';
    const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

    const post = await reddit.submitCustomPost({
      splash: {
        appDisplayName: 'jigsawdit',
        backgroundUri: 'default-splash.png',
        buttonLabel: 'Play Puzzle',
        description: `${difficultyLabel} puzzle (${gridSize}x${gridSize}) created by u/${username}`,
        heading: 'Custom Jigsawdit Challenge!',
        appIconUri: 'default-icon.png',
      },
      postData: {
        imageUrl,
        gridSize,
        difficulty,
        creatorUsername: username,
        createdAt: new Date().toISOString(),
      },
      subredditName: subredditName,
      title: `🧩 Custom puzzle by u/${username} - ${difficultyLabel} (${gridSize}x${gridSize})`,
    });

    res.json({ 
      success: true, 
      postId: post.id,
      postUrl: `https://reddit.com/r/${subredditName}/comments/${post.id}`
    });
  } catch (error) {
    console.error('Failed to create custom puzzle post:', error);
    res.status(500).json({ error: 'Failed to create puzzle post' });
  }
});

// GET Hot Posts from a Subreddit
const getPosts = async (subreddit: string) => {
  return await reddit
    .getHotPosts({
      subredditName: subreddit,
      limit: 50,
      pageSize: 50,
    })
    .all();
};

// POST Daily Scheduling
router.post('/internal/scheduler/post-daily-puzzle', async (_req, res) => {
  const themeConfig = [
    { name: 'Travel Monday', subreddit: 'travel' },
    { name: 'Aww Tuesday', subreddit: 'aww' },
    { name: 'WTF Wednesday', subreddit: 'WTF' },
    { name: 'Throwback Thursday', subreddit: 'OldSchoolCool' },
    { name: 'Meme Friday', subreddit: 'memes' },
  ];
  
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const themeIndex = today === 0 ? 4 : today - 1; // Sunday uses Friday's theme
  const currentTheme:any = themeConfig[themeIndex];

  try {
    const { subredditName } = context;
    if (!subredditName) {
      res.status(400).json({ status: 'error', message: 'subredditName is required' });
      return;
    }

    console.log(`[SCHEDULER] Fetching posts from r/${currentTheme.subreddit} for ${currentTheme.name}`);

    // Get featured post from the theme's subreddit
    const posts = await getPosts(currentTheme.subreddit);
    
    // Filter posts: must not be NSFW and must have a thumbnail
    const filtered = posts
      .filter((post) => !post.nsfw)
      .filter((post) => post.thumbnail && post.thumbnail.url)
      .sort((a, b) => b.score - a.score); // Sort by score descending

    let featuredPost = null;
    for (const post of filtered) {
      // Try to get gallery images
      const gallery = post.gallery;
      
      if (gallery && gallery.length > 0) {
        // Extract gallery image URLs
        const galleryImages = gallery.map((item: any) => item.url).filter(Boolean);
        
        if (galleryImages.length > 0) {
          featuredPost = {
            id: post.id,
            title: post.title,
            authorName: post.authorName,
            score: post.score,
            url: post.url,
            galleryImages: galleryImages,
            firstImage: galleryImages[0],
          };
          
          console.log(`[SCHEDULER] Featured post found: "${post.title}" by u/${post.authorName} with ${galleryImages.length} images`);
          break; // Found a post with gallery, use it
        }
      }
    }

    if (!featuredPost) {
      console.error('[SCHEDULER] No suitable post found with gallery images');
      return res.status(400).json({
        status: 'error',
        message: 'No suitable post found with gallery images',
      });
    }

    // Create the daily puzzle post
    const post = await reddit.submitCustomPost({
      splash: {
        appDisplayName: 'jigsawdit',
        backgroundUri: 'default-splash.png',
        buttonLabel: 'Play Today\'s Puzzle',
        description: `${currentTheme.name} puzzle by u/${featuredPost.authorName} - View original: ${featuredPost.url}`,
        heading: `🧩 Daily Jigsawdit - ${currentTheme.name}`,
        appIconUri: 'default-icon.png',
      },
      postData: {
        imageUrl: featuredPost.firstImage,
        gridSize: 4,
        difficulty: 'medium',
        creatorUsername: featuredPost.authorName,
        sourcePostUrl: featuredPost.url,
        sourcePostTitle: featuredPost.title,
        theme: currentTheme.name,
        createdAt: new Date().toISOString(),
      },
      subredditName: subredditName,
      title: `🧩 Daily Jigsawdit - ${currentTheme.name} by u/${featuredPost.authorName}`,
    });

    console.log(`[SCHEDULER] Daily puzzle post created: ${post.id}`);

    res.json({ 
      status: 'success', 
      message: `Daily puzzle created in r/${subredditName}`,
      postId: post.id,
      theme: currentTheme.name,
      sourcePost: {
        author: featuredPost.authorName,
        title: featuredPost.title,
        url: featuredPost.url,
      }
    });
  } catch (error) {
    console.error('[SCHEDULER] Error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Scheduled action failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


router.get('/api/postId', async (_req, res): Promise<void> => {
  const { postId } = context;

  if (!postId) {
    res.status(400).json({
      status: 'error',
      message: 'postId is required but missing from context',
    });
    return;
  }
  res.json({ postId: postId });
});

// Helper: get yesterday's date string
function getYesterday(date: string): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0] as string;
}

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);

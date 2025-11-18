import { Devvit } from '@devvit/public-api';

export const api = Devvit.addHttpHandler({
  // GET /api/leaderboard/:id
  async GET({ request }) {
    const id = request.path.split('/').pop()!;
    const entries = await Devvit.context.redis.zRange(`lb:${id}`, 0, 4, { reverse: true });
    return Response.json(
      entries.map((e: any) => ({ username: e.member, time: -e.score }))
    );
  },

  // POST /api/submit
  async POST({ request }) {
    const { puzzleId, username, time } = await request.json();
    await Devvit.context.redis.zAdd(`lb:${puzzleId}`, { member: username, score: -time });
    Devvit.context.realtime.send('lb_update', { puzzleId, username, time });
    return Response.json({ ok: true });
  },
});

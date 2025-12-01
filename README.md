# Jigsawdit

A competitive jigsaw puzzle game built for Reddit using Devvit. Challenge yourself with daily puzzles, compete on leaderboards, and build your solving streak!

## What is Jigsawdit?

Jigsawdit is an interactive jigsaw puzzle game that runs directly inside Reddit posts. Players race against the clock to solve puzzles by dragging and dropping pieces into the correct positions on a grid. The game features:

- **Daily Puzzles**: Fresh challenges to keep you coming back
- **Competitive Leaderboards**: See how you stack up against other players
- **Streak Tracking**: Build your daily solving streak
- **Custom Puzzles**: Upload your own images and create custom puzzles
- **Multiple Difficulty Levels**: Choose from 4x4, 5x5, 6x6, 7x7, or 8x8 grids
- **Auto-Save Progress**: Your game state is automatically saved so you can continue later
- **Social Sharing**: Share your completion times with the Reddit community

## What Makes Jigsawdit Innovative?

Jigsawdit brings several unique features to the puzzle game genre:

1. **Reddit-Native Experience**: Fully integrated into Reddit's platform - no external apps or websites needed
2. **Community Competition**: Real-time leaderboards create a competitive social experience within Reddit communities
3. **Streak Gamification**: Daily streak tracking encourages consistent engagement and habit formation
4. **Precision Snap Logic**: Pieces only snap into place when dropped in their exact correct position (zero tolerance), creating a satisfying challenge
5. **Responsive Design**: Optimized for both mobile and desktop play, with piece sizes that automatically adjust based on screen size (64px on small screens, 70px on medium, 75px on large)
6. **User-Generated Content**: Players can create and share custom puzzles from their own images using Devvit's image upload form
7. **Persistent State**: Game progress is automatically saved to Redis every 3 seconds, allowing players to resume across sessions
8. **Live Stats**: See how many players have solved today's puzzle in real-time on the home page

## How to Play

### Starting the Game

1. **Launch the App**: Click on the Jigsawdit post on Reddit to see the home page
2. **View Your Stats**: Check your current streak (displayed with a flame icon 🔥) and see how many players have played today
3. **Check the Leaderboard**: View the top 3 players with their completion times and medal rankings (🥇🥈🥉), or click "View All" to see the full leaderboard
4. **Start Playing**: Click the large "Start Game" button to begin solving the puzzle

### Playing the Puzzle

1. **Study the Reference**: Use the small reference image at the top to see what the completed puzzle should look like
2. **Drag Pieces**: Click and drag puzzle pieces from the tray at the bottom of the screen
3. **Drop on Grid**: Drop pieces onto the puzzle canvas grid (the main square area with dashed borders)
4. **Snap into Place**: When a piece is dropped in its exact correct position, it will automatically snap and lock in place with a pop animation
5. **Track Progress**: Watch the progress percentage and timer as you solve the puzzle
6. **Complete the Puzzle**: Place all pieces correctly to finish and see your completion time

### Game Controls

- **Back to Home**: Return to the home page at any time
- **Create Puzzle**: Upload your own image to create a custom puzzle (opens Devvit's image upload form)
- **Leaderboard**: View rankings and compare your times with other players
- **Grid Size**: Change difficulty by selecting 4x4, 5x5, 6x6, 7x7, or 8x8 grid sizes (note: changing size will reset your progress if you've already placed pieces)
- **Reference Image**: View the reference image at the top to help identify where pieces belong

### After Completing

1. **View Your Time**: A completion modal shows how long it took you to complete the puzzle
2. **Play Again**: Start a new puzzle with the same image
3. **Share**: Post your completion time as a comment on Reddit
4. **Create Custom**: Upload your own image to create a new puzzle
5. **Check Leaderboard**: Your score is automatically submitted - see if you made it to the top rankings

### Tips for Success

- The timer starts when you drag your first piece, so take a moment to study the reference image first
- Pieces only snap when dropped in their exact correct position (zero tolerance for nearby positions)
- Your progress is automatically saved every 3 seconds, so you can leave and come back later
- Build your daily streak by playing every day to see the flame icon grow
- Unplaced pieces are shown in the tray at the bottom - the counter shows how many remain
- The puzzle canvas uses a grid layout with dashed borders to help you visualize where pieces go
- On mobile devices, piece sizes automatically adjust for optimal touch interaction

## Technology Stack

- **Devvit**: Reddit's developer platform for building apps
- **React**: Frontend UI framework
- **TypeScript**: Type-safe development
- **Vite**: Build tool for fast development
- **Express**: Server-side HTTP framework
- **Redis**: Data persistence for game state and leaderboards
- **Tailwind CSS**: Styling framework

## Getting Started

> Make sure you have Node 22 downloaded on your machine before running!

1. Run `npm create devvit@latest --template=react`
2. Go through the installation wizard. You will need to create a Reddit account and connect it to Reddit developers
3. Copy the command on the success page into your terminal

## Development Commands

- `npm run dev`: Starts a development server where you can develop your application live on Reddit
- `npm run build`: Builds your client and server projects
- `npm run deploy`: Uploads a new version of your app
- `npm run launch`: Publishes your app for review
- `npm run login`: Logs your CLI into Reddit
- `npm run check`: Type checks, lints, and prettifies your app

## Cursor Integration

This template comes with a pre-configured cursor environment. To get started, [download cursor](https://www.cursor.com/downloads) and enable the `devvit-mcp` when prompted.

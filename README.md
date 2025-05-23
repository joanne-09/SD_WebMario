# Web Mario
This is a Mario game built using Cocos Creator and Firebase.

## Project Setup

### Using Github Repository
1. Clone the repository:
   ```bash
   git clone https://github.com/joanne-09/SD_Chatroom.git
   ```
2. Navigate to the project directory: ```cd SD_WebMario```
3. Install dependencies: ```npm install```
4. Create a file init.js in assets/Scripts/lib.
5. Add your Firebase configuration to init.js.
6. Open Cocos Creator and run the project.

## Basic Features

### Game Process
1. Start with Start Scene.
2. Click on Login button or SignUp button to enter the game.
3. Enter Menu Scene to select a level.
4. Click on the level to enter the game.
5. When enter the game from Menu Scene, or lose a life in the game, you will enter the GameStart Scene.
6. This GameStart Scene will reset timer, decuct life, restore player score.
6. When player lose all lives, you will enter the GameOver Scene.

### World 
- Two world maps for different levels.
- Background and Camera follow the player.
- Player can fall because of gravity.
- Two objects can collide with each other.

### Level Design
- There are static walls in the level.
- There are Question Boxes that can be hit by the player.

### Player
- Player can move left and right using A/D keys.
- Player can jump using W key.
- Player can only jump when on the static ground or question boxes.
- Player can get hurts when colliding with enemies.
- Player can kill turtle enemies by jumping on them.
- Player can get coins or mushrooms from question boxes.
- Player can power up by eating red mushrooms.
- Player can die when falling from the map.

### Enemies
- Enemies can move left and right in fixed range.
- Enemies can turn around when hitting walls.
- Turtle Enemies can be killed by jumping on them.
- Player cannot kill Flower Enemies.
- Turtle Enemies will become shell when it is hit.

### Question Blocks
- Question Blocks can be hit by the player from below.
- Obtain 10 coins and 100 score when hitting normal Question Blocks.
- Get two kinds of mushrooms from special Question Blocks.
- Power Up from eating red mushrooms.

### Animations
- Player has walk and jump animations.
- Player has Power Up/Down animations.
- Player has die animation.
- Turtle has walk animation.
- Turtle has different animation when it is in shell form.
- Flower has animation for moving up and down.
- Question Boxes has animation.

### Sound Effects
- Has BGM in Start/Menu Scene.
- Has different BGM in different level scene.
- Has Player jump/die/power up/power down/kick/hit question box sound effect.
- Has different sound effect when hitting normal and mushroom question box.
- Has sound effect when hitting enemies.
- Has win sound effect and will stop the BGM when player wins.

### UI
- Show Player name/score/current life in Menu Scene.
- Show Player life/score/timer in Game Scene, and is fixed on the top of the screen.

## Bonus Features

### Firebase Integration
- Player can login and sign up using Firebase Authentication.
- Player can save level passed/high score/current life to Firebase Firestore.

### Leaderboard
- Presses question button in Menu Scene to show the leaderboard.
- Show the top 10 players in the leaderboard.
- Save the leaderboard to Firebase Firestore.
- Update the leaderboard when player wins.

### Special Mushroom
- Spawn green mushroom when player hits the question box in level 2.
- Will randomly remove life/add score/remove time when player eats the mushroom.
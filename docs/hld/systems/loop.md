# Gameplay Loop

This document defines the core gameplay loop for Slug4Dead. To define the game, we'll answer the
below questions and refine from there. 

## What is the game system about? 

The game is a 2D side-scrolling shooter similar to Metal Slug. The player is a survivor of a zombie
infection. There are 4 survivors the player can choose from at the start of the game: Zoey, Bill,
Louis and Francis. There are no special abilities to these characters, they just have a different
look and different voice lines. The player, with their chosen character, is stuck during the
outbreak of a virus which has turned all non-survivors into "the infected" (sometimes referred to as
'zombies' in these documents). The players have to shoot down the infected while trying to make it
to a safe house. 

To make it to the safe house, the player has different weapons at their disposal and they can find
different items around the map (pills for health, special ammo types, etc). Fundamentally, they just
need to make it to the safe zone to finish the level. 

Meanwhile, the different types of 'infected' enemies will try to kill the player. 

## What is the game’s experience about? 

It's a fun, relatively fast-paced 2D side-shooter. It's all about a quick gameplay loop, there's not
too many mechanics to learn. The key skill the player will need is accuracy and reflexes to 1) shoot
the infected, and 2) avoid being hit by the infected or their projectiles.

## What is the player’s goal (in the system)? 

Make it from the start of the level to the saferoom without dying. 

----

## Gameplay States

The game has the following gameplay states defined:

1. pre-level

Before a level is loaded, will show a main menu where the user can choose which map to play. 
The levels are defined in the `levels/` folder, for example `levels/alpha`. Once the player
selects a level (using the mouse to click on it), the level is loaded and we transition into the
next gameplay state. Under the `levels/xyz` folder you'll find files that have the same name as the
parent but with a number suffix. For example `alpha_1`. The number defines the order in which the
levels are played. All levels under a folder belong to the same `campaign`. The main menu lets the
user choose a `campaign` to play. (More details in the Appendix under `## level loading mechanism`).

Once the player has chosen a `campaign`, they have to choose a survivor to play with. The choices
are: Bill, Louis, Francis, Zoey. 

2. in-level
When we are in a level, we have a few states that the game can be in which defines which actions can
happen. 
    2.1 alive
        The game is actively running, the player can move around, but so do the enemies. The player has to
        try to finish the level.
    2.2 dead
        When the player has lot all health, they are dead, the game is over and they have the option to
        restart the level of quit the game.
    2.3 level_completed
        When the player reaches the saferoom, the level is over. We show a victory screen before
        proceeding to the next level.
    2.4 paused
        The gameplay loop is stopped and an overlay shows the options to 'resume' or 'quit'

# Appendix
## Level Loading Mechanism

Levels are defined under `levels/`. Each level name is defined by the name of the folder immediately
underneath `levels/`, for example we have `levels/alpha`, so the level `alpha` should be displayed
on the level selection menu. Levels are defined as `json` files in the codebase living under
`src/game/levels/{level_name}/{level_x.json}`. For example `src/levels/alpha/alpha_1.json`.

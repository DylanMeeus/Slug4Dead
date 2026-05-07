# Victory

There are 2 win-states for the game:
1. A player can complete a `level` within a campaign
2. A player can complete an entire `campaign`

## Level win

When the player completes a level, we need to show a victory screen. On this screen the player will
see a recap of their gameplay stats with the following information:
1. How many shots they fired
2. How many enemies they killed
3. Total time it took to complete the level.

On this screen, the player is presented with a button to load the next level in the campaign if a
next level is available. If no next level is available, instead we show the `Campaign Win` screen

## Campaign Win

This is quasi identical to the `Level Win` screen, but instead of having a `continue button` to load
the next level in the campaign, we show a button to the user to go back to the main menu.

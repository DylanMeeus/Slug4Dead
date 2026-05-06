# Common Infected

This is the common type of infected. These have no special abilities, are the easiest to kill, but
also the most common (as the name suggests) enemy in the game.


## Enemy Card

```
{
    name: "common",
    health: 10,
    damage: 25,
    velocity: 100
}
```

## Movement Details

This enemy walks left / right. They continue walking the exact distance in either direction.
Their max range is decidedly randomly when the enemy is spawned into the game. For example, they can
move from their starting point 200 pixels left, then move back 200 pixels right to their starting
position. Both the initial direction and distance is randomly generated. The max distane that any
enemy of this types will walk is 300 pixels. 

## Project Layout

The games files can be found under docs/. The `hld/main.md` defines the core technical decisions of the
game. You are to keep track of which files have been created and/or changes since you last worked on
the game. The entire game needs to feel consistent and these files are your main way to get there.
For example, you can't build a game without considering the player.md or the entities/common.md.

You should _not_ touch any files under the `docs/` folder unless given explicit permission to do so. 


## How to code
1. Always update state.md whenever you take an action. This will be your running log of all actions
that you have taken and the current state of the product. When we start a new coding agent, we
should be able to rebuild all your context to start on the project based on this. Add both a date
and time to the entry (up mm/dd/yyyy hh:mm format)

2. Always ask for permission before destructive actions (e.g, git delete, delete file, ..)

3. Write tests for your code

5. Be idiomatic, TypeScript code reads like TypeScript not Java. 

6. Before making any changes, summarize briefly the changes you want to make and ask for my
   permission explicitly. 

7. You _never_ perform git actions.

8. When you complete a requirement from a hld/ document (like a user story), you record this
   as part of your state so it's easier to track which work you've already done.

9. Bugs will be recorded in the bugs/ directory. When you solve a bug, make sure you note it down in
   the state file. If the behaviour of the bug is uncleark, ask instructions.

10. Files called `definitions.md` define the meaning of the json fields you'll find in the
    respective files in that folder

## Working with art

In the absence of actual sprites for a given character (either player or enemy), you can use a
stand-in. For example, you can render the player as a red rectangle and the enemy as a blue circle.
It doesn't really matter how you render them, as long as each type is uniquely identifiable. That'll
make development and debugging easier.


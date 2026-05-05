# Slug4Dead

We are building a game called "Slug 4 Dead". 
This is a game inspired by the video game Left4Dead, and Metal Slug. It is an homage to tboth of
these games. 

The game is a 16-bit 2D shooter just like the original Metal Slug released in 1996. However, the game
play elements and loop will be inspired by Left4Dead. 

This file is the main entrypoint for the documents that will come to define the game. It highlights
the high-level decisions around technology (such as which frameworks to use, how to run and deploy
the game, etc). However, all gameplay specific files will be spread around through other files. At
the moment there is a low level of file taxonomy happening but expect this to grow as the project
grows larger. 

## Technology Choices

We want to limit friction for users to try out this game. As such, to avoid installations and
because modern machines are quite powerful, we will run this game entirely in a web browser. We wil
l build this game with the following technologies:

* TypeScript: This is the main implementation language for the game. We use properly _typed_
  typescript, so no `any` types unless forced to by a third-party framework.
* Phaser 3: This is a game development framework and a good fit for 2d sprite-based action games
* Vite: Dev tooling for iterative development


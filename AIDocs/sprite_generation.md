# Sprite Generation

This document records the AI-assisted workflow used to generate the first Bill and Zoey player
spritesheets. The assets may need art direction revisions, but these steps capture the process and
tools used so future attempts can be repeated or improved.

## Goal

Generate 16-bit-style player spritesheets for Bill and Zoey using the existing reference art:

- `docs/art/reference/players/bill/`
- `docs/art/reference/players/zoey/`

Each generated player sheet was intended to match the existing spitter asset structure:

- 7 columns by 2 rows
- `256x384` frames
- `1792x768` total image size
- Row 0: idle frames
- Row 1: walking frames
- Sprite faces left
- Transparent PNG output

## Reference Inspection

Representative reference images were opened and inspected before generation:

- Bill:
  - `docs/art/reference/players/bill/Bg_survivors_bottom_bill.webp`
  - `docs/art/reference/players/bill/Untitled.jpg`
- Zoey:
  - `docs/art/reference/players/zoey/L4DZoey1.webp`
  - `docs/art/reference/players/zoey/Zoey_Profile.webp`

The references were used only for broad character traits:

- Bill: older rugged male survivor, gray beard, beret, olive military jacket, dark pants, rifle.
- Zoey: young female survivor, dark tied-back hair, red hoodie/jacket, dark jeans, compact firearm.

## Image Generation

The built-in `image_gen` tool was used through the `imagegen` skill. One image was generated for
Bill and one image was generated for Zoey.

The prompt structure specified:

- Use case: `stylized-concept`
- Asset type: 16-bit game character spritesheet for a Phaser side-scrolling shooter
- Canvas: fixed 7-column by 2-row sheet
- Frame size: `256x384`
- Total canvas: `1792x768`
- Animation layout:
  - Row 0, frames 0-6: idle
  - Row 1, frames 7-13: walking
- Style:
  - 16-bit pixel art
  - Crisp edges
  - Limited palette
  - Readable silhouette
  - No text, watermark, UI, background, or shadows

The generated source images were saved by the image tool under Codex storage:

- `/home/dylan/.codex/generated_images/019dfffc-ddec-7033-8559-faa903ead93a/ig_0135ebc55ef958280169fbe87ad41c819a9ceb16e3056ad15a.png`
- `/home/dylan/.codex/generated_images/019dfffc-ddec-7033-8559-faa903ead93a/ig_0135ebc55ef958280169fbe8f52d18819a8d54360e80caee60.png`

Those original generated files were left in place.

## Post-Processing

The generated images were visually close to the requested layout, but they were not directly
game-ready:

- They were slightly larger than `1792x768`.
- They were RGB PNGs.
- They included a visible checkerboard-style background instead of a true alpha channel.

ImageMagick and Pillow were not available in the environment. Installing Pillow with `sudo apt`
was attempted, but `sudo` required an interactive password. Since `ffmpeg` was available, it was
used for post-processing.

The `ffmpeg` post-processing did the following:

- Scaled each generated sheet to `1792x768`.
- Converted output to RGBA.
- Converted bright low-saturation checkerboard-like pixels to alpha.
- Wrote the processed PNGs into the project asset folders.

The saved output files were:

- `docs/art/players/bill/bill-spritesheet.png`
- `docs/art/players/zoey/zoey-spritesheet.png`

Both files were verified with `file` and reported as:

- PNG image data
- `1792 x 768`
- 8-bit/color RGBA
- non-interlaced

## Metadata Files

Each spritesheet received a matching metadata JSON file:

- `docs/art/players/bill/bill-spritesheet.json`
- `docs/art/players/zoey/zoey-spritesheet.json`

The metadata follows the same general shape as the spitter metadata:

```json
{
  "image": "bill-spritesheet.png",
  "frameWidth": 256,
  "frameHeight": 384,
  "columns": 7,
  "rows": 2,
  "animations": {
    "idle": {
      "row": 0,
      "startFrame": 0,
      "endFrame": 6,
      "frameRate": 6,
      "repeat": -1
    },
    "walking": {
      "row": 1,
      "startFrame": 7,
      "endFrame": 13,
      "frameRate": 10,
      "repeat": -1
    }
  }
}
```

## State Logging

After the assets and metadata were created, `state.md` was updated with:

- The approved creation of `docs/art/players/bill` and `docs/art/players/zoey`.
- The generated Bill and Zoey spritesheet paths.
- The generated metadata paths.
- A note that runtime player rendering still uses the placeholder texture until a later code pass
  wires these spritesheets into Phaser.

## Notes For Future Iteration

The generated images were accepted only as an initial pass. For better art direction in a later
iteration, prefer a prompt that more tightly controls:

- Exact body proportions in each frame.
- Pixel density and outline thickness.
- Weapons must not be embedded in player idle/walk frames. Player sprites should be empty-handed
  so weapons can be rendered as separate overlay sprites.
- Feet baseline and per-frame spacing.
- True transparent or flat chroma-key background behavior.
- How close the style should be to the spitter sheet versus classic arcade character sprites.

## Empty-Handed Regeneration Pass

The first Bill and Zoey sheets included weapons held directly by the player sprites. This was
rejected because Slug4Dead will support multiple weapons, and the cleaner runtime approach is to
render a weapon sprite over the player sprite instead of baking a specific weapon into every player
animation.

The player sheets were regenerated with stricter prompts that explicitly forbade:

- Guns, rifles, pistols, knives, bats, and carried props.
- Weapon straps, barrels, stocks, magazines, muzzles, and weapon silhouettes.
- Object-holding poses that imply a specific weapon.

The replacement prompt also required:

- Empty hands.
- Visible hands and arms.
- Relaxed combat-ready poses.
- Clear torso and hand areas for later weapon sprite overlay alignment.

The regenerated source files were saved by the image tool under Codex storage:

- `/home/dylan/.codex/generated_images/019dfffc-ddec-7033-8559-faa903ead93a/ig_0135ebc55ef958280169fbebd75cf4819ab8040e1380ab5f1c.png`
- `/home/dylan/.codex/generated_images/019dfffc-ddec-7033-8559-faa903ead93a/ig_0135ebc55ef958280169fbec1735c8819aaff516e9ab7f7729.png`

The same `ffmpeg` post-processing approach was used to scale and convert the generated RGB images
into `1792x768` RGBA PNGs. The existing project sprite PNGs were overwritten with user approval:

- `docs/art/players/bill/bill-spritesheet.png`
- `docs/art/players/zoey/zoey-spritesheet.png`

The metadata JSON files did not need structural changes because the frame grid and animation ranges
remained the same.

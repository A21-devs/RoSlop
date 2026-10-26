# Texturing models

The bar is N-Hance Studio (Alex N-Hance's studio, and their texture lead's hand-painted work): stylized hand-painted textures on top of PBR, in the Riot and Blizzard look. Before you texture, look at their work: search their Sketchfab (sketchfab.com/Malice6731), their ArtStation and the N-hance School gallery, download two or three pictures close to what you're making into .roslop/refs, and Read them. Flat single colours with no lighting baked in are the opposite of the bar.

## What makes it read

- Shape first. Big, chunky, readable forms with bevelled edges. Texture can't save a mushy silhouette.
- Light is painted in. Faces get lighter toward the top and darker toward the bottom (a top-down gradient), so the model reads even under flat Roblox light.
- Edges and cavities. Convex edges get a bright worn highlight a few pixels wide. Crevices, seams and contact points get dark ambient occlusion. That contrast does most of the work.
- Hue shift, not just value. Highlights go warmer and lighter. Shadows go cooler and a little more saturated. Never shade by mixing in black or grey.
- Separate materials clearly. Wood, metal, stone, cloth and gems each get their own value range and hue, so you can tell them apart at thumbnail size.
- Stylized patterns, not noise. Wood gets long grain strokes and knots, with darker plank gaps. Stone gets chipped bevelled edges, cracks and moss on top surfaces. Metal gets sharp bright edge highlights, a darker body and a few scratches. Crystals and lava glow from the inside out and get emissive.
- Restraint. Big calm areas, with detail where the eye lands (edges, joints, the front). Little roughness variation, since stylized textures mostly carry their look in colour.
- One palette for the whole set, matching the game and the owner's references.

## Doing it in Blender

- Clean UVs, with no stretching, and an even texel density across the model. Put a whole prop or a set of small props on one atlas.
- Bake AO and curvature (Cycles) from the mesh. Build the colour in the shader: base colour per material, a top-down gradient (geometry Z), AO multiplied into cavities, curvature or pointiness for edge highlights, and a few painted-style strokes from a noise or wave texture. Then bake it all down to one colour map.
- Add normal, roughness and metalness maps only when they add something. Most stylized props only need the colour map.
- Keep textures at 1024 at most (512 for small props, per the model rules). Export FBX or GLB with the textures included.

## On Roblox

- Apply textures with a SurfaceAppearance on the MeshPart (ColorMap, plus NormalMap, RoughnessMap and MetalnessMap if you made them). Don't fall back to plain material colours.
- Look at it in Studio under the game's real lighting, from player distance and close up, with the screenshot command. Fix anything that's too dark, too noisy, or unclear at a distance. Then put a picture next to the reference and fix the three biggest differences.

# Building in Studio

Builds that look like a pile of grey boxes come from building blind and at the wrong scale. Work like a level artist: block it out, look at it, fix it, then add detail, and look again.

## Before you place anything

- Look at the reference files in your brief, and the vault's References/Building notes if there are any. Write down 3 or 4 things the reference does that you'll copy: shapes, palette, density, how paths read.
- Open the place and look at what's already there, so new work matches it.

## Scale (Roblox studs)

- A character is about 5 studs tall and 2 wide. Eye height is about 5. Default walk speed is 16 studs a second, and a jump clears about 7 high and 10 to 12 across.
- Doors 4 to 5 wide and 8 high. Ceilings 12 to 16. Walls 1 thick. Steps 1 high and 2 deep. Paths 8 to 12 wide, main routes 16 to 24. Rooms at least 16 by 16.
- Keep sizes and positions on a 1 stud grid (0.5 for small detail). Parts meet at edges. Don't overlap faces in the same plane, or they flicker.

## Making it look good

- Pick a palette of 4 to 6 colours from the reference and stick to it. No pure black or white. On repeated parts, shift the colour a few percent so big areas don't look flat.
- Use 2 or 3 materials per area, not SmoothPlastic everywhere: Wood, Brick, Slate, Concrete, Grass, Metal, and so on.
- Break up boxes with trim along edges, a lip on roofs, wedges and cylinders for bevels, and height changes. Check the silhouette from the side.
- Fill space in clusters at three sizes: big landmarks you can see from spawn, medium pieces (buildings, trees, rocks), small clutter near paths. Leave breathing room. Don't spread things evenly, and don't leave big empty flat plates.
- Use Terrain (FillBlock, FillBall, FillWedge) for ground, hills and water instead of a baseplate when it's outdoors.
- Lighting: Future or ShadowMap, an Atmosphere, a ClockTime that suits the mood, light Bloom and ColorCorrection. Use PointLights in lamps and windows.
- Props and nature: use the owner's Library first, then the Creator Store (insert_model). Recolour them to the palette and delete any scripts inside unless they're needed.

## Doing it in code

- Write a small helper (part(name, size, cframe, color, material, parent)) and build from it, rather than hand-placing hundreds of lines.
- Anchor everything. Group pieces into named Models in one Folder per area. Turn off CanCollide and CanQuery on decoration players shouldn't touch, and CastShadow on tiny bits.
- Build in batches, with a ChangeHistoryService waypoint per batch so the owner can undo.
- Keep it phone-friendly: reuse MeshParts for repeated shapes, avoid hundreds of unions, and keep a whole map in the low tens of thousands of parts.

## Look at it, every pass

Work in passes: layout, shapes, detail, lighting. After each pass, take at least three pictures: top down, from spawn at eye height, and a wide angle. Read them and write down what's wrong: floating or sunken parts, gaps, flicker, empty areas, wrong scale next to a character, everything one colour, a path you can't follow. Fix it and take the pictures again. Don't say DONE until it holds up next to the reference. PROOF the final pictures.

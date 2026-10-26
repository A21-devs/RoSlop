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

## The bar: showcase quality

Aim for what the best Roblox builders post on X, not "a Roblox map". DailyInnovations is the bar the owner picked. Before your first pass, download his portfolio pictures and look at them with Read (curl -sL https://dailyinnovationss.carrd.co/assets/images/image01.jpg -o .roslop/refs/bar01.jpg, and so on through image06). Also use any reference files in your brief. What they all do:

- Lighting does half the work. Use Future lighting, an Atmosphere with some haze for depth, and a low sun (ClockTime around 7 to 8 or 16.5 to 17.5) for long shadows. Pair a warm key light with a cool ambient fill. Add SunRays and soft Bloom, and ColorCorrection with a little contrast and saturation. At night, set a blue ambient and let warm practical lights (lanterns, lamps, windows) carry the scene, with shadows on.
- Depth in every view. Frame the edges with something close (a tree, a lamp post, a wall), put the subject in the middle, and let silhouettes fade into haze in the back.
- Foliage is dense and layered: big trees, bushes, grass along every edge, flower clusters and mossy rocks. Vary sizes and shades within the palette, and tilt and rotate organic things a few degrees so nothing looks stamped.
- Architecture has rhythm and thickness. Space pillars and window mullions evenly. Recess windows 0.5 to 1 stud with frames 0.4 to 0.6 thick. Add a base plinth and a roof cornice. Glass gets some transparency and reflectance. Use signs and lettering where a real place would have them.
- Interiors use real proportions: tables about 3 high, seats about 2, counters 3.5. Put a grid of ceiling lights overhead, and add rugs, plants, wall art, and textured wood or tile floors. Rooms should look lived in.
- Detail like the best part builders: chamfer visible edges with wedges and cylinders, and add 0.1 to 0.3 stud trims, panel seams and small hardware. Darker parts tucked into corners fake ambient occlusion. Detail goes where players look; plain parts are fine where they don't.
- Paths have borders, texture and worn edges, with lamps placed along them at a steady rhythm. Water gets a shoreline, and moving water gets particles.
- When a material needs to read as real (wood planks, tile, cobble), use a MaterialVariant or SurfaceAppearance instead of flat plastic.

Before DONE, put your best picture next to the reference and name the three biggest differences. Fix them and look again. Don't stop at "fine".

## Look at it, every pass

Work in passes: layout, shapes, detail, lighting. After each pass, take at least three pictures: top down, from spawn at eye height, and a wide angle. Read them and write down what's wrong: floating or sunken parts, gaps, flicker, empty areas, wrong scale next to a character, everything one colour, a path you can't follow. Fix it and take the pictures again. Don't say DONE until it holds up next to the reference. PROOF the final pictures.

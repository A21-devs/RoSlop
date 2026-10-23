# Mockups

Static screens for each platform. They share one stylesheet so the real app can lift the tokens straight out of `base.css`.

```
npm i -D playwright
node design/mockups/render.mjs            # all of them
node design/mockups/render.mjs mac-app    # just one
```

PNGs land in `out/`. Open `shot.html?s=pc-site` in a browser to poke at one live.

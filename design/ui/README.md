# RoSlop screens

Static mockups for every platform: website, Mac app, Windows app and phones. One stylesheet, so the real app can take its tokens from `style.css`.

```
npm i -D playwright
node design/ui/render.mjs              # everything
node design/ui/render.mjs mac-app-usage  # one screen
```

PNGs land in `out/`. Open `shot.html?s=pc-site-desk` to look at one in a browser.

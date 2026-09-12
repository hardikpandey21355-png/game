# Choose Your Mama

A tiny pink pixel-art surprise page for a special kid.

## Add your media

- Put the supplied background image at `assets/background.png`.
- Put your funny celebration GIF at `assets/win.gif`.

The page works without either file, using a pink fallback background and a placeholder win frame.

The setup page creates a URL containing the receiver, moving names, and correct name. Send that generated URL to the receiver; it opens directly on the game screen.

## Run it

From this folder:

```powershell
python server.py
```

Then open http://127.0.0.1:8000

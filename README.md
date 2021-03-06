#Kodiak - a personal photo blog/sharing tool

Todo:
- use metadata to fill in og/twitter card data when available
- delete old folders when changing access (unset published date)
- Improve rst error messaging and handling
- RSS feed (multiple, public, limited, all)
- ux for publish but not latest
- make .. images:: support multiline .. image:: docinfo tags
- proper private support
- improve first time user experience
- delete pages
- pass static_web_path to themes instead of just the theme path
- move more of the skeleton html into templates and out of docutils
- re-generate all
- make the transition between images nicer (use image onload etc)


Done:
- use css to set image widths instead of height/width attrs directly (if
  we decide to support mobile) - conflicts with "use a translator..."
- handle issue where image is too large because of fractional pixels
- export theme width config values to js (for editing)
- finish actual theme - separate from project slightly, add small py
  config file for setting paths
- Clicking on an image in preview should bring it up in a lightbox full
  screen and display the alt text. Users should be able to use arrows to
  view the new and previous images for all other images on the page.
- Public/Private/Limited
- Pages Index
- grab title information from rst
- Resize thumbnails on preview page instead of using full images
  (resized to theme width)
- Resize images to a max size something 1600x1200?
- Style and correctly handle meta data
- fix progress bar and status
- after generating html on preview inject a head and footer template tag
  and then inject record data using jinja, use this to inject last_saved
  time.
- fix publishing button
- Facebook/twitter microtags
- flask-user-login
- fix width calculation, it needs to account for padding that occurs
  between images

#Setup

```
pip install -r /path/to/requirements.txt
npm install
```

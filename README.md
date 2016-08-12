#Kodiak - a personal photo blog/sharing tool

Todo:
- flask-user-login
- Handle static page publishing (should we auto generate or require a
  publish button?) - How to indicate staleness?
- Clicking on an image in preview should bring it up in a lightbox full
  screen and display the alt text. Users should be able to use arrows to
  view the new and previous images for all other images on the page.
- ux for publish but not latest
- Pages Index
- Public/Private/Limited
- RSS feed (multiple, public, limited, all)
- Don't add two new lines between consecutive .. image:: tags
- invalid rst handling, don't save, show error, show error warning
- export theme width config values to js (for editing)
- fix width calculation, it needs to account for padding that occurs
  between images

Done:
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

#Setup

```
pip install -r /path/to/requirements.txt
npm install
```

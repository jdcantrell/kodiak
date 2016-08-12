#Kodiak - a personal photo blog/sharing tool

Todo:
- grab title information from rst
- finish actual theme
- Clicking on an image in preview should bring it up in a lightbox full
  screen and display the alt text. Users should be able to use arrows to
  view the new and previous images for all other images on the page.
- fix width calculation, it needs to account for padding that occurs
  between images
- Pages Index
- Improve rst error messaging and handling
- export theme width config values to js (for editing)
- RSS feed (multiple, public, limited, all)
- Public/Private/Limited
- ux for publish but not latest
- Don't add two new lines between consecutive .. image:: tags
- make .. images:: support multiline .. image:: docinfo tags
- use a translator to create images the actual html size? We'd then have
  a preview writer and a publish writer, this seems pretty reasonable

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
- flask-user-login

#Setup

```
pip install -r /path/to/requirements.txt
npm install
```

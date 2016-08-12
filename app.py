import sys, os
from datetime import datetime
from PIL import Image

from flask import Flask, render_template, render_template_string, request, redirect, url_for, jsonify
from werkzeug import secure_filename

from kodiak.parse import Parser
from kodiak.database import db_session
from kodiak.models import Page
import kodiak.config

app = Flask(__name__)

@app.route("/edit/")
def new_page():
    record = Page("New Page")
    db_session.add(record)
    db_session.commit()
    return redirect(url_for('edit_page', id=record.id))

@app.route("/kodiak/edit/<id>/")
def edit_page(id):
    record = db_session.query(Page).get(id)
    last_saved = record.updated.strftime('%B %d, %Y at %I:%M%p')
    if record.published is not None:
        published_date = record.published.strftime('%B %d, %Y at %I:%M%p')
    else:
        published_date = 'Never';
    return render_template(
        'edit.html',
        id=record.id,
        data=record.data,
        last_saved=last_saved,
        published_date=published_date
    )

@app.route("/kodiak/edit/<id>/save/", methods=["POST"])
def save(id):
    record = db_session.query(Page).get(id)
    if record is not None:
        record.data = request.form['rst'].strip()
        db_session.add(record)
        db_session.commit()
        return redirect(url_for('preview', id=record.id, code=307))

@app.route("/kodiak/edit/<id>/preview/", methods=['GET'])
def preview(id):
    record = db_session.query(Page).get(id)
    if record is not None:
        parser = Parser()
        html = parser.parse(record.data)
        html = html.replace('</body>', '{{ post_body|safe }}</body>')

        last_saved = record.updated.strftime('%B %d, %Y at %I:%M%p')
        post_body = render_template('preview_post_body.html', last_saved=last_saved)
        return render_template_string(html, post_body=post_body),
    return render_template('empty_preview.html')

@app.route("/kodiak/edit/<id>/publish/", methods=['GET'])
def publish(id):
    record = db_session.query(Page).get(id)
    if record is not None:
        parser = Parser()
        html = parser.parse(record.data)
        if record.access == 'public':
            # get metadata create slug dir
            return 'not implemented'
        elif record.access == 'limited':
            file_path = '%s%s' % (kodiak.config.generate.path, record.key)
            if not os.path.exists(file_path):
                os.makedirs(file_path)
            full_path = '%s/index.html' % file_path

        with open(full_path, "w") as fh:
            fh.write(html)

        # set published date
        record.published = datetime.now()
        db_session.add(record)
        db_session.commit()
        return jsonify(published=record.published.strftime('%B %d, %Y at %I:%M%p'))

    return jsonify(error=True, message="Not found")

@app.route("/kodiak/upload/", methods=['POST'])
def upload():
    file = request.files['file']
    filename = secure_filename(file.filename)
    with Image.open(file) as im:
        width, height = im.size
        if width > kodiak.config.image.max_size['width'] or height > kodiak.config.image.max_size['height']:
            im.thumbnail((kodiak.config.image.max_size['width'], kodiak.config.image.max_size['height']), Image.ANTIALIAS)
            im.save('%s%s' % (kodiak.config.image.path, filename), "JPEG")

    with Image.open(file) as im:
        width, height = im.size
        if width > kodiak.config.theme.max_width:
            im.thumbnail((kodiak.config.theme.max_width, kodiak.config.theme.max_width * 2), Image.ANTIALIAS)
            im.save('%s%s' % (kodiak.config.image.thumb_path, filename), "JPEG")
    return jsonify(name=filename)



@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove();

if __name__ == "__main__":
  if len(sys.argv) > 1 and sys.argv[1] == 'init_db':
      from kodiak.database import init_db
      init_db()
      print "Database created"
  else:
    app.run(debug=True, port=8000)

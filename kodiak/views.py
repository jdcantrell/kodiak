import os, time
from datetime import datetime

from kodiak.config import config
from PIL import Image
from werkzeug import secure_filename
from werkzeug.security import check_password_hash

from flask import render_template, render_template_string, request, redirect, url_for, jsonify, send_from_directory
from flask_login import (
    login_user, logout_user, current_user, login_required, LoginManager
)

from kodiak import app
from parse import Parser, extract_info
from database import db_session
from models import Page, User

login_manager = LoginManager()
login_manager.init_app(app)

def favicon():
    idx =  time.localtime().tm_hour / 6
    print idx
    return '%simages/kodiak-%s.svg' % (
        config['app']['static_web_path'],
        ['morning', 'day', 'sunset', 'night'][idx]
    )

@login_manager.user_loader
def load_user(user_id):
    return db_session.query(User).get(user_id)

@app.route('/kodiak/login/', methods=['GET'])
def login():
    return render_template('login.html', favicon=favicon())


@app.route('/kodiak/login/', methods=['POST'])
def login_try():
    username = request.form.get('username', None)
    pw = request.form.get('password', None)
    if username is not None and pw is not None:
        users = db_session.query(User).filter_by(username=username)

        for user in users:
            if check_password_hash(user.password, pw):
                login_user(user, remember=True)
                return redirect(url_for('index'))

    time.sleep(5)

    return login()

@app.route("/kodiak/logout/")
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route("/kodiak/")
def index():
    if current_user.is_authenticated:
        records = db_session.query(Page).all()
        return render_template(
            'index_authenticated.html',
            pages=records,
            current_user=current_user,
            web_path=config['app']['web_path'],
            favicon=favicon(),
            static_web_path=config['app']['static_web_path'],
        )
    else:
        return render_template('index.html', favicon=favicon())

@app.route("/kodiak/new/")
@login_required
def new_page():
    record = Page("New Page")
    record.data = render_template(
        'new.rst',
        favicon=favicon(),
        today=datetime.now().strftime('%B %d, %Y')
    )
    db_session.add(record)
    db_session.commit()
    return redirect(url_for('edit_page', id=record.id))

@app.route("/kodiak/edit/<id>/")
@login_required
def edit_page(id):
    record = db_session.query(Page).get(id)
    last_saved = record.updated.strftime('%B %d, %Y at %I:%M%p')
    if record.published is not None:
        published_date = record.published.strftime('%B %d, %Y at %I:%M%p')
    else:
        published_date = 'Never';
    return render_template(
        'edit.html',
        favicon=favicon(),
        id=record.id,
        data=record.data,
        access=record.access,
        last_saved=last_saved,
        published_date=published_date,
        theme_width=(config['theme']['max_width'] + 20),
        web_path=config['app']['web_path'],
        static_web_path=config['app']['static_web_path'],
    )

@app.route("/kodiak/edit/<id>/save/", methods=["POST"])
@login_required
def save(id):
    record = db_session.query(Page).get(id)
    if record is not None:
        rst = request.form['rst'].strip()
        access = request.form['access'].strip()
        record.data = rst
        info = extract_info(rst)
        if 'title' in info:
            record.title = info['title']
        if 'slug' in info:
            record.slug = info['slug']

        record.access = access

        db_session.add(record)
        db_session.commit()
        return redirect(url_for('preview', id=record.id, code=307))

@app.route("/kodiak/edit/<id>/preview/", methods=['GET'])
@login_required
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
@login_required
def publish(id):
    record = db_session.query(Page).get(id)
    if record is not None:
        parser = Parser()
        html = parser.parse(record.data)
        if record.slug is not None:
            dir_name = record.slug
        else:
            dir_name = record.key

        if record.access == 'public':
            file_path = '%s%s' % (config['generate']['public_path'], dir_name)
            url = dir_name
        elif record.access == 'limited':
            file_path = '%s%s' % (config['generate']['limited_path'], dir_name)
            url = '%s?key=%s' % (dir_name, record.key)
        else:
            # access is private so do nothing
            return jsonify(published=record.published.strftime('%B %d, %Y at %I:%M%p'))

        if not os.path.exists(file_path):
            os.makedirs(file_path)

        full_path = '%s/index.html' % file_path
        with open(full_path, "w") as fh:
            fh.write(html)

        # set published date
        record.published = datetime.now()
        db_session.add(record)
        db_session.commit()
        return jsonify(
            published_date=record.published.strftime('%B %d, %Y at %I:%M%p'),
            url=url
        )

    return jsonify(error=True, message="Not found")

@app.route("/kodiak/upload/", methods=['POST'])
@login_required
def upload():
    file = request.files['file']
    filename = secure_filename(file.filename)
    with Image.open(file) as im:
        width, height = im.size
        if width > config['image']['max_size']['width'] or height > config['image']['max_size']['height']:
            im.thumbnail((config['image']['max_size']['width'], config['image']['max_size']['height']), Image.ANTIALIAS)
        im.save('%s%s' % (config['image']['path'], filename), "JPEG")

        if width > config['theme']['max_width']:
            im.thumbnail((config['theme']['max_width'], config['theme']['max_width'] * 2), Image.ANTIALIAS)
        im.save('%s%s' % (config['image']['thumb_path'], filename), "JPEG")
    return jsonify(name=filename)

@app.route("/<slug>/", methods=['GET'])
def view(slug):
    key = request.args.get('key')
    if key is not None:
        record = db_session.query(Page).filter(Page.slug == slug).filter(Page.key == request.args.get('key'))
        if record is not None:
            return send_from_directory(os.path.join('private', slug), 'index.html')
    return 'Not Found.', 404;

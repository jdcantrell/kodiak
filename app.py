from flask import Flask, render_template, request, redirect, url_for
from kodiak.parse import Parser
from kodiak.database import db_session
from kodiak.models import Page
import sys

app = Flask(__name__)

@app.route("/edit/")
def new_page():
    record = Page("New Page")
    db_session.add(record)
    db_session.commit()
    return redirect(url_for('edit_page', id=record.id))

@app.route("/edit/<id>/")
def edit_page(id):
    record = db_session.query(Page).get(id)
    return render_template('edit.html', id=record.id, data=record.data)

@app.route("/edit/<id>/save/", methods=["POST"])
def save(id):
    record = db_session.query(Page).get(id)
    record.data = request.form['rst'].strip()
    db_session.add(record)
    db_session.commit()
    return redirect(url_for('preview', id=record.id, code=307))

@app.route("/edit/<id>/preview/", methods=['GET'])
def preview(id):
    record = db_session.query(Page).get(id)
    print record
    print record.data
    if record is not None:
        parser = Parser()
        return parser.parse(record.data)
    return render_template('empty_preview.html')

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove();

if __name__ == "__main__":
  if len(sys.argv) > 1 and sys.argv[1] == 'init_db':
      from kodiak.database import init_db
      init_db()
      print "Database created"
  else:
    app.run(port=8000)

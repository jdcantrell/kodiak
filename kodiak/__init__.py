import sys, os

from kodiak.config import load_config

if not os.path.exists('./config.yml'):
    print "No config file found!"
    print "Please look at config.example.yml"
    sys.exit(1)
config = load_config('./config.yml');

from flask import Flask
from kodiak.database import db_session

app = Flask(__name__)
app.secret_key = config['secret_key']

import kodiak.views

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove();

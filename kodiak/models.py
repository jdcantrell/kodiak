from sqlalchemy import (
    event, Column, Integer, String, DateTime, UnicodeText, Enum, Text
)
from datetime import datetime

from shortid import ShortId

from werkzeug.security import generate_password_hash

from kodiak.database import Base


class Timestamp(object):
    created = Column(DateTime, default=datetime.now())
    updated = Column(DateTime, default=datetime.now())


@event.listens_for(Timestamp, 'before_update', propagate=True)
def timestamp_before_update(mapper, connection, target):
    target.updated = datetime.now()


class Page(Timestamp, Base):
    __tablename__ = 'pages'
    id = Column(Integer, primary_key=True)
    key = Column(String(16))
    access = Column(Enum('private', 'public', 'limited'))
    data = Column(UnicodeText())
    slug = Column(UnicodeText())
    title = Column(UnicodeText())
    published = Column(DateTime)

    def __init__(self, data, access='limited'):
        self.data = data
        self.access = access
        sid = ShortId()
        self.key = sid.generate()

    def __repr__(self):
        return '<Page %r>' % (self.id)

class User(Timestamp, Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(120), unique=True)
    password = Column(Text())

    def __init__(self, username, password):
        self.username = username
        self.password = generate_password_hash(password)

    def __repr__(self):
        return '<User %r>' % (self.username)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return unicode(self.id)

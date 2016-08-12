from sqlalchemy import (
    event, Column, Integer, String, DateTime, UnicodeText, Enum
)
from datetime import datetime

from shortid import ShortId

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
    published = Column(DateTime)

    def __init__(self, data, access='limited'):
        self.data = data
        self.access = access
        sid = ShortId()
        self.key = sid.generate()

    def __repr__(self):
        return '<Page %r>' % (self.id)


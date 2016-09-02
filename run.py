import sys
from kodiak import app
from kodiak.database import db_session
from kodiak.models import User

def add_user():
    name = raw_input('User name: ')
    password = raw_input('Password: ')

    user = User(name, password)

    db_session.add(user)
    db_session.commit()

    print 'User created: %r' % user.id
if __name__ == "__main__":
  if len(sys.argv) > 1 and sys.argv[1] == 'init_db':
      from kodiak.database import init_db
      init_db()
      print "Database created"
      add_user()
  elif len(sys.argv) > 1 and sys.argv[1] == 'add_user':
      add_user()
  else:
    app.run(debug=True, port=8000)

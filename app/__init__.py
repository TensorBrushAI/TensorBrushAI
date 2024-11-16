from flask import Flask
from flask_socketio import SocketIO
from app.dev_utils import colored_prints

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

from app import routes
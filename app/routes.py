import os
from flask import render_template, send_from_directory
from app import app, socketio
from .generate import start_generation # cancel_generation

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/static/<path:filename>")
def serve_static(filename):
    return send_from_directory(os.path.join(app.root_path, "static"), filename)

@app.route("/outputs/<path:filename>")
def serve_outputs(filename):
    return send_from_directory(os.path.join(app.root_path, "..", "outputs"), filename)

@socketio.on("connect")
def handle_connect():
    print("Client Connected")

@socketio.on("disconnect")
def handle_disconnect():
    print("Client Disconnected.")

@socketio.on("start_generation")
def handle_start_generation(data):
    print("Start generation request received.")
    start_generation(data)

@socketio.on("cancel_generation")
def handle_cancel_generation():
    print("Cancel generation request received.")
    # cancel_generation()
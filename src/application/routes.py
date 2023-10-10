from flask import jsonify, render_template, request
from application import app
from werkzeug.utils import secure_filename
import json

@app.route('/')
@app.route('/index')
def index():
    with open("src/application/data/test-graph-0.json", 'r') as fdata:
        gdata = json.load(fdata)
    return render_template('index.html', title='template', data=gdata)


@app.route('/about')
def about():
    return render_template('about.html', title='template')


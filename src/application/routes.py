from flask import jsonify, render_template, request, redirect, url_for
from application import app
from werkzeug.utils import secure_filename
import json

euc_users = ["E1", "E2", "E3"]
sph_users = ["S1", "S2", "S3"]
hyp_users = ["H1", "H2", "H3"]

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html', title='template', data=None)


@app.route('/about')
def about():
    return render_template('about.html', title='About')

@app.route('/euclidean/homepage') 
def euc_view():
    id = request.args.get('id')
    if id in euc_users:
        with open("src/application/data/test-graph-0.json", 'r') as fdata:
            gdata = json.load(fdata)
        return render_template("visualization.html", title='Euclidean', data=gdata, id=id, q_id="N/A")
    return redirect(url_for("index"))

@app.route('/spherical/homepage') 
def sph_view():
    id = request.args.get('id')
    if id in sph_users:
        return render_template("visualization.html", title='Spherical', data=None, id=id, q_id="N/A")
    return redirect(url_for("index"))

@app.route('/hyperbolic/homepage') 
def hyp_view():
    id = request.args.get('id')
    if id in hyp_users:
        return render_template("visualization.html", title='Hyperbolic', data=None, id=id, q_id="N/A")
    return redirect(url_for("index"))

@app.route('/index/<id>')
def user_index(id):
    if id in euc_users:
        return redirect(url_for("euc_view", id=id))
    elif id in sph_users:
        return redirect(url_for("sph_view", id=id))
    elif id in hyp_users:
        return redirect(url_for("hyp_view", id=id))
    else:
        return render_template('errors/404.html'), 404

@app.route('/index/')
def user_index_form():
    id = request.args.get('id')
    if id in euc_users:
        return redirect(url_for("euc_view", id=id))
    elif id in sph_users:
        return redirect(url_for("sph_view", id=id))
    elif id in hyp_users:
        return redirect(url_for("hyp_view", id=id))
    else:
        return render_template('errors/404.html'), 404


from flask import jsonify, render_template, request, redirect, url_for
from application import app
from werkzeug.utils import secure_filename
import json
import re

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
def euc_view_home():
    id = request.args.get('id')
    if id in euc_users:
        return render_template("euc-vis-home.html", title='Euclidean Homepage', data=None, id=id)
    return redirect(url_for("index"))

@app.route('/spherical/homepage') 
def sph_view_home():
    id = request.args.get('id')
    if id in sph_users:
        return render_template("sph-vis-home.html", title='Spherical', data=None, id=id, q_id="N/A")
    return redirect(url_for("index"))

@app.route('/hyperbolic/homepage') 
def hyp_view_home():
    id = request.args.get('id')
    if id in hyp_users:
        return render_template("hyp-vis-home.html", title='Hyperbolic', data=None, id=id, q_id="N/A")
    return redirect(url_for("index"))

@app.route('/euclidean/test<id>') 
def euc_view(id):
    id_int = int(re.findall(r"\d+", id)[0])
    if id in euc_users:
        with open(f"src/application/data/e_group_{id_int-1}.json", 'r') as fdata:
            gdata = json.load(fdata)
        return render_template("visualization.html", title='Euclidean', data=gdata, id=id, q_id="N/A")
    return redirect(url_for("index"))

@app.route('/spherical/test<id>') 
def sph_view(id):
    id_int = int(re.findall(r"\d+", id)[0])    
    if id in sph_users:
        with open(f"src/application/data/e_group_1.json", 'r') as fdata:
            gdata = json.load(fdata)
        return render_template("sphere-visualization.html", title='Spherical', data=gdata, id=id, q_id="N/A")
    return redirect(url_for("index"))

@app.route('/hyperbolic/test<id>') 
def hyp_view(id):
    if id in hyp_users:
        return render_template("visualization.html", title='Hyperbolic', data=None, id=id, q_id="N/A")
    return redirect(url_for("index"))

@app.route('/<id>')
def user_index(id):
    if id in euc_users:
        return redirect(url_for("euc_view_home", id=id))
    elif id in sph_users:
        return redirect(url_for("sph_view_home", id=id))
    elif id in hyp_users:
        return redirect(url_for("hyp_view_home", id=id))
    else:
        return render_template('errors/404.html'), 404

@app.route('/index/')
def user_index_form():
    id = request.args.get('id')
    if id in euc_users:
        return redirect(url_for("euc_view_home", id=id))
    elif id in sph_users:
        return redirect(url_for("sph_view_home", id=id))
    elif id in hyp_users:
        return redirect(url_for("hyp_view_home", id=id))
    else:
        return render_template('errors/404.html'), 404


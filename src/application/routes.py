from flask import jsonify, render_template, request, redirect, url_for
from urllib.parse import unquote as urllib_unquote
from application import app
from werkzeug.utils import secure_filename
import json
import re
from pymongo import MongoClient
# from mongopass import mongopass
mongopass = "mongodb+srv://riemann-study123:SzGVFYvxfGVqy3lq@riemann-study.mhxq2bq.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(mongopass)

db = client.riemannStudy
riemannCollection = db.riemannCollection


euc_users = ["E1", "E2", "E3"]
sph_users = ["S1", "S2", "S3"]
hyp_users = ["H1", "H2", "H3"]

graph_ids = dict(zip(range(9), [f"{gtype}_group_{num}.json" for gtype in ["s","h","e"] for num in range(3)]))


def generate_id(id):
    return id

def get_graph(id):
    print(id)
    id_int = int(re.findall(r"\d+", id)[0])
    with open(f"src/application/data/{graph_ids[id_int]}", 'r') as fdata:
        gdata = json.load(fdata)

    return gdata

def get_question(id):
    with open(f"src/application/data/sample_questions.json", 'r') as fdata:
        qdata = json.load(fdata)
    graph_id = ""
    question = {}
    for q in qdata["questions"]:
        if q["q_id"] == id:
            graph_id = q["graph"]["graph_id"]
            question = q
            break
    return get_graph(graph_id), question

@app.template_filter('unquote')
def unquote(url):
    safe = app.jinja_env.filters['safe']
    return safe(urllib_unquote(url))
@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html', title='template', data=None)


@app.route('/about')
def about():
    return render_template('about.html', title='About')

@app.route('/euclidean/homepage<data>') 
def euc_view_home(data):
    id = request.args.get('id')
    if id is None:
        return redirect(url_for("index"))
    if "E" in id:
        user_id = generate_id(id)
        new_val = { "id": user_id }
        riemannCollection.insert_one(new_val)
        return render_template("euc-vis-home.html", title='Euclidean Homepage', data=data, id=id)
    return redirect(url_for("index"))

@app.route('/spherical/homepage') 
def sph_view_home():
    id = request.args.get('id')
    if id is None:
        return redirect(url_for("index"))
    if "S" in id:
        return render_template("sph-vis-home.html", title='Spherical', data=None, id=id)
    return redirect(url_for("index"))

@app.route('/hyperbolic/homepage') 
def hyp_view_home():
    id = request.args.get('id')
    if id is None:
        return redirect(url_for("index"))
    if "H" in id:
        return render_template("hyp-vis-home.html", title='Hyperbolic', data=None, id=id)
    return redirect(url_for("index"))

def test_page(geom,id):
    pass

@app.route('/euclidean/test<id>_<q>') 
def euc_view(id, q):
    print("This should be page id", id)
    print("This should be question id", q)
    if "E" in id:
        gdata, question = get_question(q)
        return render_template("visualization.html", title='Euclidean', data=gdata, id=id, q_id=q, question=question)
    return redirect(url_for("index"))

@app.route('/spherical/test<id>') 
def sph_view(id):
    if "S" in id:
        gdata = get_graph(id)
        return render_template("sphere-visualization.html", title='Spherical', data=gdata, id=id, q_id="N/A")
    return redirect(url_for("index"))

@app.route('/hyperbolic/test<id>') 
def hyp_view(id):
    if "H" in id:
        gdata = get_graph(id)
        return render_template("hyperbolic-visualization.html", title='Hyperbolic', data=gdata, id=id, q_id="N/A")
    return redirect(url_for("index"))

@app.route('/euclidean/test-end<id>') 
def euc_view_end(id):
    print(id)
    if id is None:
        return redirect(url_for("index"))
    if "E" in id:
        # TODO Write code for adding to database and changing status of user as completed_test
        return redirect(url_for("euc_view_home", data=False, id=id))
    return redirect(url_for("index"))

@app.route('/<id>')
def user_index(id):
    if   "E" in id:
        return redirect(url_for("euc_view_home", data=True, id=id))
    elif "S" in id:
        return redirect(url_for("sph_view_home", id=id))
    elif "H" in id:
        return redirect(url_for("hyp_view_home", id=id))
    else:
        return render_template('errors/404.html'), 404

@app.route('/index/')
def user_index_form():
    id = request.args.get('id')
    if   "E" in id:
        return redirect(url_for("euc_view_home", data=True, id=id))
    elif "S" in id:
        return redirect(url_for("sph_view_home", id=id))
    elif "H" in id:
        return redirect(url_for("hyp_view_home", id=id))
    else:
        return render_template('errors/404.html'), 404


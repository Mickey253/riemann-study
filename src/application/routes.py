from flask import jsonify, render_template, request, redirect, url_for
from urllib.parse import unquote as urllib_unquote
from application import app
from werkzeug.utils import secure_filename
import json
import re
from pymongo import MongoClient
# from mongopass import mongopass
client = MongoClient(app.config.get('MONGOPASS'))

db = client.riemannStudy
riemannCollection = db.riemannCollection


euc_users = ["E1", "E2", "E3"]
sph_users = ["S1", "S2", "S3"]
hyp_users = ["H1", "H2", "H3"]

graph_ids = dict(zip(range(9), [f"{gtype}_group_{num}.json" for gtype in ["s","h","e"] for num in range(3)]))
question_queue = ["adj-fil-T2b-1", "adj-fil-T2b-2", "comcon-T5-1", "comcon-T5-2", "conn-T6-1", "conn-T6-2", "over-T9-1", "over-T9-2", "acc-T11-1", "acc-T11-2", "adj-T12-1", "adj-T12-2"]
user_answers = dict()
feedback_answers = { "fq1": "", "fq2": "", "fq3": ""}
for each in question_queue:
    user_answers[each] = "null"
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

@app.route('/spherical/homepage<data>') 
def sph_view_home(data):
    id = request.args.get('id')
    if id is None:
        return redirect(url_for("index"))
    if "S" in id:
        user_id = generate_id(id)
        new_val = { "id": user_id }
        riemannCollection.insert_one(new_val)
        return render_template("sph-vis-home.html", title='Spherical Homepage', data=data, id=id)
    return redirect(url_for("index"))

@app.route('/hyperbolic/homepage<data>') 
def hyp_view_home(data):
    id = request.args.get('id')
    if id is None:
        return redirect(url_for("index"))
    if "H" in id:
        user_id = generate_id(id)
        new_val = { "id": user_id, "completed_test": False, "results": None, "feedback": None }
        riemannCollection.insert_one(new_val)
        return render_template("hyp-vis-home.html", title='Hyperbolic', data=data, id=id)
    return redirect(url_for("index"))

def test_page(geom,id):
    pass

@app.route('/euclidean/test<id>_<q>') 
def euc_view(id, q):
    if "E" in id:
        gdata, question = get_question(q)
        return render_template("visualization.html", title='Euclidean', data=gdata, id=id, q_id=q, question=question)
    return redirect(url_for("index"))

@app.route('/spherical/test<id>_<q>') 
def sph_view(id, q):
    if "S" in id:
        gdata, question = get_question(q)
        return render_template("sphere-visualization.html", title='Spherical', data=gdata, id=id, q_id=q, question=question)
    return redirect(url_for("index"))

@app.route('/hyperbolic/test<id>_<q>') 
def hyp_view(id, q):
    if "H" in id:
        gdata, question = get_question(q)
        return render_template("hyperbolic-visualization.html", title='Hyperbolic', data=gdata, id=id, q_id=q, question=question)
    return redirect(url_for("index"))

# @app.route('/euclidean/test-end<id>') 
# def euc_view_end(id):
#     if id is None:
#         return redirect(url_for("index"))
#     if "E" in id:
#         # TODO Write code for adding to database and changing status of user as completed_test
#         return redirect(url_for("euc_view_home", data=False, id=id))
#     return redirect(url_for("index"))

# @app.route('/spherical/test-end<id>') 
# def sph_view_end(id):
#     if id is None:
#         return redirect(url_for("index"))
#     if "S" in id:
#         # TODO Write code for adding to database and changing status of user as completed_test
#         return redirect(url_for("sph_view_home", data=False, id=id))
#     return redirect(url_for("index"))

# @app.route('/hyperbolic/test-end<id>') 
# def hyp_view_end(id):
#     if id is None:
#         return redirect(url_for("index"))
#     if "H" in id:
#         # TODO Write code for adding to database and changing status of user as completed_test
#         return redirect(url_for("hyp_view_home", data=False, id=id))
#     return redirect(url_for("index"))

@app.route('/<id>')
def user_index(id):
    if   "E" in id:
        return redirect(url_for("euc_view_home", data=True, id=id))
    elif "S" in id:
        return redirect(url_for("sph_view_home", data=True, id=id))
    elif "H" in id:
        return redirect(url_for("hyp_view_home", data=True, id=id))
    else:
        return render_template('errors/404.html'), 404

@app.route('/index/')
def user_index_form():
    id = request.args.get('id')
    if   "E" in id:
        return redirect(url_for("euc_view_home", data=True, id=id))
    elif "S" in id:
        return redirect(url_for("sph_view_home", data=True, id=id))
    elif "H" in id:
        return redirect(url_for("hyp_view_home", data=True, id=id))
    else:
        return render_template('errors/404.html'), 404

@app.route('/euclidean/test/next<id>_<q>_<a>')
def next_question(id, q, a):
    user_answers[q] = a
    query = { "id" : id}
    update = {"$set": { "results": user_answers } }
    riemannCollection.update_one(query, update)
    next_q_index = question_queue.index(q) + 1
    if next_q_index >= len(question_queue):
        return redirect(url_for("get_feedback", id=id))
    else:
        next_q = question_queue[next_q_index]
        return redirect(url_for("euc_view", id=id, q=next_q))
    
@app.route('/spherical/test/next<id>_<q>_<a>')
def sph_next_question(id, q, a):
    user_answers[q] = a
    query = { "id" : id}
    update = {"$set": { "results": user_answers } }
    riemannCollection.update_one(query, update)
    next_q_index = question_queue.index(q) + 1
    if next_q_index >= len(question_queue):
        return redirect(url_for("get_feedback", id=id))
    else:
        next_q = question_queue[next_q_index]
        return redirect(url_for("sph_view", id=id, q=next_q))
    
@app.route('/get-feedback<id>')
def get_feedback(id):
    return render_template("feedback.html", title='Feedback', id=id)

@app.route('/store-feedback<id>')
def store_feedback(id):
    fq1 = request.args.get('fq1')
    fq2 = request.args.get('fq2')
    fq3 = request.args.get('fq3')
    feedback_answers["fq1"] = fq1
    feedback_answers["fq2"] = fq2
    feedback_answers["fq3"] = fq3
    query = { "id" : id}
    update = {"$set": { "feedback": feedback_answers, "completed_test": False } }
    riemannCollection.update_one(query, update)
    return redirect(url_for("end"))

@app.route('/end')
def end():
    return render_template("end.html", title='End of Study')
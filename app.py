from pymongo import MongoClient
import requests
from flask import Flask, render_template, jsonify, request, session, redirect, url_for
import jwt  # pyjwt로 설치할 것
import datetime
import hashlib
import re

app = Flask(__name__)

#로컬
client = MongoClient('localhost', 27017)

#AWS
# client = MongoClient('mongodb://test:test@localhost',27017)
db = client.dbsparta

SECRET_KEY = 'apple'


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/api/search', methods=['POST'])
def api_search():
    searchkey_receive = request.form['searchkey_give']
    search_receive = request.form['search_give']
    int_searchkey_receive = int(searchkey_receive)
    count = 0
    if searchkey_receive != 0:
        count = 20 * int_searchkey_receive

    str_count = str(count)

    url = 'https://api.openopus.org/omnisearch/' + search_receive + '/' + str_count + '.json'
    r = requests.get(url)
    response = r.json()
    status = response['status']['success']

    if status == 'false':
        return jsonify({'result': 'fail', 'msg': '더 이상 자료가 없습니다', })
    else:
        search_results = response['results']
        return jsonify({'result': 'success', 'search_results': search_results, })


@app.route('/api/pop', methods=['GET'])
def api_pop():
    url = 'https://api.openopus.org/composer/list/pop.json'
    r = requests.get(url)
    response = r.json()
    pop_result = response['composers']
    return jsonify({'result': 'success', 'popList': pop_result})


@app.route('/api/period', methods=['POST'])
def api_period():
    period_receive = request.form['period_give']
    period_url = 'https://api.openopus.org/composer/list/epoch/' + period_receive + '.json'
    r = requests.get(period_url)
    response = r.json()
    period_result = response['composers']
    return jsonify({'result': 'success', 'periodList': period_result})


@app.route('/api/more', methods=['POST'])
def api_more():
    id_receive = request.form['id_give']
    idurl = 'https://api.openopus.org/work/list/composer/' + id_receive + '/genre/all.json'
    r = requests.get(idurl)
    response = r.json()
    return jsonify({'result': 'success', 'more': response})


@app.route('/api/save', methods=['POST'])
def api_save():
    user_receive = request.form['user_give']
    tags_receive = request.form['tags_give']
    id_receive = request.form['id_give']
    url = 'https://api.openopus.org/work/list/ids/' + id_receive + '.json'
    r = requests.get(url)
    response = r.json()
    w = 'w:' + id_receive
    works = response['works'][w]
    composername = works['composer']['name']
    title = works['title']
    genre = works['genre']
    popular = works['popular']
    recommended = works['recommended']

    chk_work = db.works.find_one({'user': user_receive, 'id': id_receive})

    if chk_work is None:
        doc = {
            'user': user_receive,
            'id': id_receive,
            'name': composername,
            'title': title,
            'genre': genre,
            'popular': popular,
            'recommended': recommended,
            'tags': tags_receive,
        }
        db.works.insert_one(doc)
        return jsonify({'result': 'success', 'msg': '저장되었습니다'})
    else:
        return jsonify({'result': 'fail', 'msg': '이미 저장한 곡입니다'})


@app.route('/api/library', methods=['POST'])
def api_library():
    user_receive = request.form['user_give']
    works = list(db.works.find({'user': user_receive}, {'_id': False}))
    return jsonify({'result': 'success', 'worksList': works})


@app.route('/api/tag', methods=['POST'])
def api_tag():
    user_receive = request.form['user_give']
    tags_result = []
    tags = list(
        db.works.find({'user': user_receive},
                      {'_id': False, 'id': False, 'user': False, 'name': False, 'title': False, 'genre': False,
                       'popular': False, 'recommended': False, }))
    for tag in tags:
        tags_val = tag['tags'].split(',')
        for tag_val in tags_val:
            if tag_val.strip() not in tags_result:
                tags_result.append(tag_val.strip())
    return jsonify({'result': 'success', 'tags': tags_result})


@app.route('/api/tag/select', methods=['POST'])
def api_tag_select():
    user_receive = request.form['user_give']
    tag_receive = request.form.getlist('tag_give[]')
    tag_include_receive = request.form['tag_include_give']
    work_result = []

    # if tag_include_receive == 'true':

    works = list(db.works.find({'user': user_receive}, {'_id': False}))
    for work in works:
        tags = work['tags'].replace(" ", "").split(',')
        if tag_include_receive == 'true':
            tag_and = list(set(tag_receive) - set(tags))
            if not tag_and:
                work_result.append(work)
        else:
            tag_or = list(set(tag_receive) & set(tags))
            if tag_or:
                work_result.append(work)
    return jsonify({'result': 'success', 'workResult': work_result})



@app.route('/api/tag/edit', methods=['POST'])
def api_tag_edit():
    user_receive = request.form['user_give']
    workid_receive = request.form['workid_give']
    tags_receive = request.form['tags_give']
    new_tags = tags_receive
    db.works.update_one({'user': user_receive, 'id': workid_receive}, {'$set': {'tags': new_tags}})

    return jsonify({'result': 'success', 'msg': '태그를 수정했습니다'})


@app.route('/api/tag/delete', methods=['POST'])
def api_tag_delete():
    user_receive = request.form['user_give']
    workid_receive = request.form['workid_give']
    db.works.delete_one({'user': user_receive, 'id': workid_receive}, )
    return jsonify({'result': 'success', 'msg': '삭제되었습니다'})


################################################   로그인/회원가입   #######################################################

@app.route('/api/register', methods=['POST'])
def api_register():
    id_receive = request.form['id_give']
    pw_receive = request.form['pw_give']
    pw_hash = hashlib.sha256(pw_receive.encode('utf-8')).hexdigest()
    result = db.user.find_one({'id': id_receive, })
    if result is not None:
        return jsonify({'result': 'fail', 'msg': '이미 존재하는 아이디 입니다'})
    else:
        db.user.insert_one({'id': id_receive, 'pw': pw_hash, })
        return jsonify({'result': 'success'})


@app.route('/api/login', methods=['POST'])
def api_login():
    id_receive = request.form['id_give']
    pw_receive = request.form['pw_give']
    pw_hash = hashlib.sha256(pw_receive.encode('utf-8')).hexdigest()
    result = db.user.find_one({'id': id_receive, 'pw': pw_hash})
    if result is not None:
        payload = {
            'id': id_receive,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=3600)
        }

        #로컬
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

        #AWS
        # token = jwt.encode(payload, SECRET_KEY, algorithm='HS256').decode('utf-8')

        return jsonify({'result': 'success', 'token': token})
    else:
        return jsonify({'result': 'fail', 'msg': '아이디/비밀번호가 일치하지 않습니다.'})


#################################################   회원 확인   ###########################################################

@app.route('/api/name', methods=['GET'])
def api_valid():
    token_receive = request.headers['token_give']
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        userinfo = db.user.find_one({'id': payload['id']}, {'_id': 0})
        return jsonify({'result': 'success', 'name': userinfo['id']})
    except jwt.ExpiredSignatureError:
        return jsonify({'result': 'fail', 'msg': '로그인 시간이 만료되었습니다.'})


if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)

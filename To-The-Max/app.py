from flask import Flask, render_template, request, redirect, session
from flask.ext.sqlalchemy import SQLAlchemy
from schema import *
import os
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.secret_key = 'Ultra secret invisible super secret key'
db = SQLAlchemy(app)


#Dekorator
@app.route('/', methods=['POST'])
def new_msg():
    if 'name' not in session:
        return redirect('/login')
    msg = request.form['message']
    db.session.add(Message(session['name'], msg))
    db.session.commit()
    return redirect('/')


@app.route('/', methods=['GET'])
def list_msg():
    posts = db.session.query(Message).order_by(Message.index).all()
    while len(posts) > 10:
        db.session.delete(posts[0])
        posts = posts[1:]
        db.session.commit()
    if 'name' in session:
        return render_template('index.html',
                                posts = posts,
                                name = session['name'],
                                logtext = 'logout',
                                loglink = '/logout'
                                )
    else:
        return render_template('index.html',
            posts = posts,
            name = 'no-one',
            logtext = 'login',
            loglink = '/login'
        )

@app.route('/login', methods=['GET', 'POST'])
def log_in():
    if request.method == 'POST':
        name = request.form['username']
        password = request.form['password']
        user = db.session.query(User).filter(User.name == name).first()
        if user and user.check_pass(password):
            session['name'] = name
            return redirect('/')
    return render_template('login.html',
                           backname = 'Back to signup',
                           backlink = 'signup.html')

@app.route('/signup', methods=['GET', 'POST'])
def sign_up():
    if request.method == 'POST':
        name = request.form['username']
        password = request.form['password']
        if not db.session.query(User).filter(User.name == name).first():
            db.session.add(User(name, password))
            db.session.commit()
            return redirect('/login')
    return render_template('signup.html')

@app.route('/logout')
def logout():
    if 'name' in session:
        del session['name']
    return redirect('/login')

@app.route('/list')
def list_music():
    music = []
    for root, dirs, files in os.walk("static/music", topdown=False):
        for name in files:
            mfile = {'path': root, 'name': name}
            music.append(mfile)
    return json.dumps(music)

@app.route("/musicPlayer")
def create_page():
    return render_template("musicPlayer.html")


if __name__ == '__main__':
    app.run(port=1315, debug=True)

# Importing the modules that are needed for the program to run.
import json
from locale import currency
from flask import Flask, render_template, url_for, session, flash, redirect, request, jsonify
import os
import hashlib
from flaskext.mysql import MySQL
from sklearn.metrics import balanced_accuracy_score
from credentials import *
from alpha_vantage.timeseries import TimeSeries
import requests
import numpy as np
from alpha_vantage.timeseries import TimeSeries
from newsapi import NewsApiClient
import finnhub


"""
It takes a list as an input and returns a list of unique elements in the list

:param list1: the list of numbers you want to find the unique values of
:return: A list of unique elements in the list.
"""
def unique(list1):
    x = np.array(list1)
    return list(np.unique(x))


# Importing the modules that are needed for the program to run.
app = Flask(__name__)
ts = TimeSeries(key=api_key, output_format='pandas')
newsapi = NewsApiClient(api_key=news_api_key)
finnhub_client = finnhub.Client(api_key=search_api_key)
mysql = MySQL()
mysql.init_app(app)

# Setting the configuration for the app.
app.config['SECRET_KEY'] = secret_key
app.config['MYSQL_DATABASE_USER'] = db_username
app.config['MYSQL_DATABASE_PASSWORD'] = db_password
app.config['MYSQL_DATABASE_DB'] = 'asset_dashboard'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'



"""
If the user tries to access a page that doesn't exist, the user will be redirected to the error.html
page

:param e: The error object
:return: The error.html template is being returned.
"""
@app.errorhandler(404)
def not_found(e):
    return render_template("error.html")


@app.route('/index')
@app.route('/')
@app.route('/home')
def home():
    return render_template("index.html")


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == "GET":
        if 'username' in session:
            flash("You are already logged in!", "info")
            return redirect(url_for("home"))
        else:
            return render_template("login.html")
    else:
        email = request.form['email']
        password = request.form['password']
        print(email,password)
        connection = mysql.connect()
        cursor = connection.cursor()
        cursor.execute('select email,password,salt,username,user_id from users_info')
        connection.close()
        records = cursor.fetchall()
        exist = False
        for row in records:
            if email == row[0]:
                exist = True
                hex_hash = hashlib.pbkdf2_hmac(
                    'sha256', password.encode(), row[2], 10000).hex()
                if hex_hash == row[1]:
                    session['username'] = row[3]
                    session['id'] = row[4]
                    return jsonify({'success': f"Welcome back {row[3]}!"})
        if exist == False:
            return jsonify({'error': 'An account with that email does not exist!'})
        else:
            return jsonify({'error': 'The given password is wrong, try again!'})


@app.route('/signup', methods=['POST'])
def signup():
    username = request.form['username']
    email = request.form['email']
    password = request.form['password']
    connection = mysql.connect()
    cursor = connection.cursor()
    cursor.execute('select username,email from users_info')
    records = cursor.fetchall()
    for row in records:
        if username == row[0]:
            return jsonify({'info': 'There is already a user with the same username, try logging in!'})
        elif email == row[1]:
            return jsonify({'info': 'There is already a user with the same email, try logging in!'})
    salt = os.urandom(32)
    hex_hash = hashlib.pbkdf2_hmac(
        'sha256', password.encode(), salt, 10000).hex()
    cursor.execute('insert into users_info (username,email,password,salt) values (%s,%s,%s,%s)',
                   (username, email, hex_hash, salt))
    connection.commit()
    cursor.execute(
        'select user_id from users_info where username=%s', username)
    records = cursor.fetchall()
    connection.close()
    session['id'] = records[0]
    session['username'] = username
    return jsonify({'success': f"Welcome {username}!"})


@app.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
    if request.method == 'GET':
        return render_template('dashboard.html')
    else:
        try:
            data=finnhub_client.stock_symbols('US')
            stocks=[]
            for match in data:
                stocks.append(match['displaySymbol'])
            stocks.sort()
            return jsonify({'stocks':stocks })
        except:
            return jsonify({'error': "There was an issue with the stocks API and our search autocomplete isn't working! Please try again later..."})

    

@app.route('/callback', methods=['POST'])
def send():
    if request.method == 'POST':
        stock = request.form['stock']
        try:
            data, meta_data = ts.get_daily(symbol=stock, outputsize='full')
            tmp = data.reset_index()
            tmp['date'] = tmp['date'].apply(str)
            tmp['date'] = tmp['date'].str[:10]
            stock_data = tmp.values.tolist()
            url = 'https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=' + \
                stock+'&apikey='+api_key
            r = requests.get(url)
            data = r.json()
            income_statement = []
            for year in data['annualReports']:
                income_statement.append([year['fiscalDateEnding'][:4], year['totalRevenue'], year['grossProfit'],
                                        year['operatingExpenses'], year['incomeBeforeTax'], year['netIncome']])
            url = 'https://www.alphavantage.co/query?function=OVERVIEW&symbol=' + \
                stock+'&apikey='+api_key
            r = requests.get(url)
            data = r.json()
            overview = [data['Symbol'], data['AssetType'], data['Name'], data['Description'], data['Exchange'],
                        data['Currency'], data['Country'], data['Sector'], data['Industry'], data['Address']]

            url='https://newsapi.org/v2/everything?q='+data['Name']+'+OR+'+stock+'&sortBy=relevancy&language=en&apiKey='+news_api_key
            r = requests.get(url)
            top_headlines = r.json()
            total_results = top_headlines['totalResults']
            print(total_results)
            articles = []
            if total_results>10:
                num=10
            else:
                num=total_results
            c=0
            for article in top_headlines['articles']:
                tmp=[article['source']['name'], article['author'], article['title'], article['description'],
                                article['url'], article['urlToImage'], article['publishedAt'], article['content']]
                if tmp[6]!=None:
                    tmp[6]=tmp[6].replace("T"," ").replace("Z", " ")
                for i in range(len(tmp)):
                    if tmp[i]==None:
                        tmp[i]='Unknown'
                articles.append(tmp)
                c+=1
                if c>=num:
                    break
            return jsonify({"stocks": stock_data, 'stock': stock.upper(), 'income_statement': income_statement, 'overview': overview,'total_results':total_results,'articles':articles})
        except:
            return jsonify({'error': "We either have no information about the stock named \'"+stock+"\' or there was an issue with the stocks API! Please try again later..."})


@app.route('/technical-indicators/<name>', methods=['GET'])
def technical(name):
    return render_template('technical-indicators.html',name=name)


@app.route('/technical-indicators', methods=['GET' ,'POST'])
def technical_index():
    if request.method=='GET':
        try:
            data=finnhub_client.stock_symbols('US')
            stocks=[]
            for match in data:
                stocks.append(match['displaySymbol'])
            stocks.sort()
            return render_template('technical-indicators.html' ,stocks=stocks, name=None)
        except:
            flash('There was an error fetching the companies\' symbols, due to an API malfunction, please try again later!')
            return render_template('technical-indicators.html', name=None)
    else:
        company=request.form['company']
        indicator=request.form['indicator']
        interval=request.form['interval']
        type=request.form['type']
        period=request.form['period']
        try:
            url = 'https://www.alphavantage.co/query?function='+indicator+'&symbol='+company+'&interval='+interval+'&time_period='+period+'&series_type='+type+'&apikey='+api_key
            r = requests.get(url)
            data = r.json()
            all_data=[]
            for item in data[list(data.keys())[1]]:
                for i in data[list(data.keys())[1]][item]:
                    all_data.append([item,data[list(data.keys())[1]][item][i]])
            all_data.reverse()
            return jsonify({'all_data':all_data,'indicator':indicator})
        except:
            return jsonify({'error': "We either have no information about your query or there was an issue with the stocks API! Please try again later..."})


@app.route('/viewing', methods=['GET','POST'])
def viewing():
    if request.method=='GET':
        if 'username' in session:
                return render_template('viewing.html')
        else:
            flash('You have to log in or create an account to access a portfolio!','error')
            return redirect(url_for("login"))
    else:
        try:
            connection = mysql.connect()
            cursor = connection.cursor()
            cursor.execute('select stock,amount,price from portfolio where user_id=%s',(str(session['id'])))
            portfolio = cursor.fetchall()
            cursor.execute('select balance from assets where user_id=%s',(str(session['id'])))
            assets = cursor.fetchall()
            connection.close()
            stock_data=[]
            for stock in portfolio:
                url='https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+stock[0]+'&apikey='+api_key
                r = requests.get(url)
                data = r.json()
                stock_data.append([data['Global Quote']["08. previous close"],data['Global Quote']["05. price"],data['Global Quote']["09. change"],data['Global Quote']["10. change percent"]])
            return jsonify({'port':portfolio,'ass':assets,'stock':stock_data})
        except:
            return jsonify({'error':'Too many requests to the API! Try again later...'})

@app.route('/viewing/buystocks', methods=['GET','POST'])
def buystocks():
    if request.method=='GET':
        if 'username' in session:
            return render_template('buystocks.html')
    else:
        try:
            stock=request.form['stock']
            amount=request.form['amount']
            url='https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+stock+'&apikey='+api_key
            r = requests.get(url)
            data = r.json()
            stock_price=data['Global Quote']["05. price"]
            price=float(stock_price)*int(amount)
            connection = mysql.connect()
            cursor = connection.cursor()           
            cursor.execute('select balance from assets where user_id=%s',(str(session['id'])))
            balance = cursor.fetchall()
            print(balance)
            if balance[0][0]>=price:
                cursor.execute('select stock from portfolio where user_id=%s and stock=%s',(str(session['id']),stock))
                flag=cursor.fetchall()
                if len(flag)>0:
                    cursor.execute('update portfolio set price=price+%s,amount=amount+%s where user_id=%s and stock=%s',(price,amount,str(session['id']),stock))
                    connection.commit()
                    cursor.execute('update assets set balance=balance-%s where user_id=%s',(price,str(session['id'])))
                    connection.commit()

                else:
                    cursor.execute('insert into portfolio (user_id,stock,amount,price) values(%s,%s,%s,%s)',(str(session['id']),stock,amount,price))
                    connection.commit()
                    cursor.execute('update assets set balance=balance-%s where user_id=%s',(price,str(session['id'])))
                    connection.commit()
                cursor.execute('select balance from assets where user_id=%s',(str(session['id'])))
                curr_balance=cursor.fetchall()
                curr_balance=curr_balance[0][0]
                connection.close()
                return jsonify({'success':'Transaction was completed! You bought '+str(amount)+' stock(s) of '+str(stock)+' for a total price of '+str(price)+'! Your balance is now: '+str(curr_balance)+'$.'})
            else:
                return jsonify({'error':'Your balance isn\'t enough to buy you that many stocks. Please add to your balance!'})
        except:
            return jsonify({'error':'Your request could not be completed due to a technical reason. Try again later!'})




@app.route('/getprice', methods=['POST'])
def price():
    if request.method=='POST':
        try:
            stock=request.form['stock']
            amount=request.form['amount']
            url='https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+stock+'&apikey='+api_key
            r = requests.get(url)
            data = r.json()
            price=data['Global Quote']["05. price"]
            return jsonify({'total':float(price)*int(amount),"perstock":float(price)})
        except:
            return jsonify({'error':'Too many requests to the API! Try again later...'})

@app.route('//viewing/sellstocks', methods=['POST'])
def sell():
    if request.method=='POST':
        stock=request.form['stock']
        amount=request.form['amount']
        url='https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+stock+'&apikey='+api_key
        r = requests.get(url)
        data = r.json()
        stock_price=data['Global Quote']["05. price"]
        price=float(stock_price)*int(amount)
        connection = mysql.connect()
        cursor = connection.cursor()        
        cursor.execute('select * from portfolio where user_id=%s and stock=%s and amount>=%s',(str(session['id']),stock,amount))   
        flag=cursor.fetchall()
        if len(flag)>0:
            cursor.execute('update portfolio set price=price-%s,amount=amount-%s where user_id=%s and stock=%s',(price,amount,str(session['id']),stock))
            connection.commit()
            cursor.execute('update assets set balance=balance+%s where user_id=%s',(price,str(session['id'])))
            connection.commit()
            cursor.execute('select balance from assets where user_id=%s',(str(session['id'])))
            curr_balance=cursor.fetchall()
            curr_balance=curr_balance[0][0]
            connection.close()
            return jsonify({'success':"You sold "+str(amount)+' shares of '+str(stock)+' for '+str(price)+'$ and your current balance is '+str(curr_balance)+'$.'})
        else:
            return jsonify({'error':'You either don\'t own the stock: '+str(stock)+' or you do not own '+str(amount)+' shares of that stock! Please check your data in your portfolio and try again!'})



@app.route('/addbalance', methods=['POST'])
def addbalance():
    if request.method=='POST':
        try:
            amount=request.form['amount']
            connection = mysql.connect()
            cursor = connection.cursor()  
            cursor.execute('update assets set balance=balance+%s where user_id=%s',(amount,str(session['id'])))
            connection.commit()
            cursor.execute('select balance from assets where user_id=%s',(str(session['id'])))
            curr_balance=cursor.fetchall()
            curr_balance=curr_balance[0][0]
            connection.close()
            return jsonify({'success':'An amount of '+str(amount)+' was successfully added to your account!',"amount":amount,'balance':curr_balance})
        except:
            return jsonify({'error':'An error occured while updating your balance. Try again later...'})

@app.route('/logout', methods=['GET'])
def logout():
    flash(f"Hope to see you soon {session['username']}!", 'success')
    session.pop('username', None)
    session.pop('id', None)
    return redirect(url_for("home"))


if __name__ == '__main__':
    app.run(debug=True)

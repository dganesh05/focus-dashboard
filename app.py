import os
from flask import Flask, render_template, request, jsonify
from supabase import create_client, Client
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler

load_dotenv()

app = Flask(__name__)

# Supabase setup
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

@app.route('/')
def index():
    return render_template('index.html')

# To-Do List Routes
@app.route('/tasks', methods=['GET'])
def get_tasks():
    category = request.args.get('category', 'inbox')  # Default to 'inbox'
    tasks = supabase.table('to_do_lists').select('*').eq('category', category).execute()
    return jsonify(tasks.data)

@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    new_task = supabase.table('to_do_lists').insert({
        'task_name': data['task'],
        'category': data['category'],
        'status': False
    }).execute()
    return jsonify(new_task.data[0])

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()
    update_data = {}
    if 'status' in data:
        update_data['status'] = data['status']
    if 'task' in data:
        update_data['task_name'] = data['task']
        update_data['modified_at'] = 'now()'
    if 'category' in data:
        update_data['category'] = data['category']
    
    updated_task = supabase.table('to_do_lists').update(update_data).eq('id', task_id).execute()
    return jsonify(updated_task.data[0])

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    supabase.table('to_do_lists').delete().eq('id', task_id).execute()
    return '', 204

def move_daily_tasks():
    with app.app_context():
        supabase.table('to_do_lists').update({'category': 'inbox'}).eq('category', 'daily').execute()

def move_weekly_tasks():
    with app.app_context():
        supabase.table('to_do_lists').update({'category': 'inbox'}).eq('category', 'weekly').execute()

def move_monthly_tasks():
    with app.app_context():
        supabase.table('to_do_lists').update({'category': 'inbox'}).eq('category', 'monthly').execute()

if __name__ == '__main__':
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=move_daily_tasks, trigger="cron", hour=0, minute=0)
    scheduler.add_job(func=move_weekly_tasks, trigger="cron", day_of_week='mon', hour=0, minute=0)
    scheduler.add_job(func=move_monthly_tasks, trigger="cron", day=1, hour=0, minute=0)
    scheduler.start()
    app.run(debug=True)
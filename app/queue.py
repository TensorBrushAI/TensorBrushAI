import queue
import threading
from app import socketio
from .generate import start_generation, cancel_generation

task_queue = queue.Queue()
cancel_flag = threading.Event()
queue_lock = threading.Lock()

def add_task(task_data):
    with queue_lock:
        task_queue.put(task_data)
    update_queue_state()

def update_queue_state():
    with queue_lock:
        queue_data = list(task_queue.queue)
    socketio.emit("update_queue", {"queue": queue_data})

def process_queue():
    while True:
        task_data = task_queue.get()
        if task_data is None:
            break

        cancel_flag.clear()
        update_queue_state()

        try:
            start_generation(task_data)

        except Exception as e:
            print(f"Task failed: {e}")

        finally:
            task_queue.task_done()
            update_queue_state()

def cancel_task():
    cancel_flag.set()
    cancel_generation()
    update_queue_state()

def cancel_queue_item(index):
    with queue_lock:
        try:
            task_list = list(task_queue.queue)
            if 0 <= index < len(task_list):
                task_list.pop(index)
                new_queue = queue.Queue()
                for task in task_list:
                    new_queue.put(task)
                task_queue.queue = new_queue.queue
                print(f"Task at index {index} canceled.")
            else:
                print(f"Invalid index {index} for queue cancelation.")
        
        except Exception as e:
            print(f"Error canceling task at index {index}: {e}")

    update_queue_state()

def cancel_all_tasks():
    with queue_lock:
        while not task_queue.empty():
            task_queue.get_nowait()
            
    update_queue_state()

threading.Thread(target=process_queue, daemon=True).start()

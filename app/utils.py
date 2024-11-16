from tqdm import tqdm

# PROGRESS PERCENTAGE
class InterceptingProgressBar(tqdm):
    def __init__(self, *args, **kwargs):
        self.socketio = kwargs.pop("socketio", None)
        super().__init__(*args, **kwargs)

    def update(self, n=1):
        super().update(n)
        if self.total:
            percentage = round((self.n / self.total) * 100)
            if self.socketio:
                self.socketio.emit("progress_update", {"percentage": percentage})
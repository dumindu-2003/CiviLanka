import os
from datetime import datetime

_LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Exceptionlogs")
_LOG_FILE = os.path.join(_LOG_DIR, "ExceptionLogs.txt")


class LogHandler:
    @staticmethod
    def WriteToLog(exceptionMsg, methodName):
        os.makedirs(_LOG_DIR, exist_ok=True)
        now = datetime.now()
        message = f"{now:%m/%d/%Y %H:%M:%S} ~ {methodName} ~ {exceptionMsg};"
        with open(_LOG_FILE, "a", encoding="utf-8") as writer:
            writer.write(message + "\n")

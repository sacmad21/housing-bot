from pymongo import MongoClient
import os


class MongoDBClient:
    _instance = None

    @staticmethod
    def get_instance():
        if MongoDBClient._instance is None:
            MongoDBClient()
        return MongoDBClient._instance

    def __init__(self):
        if MongoDBClient._instance is not None:
            raise Exception("This class is a singleton!")
        else:
            # Use environment variable for MongoDB URI, with a fallback to localhost
            mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
            self.client = MongoClient(mongo_uri)
            self.db = self.client.myapp
            MongoDBClient._instance = self

    def get_db(self):
        return self.db

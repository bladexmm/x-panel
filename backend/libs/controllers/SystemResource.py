from flask_restful import Resource
from flask import request

from libs.utils.system.operator import getProcesses
from libs.utils.tools import result



class WindowsResource(Resource):
    def get(self):
        type = request.args.get('type','frontend')
        return result(data = getProcesses(type), msg = 'success')

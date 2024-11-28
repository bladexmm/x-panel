import time
import traceback
from libs.utils.nodes.graph import call_by_alias
from libs.utils.log import Logger
from libs.utils.settings import STATUS_PATH, MAX_NODE_RUN
from libs.utils.tools import list_to_dict, has_intersection, read_json, write_json


class LiteGraph(object):
    def __init__(self, app, parent, startNode = None):
        if startNode is None:
            startNode = {"type": "DisplayStart", "slot": "out"}
        self.startNode = startNode
        self.outputs = {}
        self.links = app['path']['links']
        self.nodes = app['path']['nodes']
        self.nodesDict = app['path']['nodes']
        self.app = app
        self.parent = parent
        self.max_run = MAX_NODE_RUN  # 最大运行的节点数
        self.ran = 0  # 已经运行的节点数量
        self.inputNodes = ["TextInput", "ArrayInput", "ImageInput"]  # 默认输入节点
        self.exitNodes = ["CMDEnd", "DisplayGrid", "SubgraphOutput"]
        self.gridNodes = ["DisplayImage", "DisplayText", "DisplayInput", "DisplayLineChart", "DisplayButton",
                          "DisplaySelector","DisplaySlider"]  # 绘图节点
        self.SubGraphNodes = ['SubgraphInput']  # 子函数输入节点
        self.logs = []
        self.linkNow = {}
        self.start = int(time.time())

    def execute(self):
        self.initLinks()
        self.initNodes()
        self.initStatus()
        self.initNodesData(self.inputNodes)
        self.initNodesData(self.SubGraphNodes)
        self.initNodesData(self.gridNodes)
        nodeStart = self.findStartNode()
        nextNode = self.findNextNode(nodeStart, self.startNode['slot'])
        if nextNode is None:
            return self.logs
        while nextNode is not None and self.ran < self.max_run:
            Logger.info(f"Executing LiteGraph Node[{nextNode['id']}]:{nextNode['type']}")

            status = self.initStatus(nextNode['type'][-1])
            if status == 'stopping':
                return self.logs
            # 处理组件函数
            if "Subgraph" in nextNode['type']:
                startNode = self.InitSubGraphInput(nextNode)
                logs, outputs = LiteGraph(self.app, self.parent, startNode).execute()
                nextNode['result'] = logs
                nextNode['params'] = outputs
            try:
                outputs = call_by_alias(nextNode['type'], nextNode)
            except Exception as e:
                error_details = traceback.format_exc()
                outputs = {"code": 2, "name": "error", "data": str(error_details)}
            if "Subgraph" in nextNode['type']:
                outputs['nodes'] = nextNode['result']
            if "node" in outputs:
                self.nodesDict[nextNode['id']] = outputs['node'] # update node properties
            self.outputs[nextNode['id']] = outputs['data']  # save outputs
            self.logs.append(outputs)  # save logs
            Logger.info(f"Executing LiteGraph Node[{nextNode['id']}] outputs :{outputs}")

            # finish execute
            if outputs['code'] == 3:
                self.initStatus(nextNode['type'][-1], 'end')
                return self.logs
            nextNode = self.findNextNode(nextNode, outputs['name'])
            self.ran += 1
        return self.logs, self.outputs

    def findStartNode(self):
        startNodes = []
        if "type" in self.startNode:
            startNodes = [node for node in self.nodes if self.startNode['type'] in node['type']]
        elif "id" in self.startNode:
            startNodes = [node for node in self.nodes if self.startNode['id'] == node['id']]

        if len(startNodes) == 0:
            return None
        CMDNode = []
        for node in startNodes:
            for outputs in node['outputs']:
                if outputs['type'] != 'cmd':
                    continue
                if outputs['name'] != self.startNode['slot']:
                    continue
                CMDNode.append(node)
                break
        if len(CMDNode) == 0:
            return None
        return CMDNode[0]

    def getStatus(self):
        return True
        data = read_json(f'{STATUS_PATH}{self.app["id"]}.json')
        if data is None:
            return True
        if data['status'] in ['stopping', 'running']:
            return False
        return True

    def initStatus(self, tag = '初始化', status = 'running'):
        try:
            data = read_json(f'{STATUS_PATH}{self.app["id"]}.json')
        except BaseException as e:
            write_json(
                f'{STATUS_PATH}{self.app["id"]}.json',
                {'id'   : self.app['id'], 'name': self.app['name'], 'status': status, 'tag': tag, 'step': self.ran,
                 'start': self.start}
            )
            return status

        if status == 'exit':
            write_json(
                f'{STATUS_PATH}{self.app["id"]}.json',
                {'id'   : self.app['id'], 'name': self.app['name'], 'status': 'end', 'tag': tag, 'step': self.ran,
                 'start': self.start}
            )
        if data:
            if data['status'] == 'stopping':
                return data['status']
        write_json(
            f'{STATUS_PATH}{self.app["id"]}.json',
            {'id'   : self.app['id'], 'name': self.app['name'], 'status': status, 'tag': tag, 'step': self.ran,
             'start': self.start}
        )

        return status

    def status(self):
        return self.ran > self.max_run

    def initLinks(self):
        self.links = [{
            'id'         : link[0],
            'output_id'  : link[1],
            'output_slot': link[2],
            'input_id'   : link[3],
            'input_slot' : link[4],
            'type'       : link[5],
        } for link in self.links]
        self.links = list_to_dict(self.links, 'id')

    def initNodes(self):
        for node in self.nodes:
            nodeFullType = node['type']
            if isinstance(nodeFullType, list):
                nodeFullType = nodeFullType[2]
                node['type'] = nodeFullType
            node['type'] = node['type'].split('(')
            if len(node['type']) == 2:
                node['type'][1] = node['type'][1].replace(')', '')
            node['type'].append(nodeFullType)
            node['app'] = {
                "id": self.app['id'],
            }
        self.nodesDict = list_to_dict(self.nodes, "id")

    def initNodesData(self, initNodes):
        # init input slot value
        for node in self.nodes:
            if has_intersection(initNodes, node['type']):
                node = self.InitInputValue(node)
        # set output slot value
        inputNodes = [node for node in self.nodes if has_intersection(initNodes, node['type'])]
        for node in inputNodes:
            output = call_by_alias(node['type'], node)
            Logger.info(f"Init node Type:{node['type']}")
            Logger.info(f"Init node output:{output}")
            self.outputs[node['id']] = output['data']

    def findNextNode(self, node, slotName):
        # find output cmd slot
        if has_intersection(node['type'], self.exitNodes):
            return None
        cmdOutput = [output for output in node['outputs'] if output['type'] == 'cmd' and output['name'] == slotName]
        cmdOutput = None if len(cmdOutput) == 0 else cmdOutput[0]
        if "JumpNode" in node['type'] and cmdOutput is not None:
            links = cmdOutput['links'] if cmdOutput['links'] is not None else []
            cmdOutput = None if len(links) == 0 else cmdOutput
        # jumpNode output links is none | start find jump target node
        if "JumpNode" in node['type'] and (cmdOutput is None or cmdOutput['links'] is None):
            # filter nodes to get jumpNodes
            jumpNodes = [_node for _node in self.nodes if node['id'] != _node['id'] and "JumpNode" in _node['type']]
            # find out the same name jumpNodes
            jumpNodes = [_node for _node in jumpNodes if node['properties']['name'] == _node['properties']['name']]
            # find outputs slot is linked node
            jumpNodes = [_node for _node in jumpNodes if
                         _node['outputs'][0]['links'] is not None and _node['inputs'][0]['link'] is None]
            if len(jumpNodes) == 0:
                return None
            return jumpNodes[0]
        if cmdOutput is None:
            return None
        if cmdOutput['links'] is None:
            return None
        # find slot link
        outputLinkID = None if len(cmdOutput['links']) == 0 else cmdOutput['links'][0]
        if outputLinkID is None:
            return None
        # return nextNode
        self.linkNow = self.links[outputLinkID]
        nextNode = self.nodesDict[self.linkNow['input_id']]
        if "DisplayGrid" in nextNode['type']:
            self.initNodesData(self.gridNodes)
        if "SubgraphOutput" in nextNode['type']:
            self.initNodesData(['SubgraphOutput'])
        return self.InitInputValue(nextNode)

    def InitInputValue(self, node):
        if "inputs" not in node:
            return node
        for inputSlot in node['inputs']:
            if inputSlot['link'] is None:
                inputSlot['value'] = None
                continue
            if inputSlot['type'] == 'cmd':
                continue
            link = self.links[inputSlot['link']]
            try:
                output = self.outputs[link['output_id']]
            except KeyError:
                continue
            try:
                inputSlot['value'] = output[link['output_slot']]
            except IndexError:
                continue
        node['parent'] = self.parent
        return node

    def InitSubGraphInput(self, node):
        CMDInput = node['inputs'][self.linkNow['input_slot']]
        startNode = {"type": "SubgraphInput", "slot": CMDInput['name']}
        SubgraphInputs = [SubInput for SubInput in node['inputs'] if "value" in SubInput]
        for SubNode in node['subgraph']['nodes']:
            if "SubgraphInput" not in SubNode['type']:
                continue
            SubgraphNodeOutput = SubNode['properties']
            SubNode['outputs'][0]['name'] = SubNode['properties']['name']
            for SubInput in SubgraphInputs:
                if SubInput['name'] == SubgraphNodeOutput['name'] and SubInput['type'] == SubgraphNodeOutput['type']:
                    SubNode['properties']['value'] = SubInput['value']
                    SubNode['outputs'][0]['value'] = SubInput['value']
                    break
        self.app['path'] = node['subgraph']
        return startNode


def index_exists(lst, index):
    return 0 <= index < len(lst)

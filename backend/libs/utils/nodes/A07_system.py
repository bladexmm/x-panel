
from libs.utils.nodes.base import alias, getInput, nodeOutput
from libs.utils.system.operator import getProcesses


@alias("系统/获取所有窗口(Windows)")
def Windows(node):
    return nodeOutput(1, node, 'out', ['',getProcesses('frontend')])
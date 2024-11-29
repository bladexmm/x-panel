
from libs.utils.nodes.base import alias, getInput, nodeOutput
from libs.utils.system.operator import getProcesses, getUsage


@alias("系统/获取所有窗口(Windows)")
def Windows(node):
    return nodeOutput(1, node, 'out', ['',getProcesses('frontend')])

@alias("系统/系统资源使用(SystemUsage)")
def SystemUsage(node):
    usage = getUsage()
    return nodeOutput(1, node, 'out', ['',usage['cpu'],usage['memory']])
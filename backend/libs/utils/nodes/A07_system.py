
from libs.utils.nodes.base import alias, getInput, nodeOutput
from libs.utils.system.operator import getProcesses, getUsage, setVolume, volume


@alias("系统/获取所有窗口(Windows)")
def Windows(node):
    return nodeOutput(1, node, 'out', ['',getProcesses('frontend')])

@alias("系统/系统资源使用(SystemUsage)")
def SystemUsage(node):
    usage = getUsage()
    return nodeOutput(1, node, 'out', ['',usage['cpu'],usage['memory']])

@alias("系统/设置音量(SetVolume)")
def updateVolume(node):
    data = getInput(node['input'], 1)
    if data != None:
        data = int(data)
        setVolume(data)
    return nodeOutput(1, node, 'out', ['',volume()])
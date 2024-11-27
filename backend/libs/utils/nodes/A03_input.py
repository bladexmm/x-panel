import json
from graphql_server import json_encode
from libs.utils.nodes.base import alias, nodeOutput


@alias("输入/文本(TextInput)")
def TextInput(node):
    return nodeOutput(1, node, 'out', [node['properties']['text']])


@alias("输入/列表(ArrayInput)")
def ArrayInput(node):
    array = node['properties']['value']
    if node['properties']['value'][0] in ["{","["]:
        array = json.loads(array)
    else:
        array = array.split("\n")
    return nodeOutput(1, node, 'out', [array])


@alias("输入/图片(ImageInput)")
def ImageInput(node):
    return nodeOutput(1, node, 'out', [node['properties']['image']])


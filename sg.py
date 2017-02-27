import json
from pprint import pprint

import boto3

def undirected_edge(node1, node2):
    if node1 < node2:
        return node1, node2
    else:
        return node2, node1

def node_json(groups):
    result = []
    for group in groups:
        ent = {
            'data': {
                 'id': group.id,
                 'name': group.group_name,
                 'longname': '{} {}'.format(group.id, group.group_name),
             }
        }
        
        result.append(ent)
    return result

def edge_json(edges):
    result = []
    for edge in edges:
        node1, node2 = edge
        ent = {
            'data': {
                'id': '{}_{}'.format(node1, node2),
                'source': node1,
                'target': node2,
             }
        }
        result.append(ent)
    return result

ec2 = boto3.resource('ec2')
vpc = ec2.Vpc('vpc-afa258c9')
groups = dict()
edges = set()

for group in vpc.security_groups.all():
    groups[group.id] = group

for group in groups.values():
    # ignore ip ranges for now
    # ignore external userIds for now

    group_id1 = group.id
    for rule in group.ip_permissions:
        for pair in rule['UserIdGroupPairs']:
            group_id2 = pair['GroupId']
            edge = undirected_edge(group_id1, group_id2)
            edges.add(edge)

print('var security_group_data = {"nodes": ')
pprint(node_json(groups.values()))
print(',')
print('"edges": ')
pprint(edge_json(edges))
print('};')

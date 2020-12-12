
import socket
from threading import Thread
import json

descs = {}
with open("descs.json") as fp:
    descs = json.loads(fp.read())

depts = ['CS', 'PSY', 'ENG', 'MAT', 'ECO', 'PHI', 'HIS']

codeToDept = {
    'CS': 'Computer Science',
    'PSY': 'Psychology',
    'ENG': 'English',
    'MAT': 'Mathematics',
    'ECO': 'Economics',
    'PHI': 'Philosophy',
    'HIS': 'History'
}

deptOfferings = {
    'Computer Science': [],
    'Psychology': [],
    'English': [],
    'Mathematics': [],
    'Economics': [],
    'Philosophy': [],
    'History': []
}

for ls in descs.keys():
    prefix = ls.split("-")[0]
    courseIdentifier = f"{descs[ls]['CourseCode']}: {descs[ls]['CourseTitle']}"
    deptOfferings[codeToDept[prefix]].append(courseIdentifier)

print(deptOfferings)

serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
serversocket.bind(('127.0.0.1', 42069))
serversocket.listen()

print('Server is running! (IP Address %s, Port %s)' % ('127.0.0.1', 42069))

def func(clientsocket, address):
    print("A client just connected.")
    try:
        depts = list(deptOfferings.keys())
        reply1 = json.dumps({"type": "init", "payload": depts})
        clientsocket.send(reply1.encode())

        while True:
            infoReq = json.loads(clientsocket.recv(1024).decode())
            reply2 = ""
            if infoReq['type'] == 'offerings':
                if infoReq['payload'] in deptOfferings:
                    reply2 = json.dumps({'type': 'deptOfferings','success': True, 'offerings': deptOfferings[infoReq['payload']]})
                else:
                    reply2 = json.dumps({'type': 'deptOfferings','success': False, 'msg': 'Sorry, we could not find that department.'})
            elif infoReq['type'] == 'courseDesc':
                if infoReq['payload'] in descs:
                    reply2 = json.dumps({'type': 'courseDesc', 'success': True, 'payload': descs[infoReq['payload']]})
                else:
                    reply2 = json.dumps({'type': 'courseDesc', 'success': False, 'msg': 'Sorry, we could not find that course.'})
            elif infoReq['type'] == 'exit':
                clientsocket.close()
                return
            clientsocket.send(reply2.encode())
    except ConnectionResetError:
        print("A client just disconnected.")
        return

try:
    while True:
        (clientsocket, address) = serversocket.accept()
        Thread(target=func, args=(clientsocket, address)).start()
except KeyboardInterrupt:
    exit()
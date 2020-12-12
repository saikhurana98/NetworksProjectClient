from bs4 import BeautifulSoup
import requests
import json

userSessionId = "" # Session ID (in the cookie of an Ashoka student)

lses = ""
with open("allLSes.json") as fp:
    lses = json.loads(fp.read())

depts = ['CS', 'PSY', 'ENG', 'MAT', 'ECO', 'PHI', 'HIS']

descs = {}

for ls in lses:
    if ls["CourseCode"].split("-")[0] in depts:
        params = {"TTMAutoId":"19","CourseCode":ls["CourseCode"],"LSCode":ls["LSCode"],"DSCode":"0"}
        cookies=  {'ASP.NET_SessionId': userSessionId}
        data = requests.post('https://lms.ashoka.edu.in/Contents/Masters/ProgramPage.aspx/GetDataCourseCatalog', cookies=cookies, json=params).json()['d']
        soup = BeautifulSoup(data, 'html.parser')
        try:
            description = soup.findAll('div', {'class':'cmsDescp'})[2].text
            descs[ls["CourseCode"]] = ls
            descs[ls["CourseCode"]]["desc"] = description
            print(ls["CourseCode"])
        except IndexError:
            continue


with open("descs.json","w+") as fp:
    json.dump(descs, fp, indent=4)

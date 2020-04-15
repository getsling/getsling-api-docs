' Script is designed to be run with cscript.exe

' Get command line arguments.
token = WScript.Arguments.Item(0)
org = WScript.Arguments.Item(1)
user = WScript.Arguments.Item(2)
' TODO: This should use a proper URL encoder.
dates = Replace(WScript.Arguments.Item(3), "/", "%2F")

' Define the request.
Set http = CreateObject("MSXML2.ServerXMLHTTP")
api = "https://test-api.getsling.com/calendar/"
url = api & org & "/users/" & user & "?dates=" & dates
http.Open "GET", url, False
http.SetRequestHeader "Authorization", token
http.SetRequestHeader "Accept", "*/*"

' Request the data.
http.Send
WScript.echo http.ResponseText

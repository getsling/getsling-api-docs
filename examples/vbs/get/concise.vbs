' Script is designed to be run with cscript.exe

' Get command line arguments.
token = WScript.Arguments.Item(0)

' Define the request.
Set http = CreateObject("MSXML2.ServerXMLHTTP")
url = "https://api.getsling.com/users/concise"
http.Open "GET", url, False
http.SetRequestHeader "Authorization", token
http.SetRequestHeader "Accept", "*/*"

' Request the data.
http.Send
WScript.echo http.ResponseText

' Script is designed to be run with cscript.exe

' Get command line arguments.
email = WScript.Arguments.Item(0)
password = WScript.Arguments.Item(1)

' Define the request.
Set http = CreateObject("MSXML2.ServerXMLHTTP")
url = "https://api.getsling.com/account/login"
http.Open "POST", url, False
http.SetRequestHeader "Content-Type", "application/json"
http.SetRequestHeader "Accept", "*/*"

' Request the token.
json = "{""email"":""" & email & """, ""password"":""" & password & """}"
http.Send json
WScript.echo http.GetResponseHeader("Authorization")

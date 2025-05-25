# API Endpoints

## POST /extract

### curl

<code>
curl -X POST https://jsonly.io/extract \<br/>
  -H "client_id: YOUR_CLIENT_ID" \<br/>
  -H "client_secret: YOUR_CLIENT_SECRET" \<br/>
  -F "file=@/path/to/your/file.pdf" \<br/>
  -F "template_id=your-template-id"
</code>

### python

```py
import requests

url = "https://jsonly.io/extract"
headers = {
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET"
}
files = {
    "file": open("file.pdf", "rb")
}
data = {
    "template_id": "your-template-id"
}

response = requests.post(url, headers=headers, files=files, data=data)
print(response.json())
```

### Postman

Collection: [jsonly-postman-collection](jsonly_postman_collection.json){:download="jsonly-postman.json"}
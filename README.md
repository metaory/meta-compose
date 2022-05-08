## Meta Video Compose

## Requirements
- `docker compose`

## How to run
``` 
docker-compose up
```

#### client at
[localhost:3000](http://localhost:3000)

#### api at
[localhost](http://localhost)

[localhost/videos?page=1&per_page=1000&min_views=42](http://localhost/videos?page=1&per_page=1000&min_views=42)

#### database at
`localhost:3306`

for example;
```
curl --request GET \
  --url 'http://localhost/videos?page=1&per_page=22&min_views=59&is_private=0' \
  --header 'Content-Type: application/json' \
}'
```

## TODOs
- client pagination
- search feature
- list sorting feature


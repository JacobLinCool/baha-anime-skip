# baha-anime-skip-db

Database.

Schema:

```ts
{
    "episode-sn": {
        "chapter-type": [start, duration]
    }
}
```

Common chapter types: - `"OP"` - `"ED"`

The unit of `start` and `duration` is second. (can be float)

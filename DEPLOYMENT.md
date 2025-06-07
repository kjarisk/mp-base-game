# Deployment

This project can be served behind Nginx as a reverse proxy. Below is a sample configuration that proxies requests to the Node.js server running on port 3000.

```nginx
server {
  listen 80;
  server_name multiplayer.wonderspants.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Enable the configuration and check that Nginx is healthy:

```bash
sudo ln -s /etc/nginx/sites-available/multiplayer.wonderspants.com /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl reload nginx
```

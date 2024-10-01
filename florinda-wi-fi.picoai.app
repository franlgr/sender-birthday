server {
    listen 80;
    server_name florinda-wi-fi.picoai.app;

    # SSL configuration
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    ssl_certificate /etc/ssl/certBfc.pem;
    ssl_certificate_key /etc/ssl/keyBfc.pem;

    location / {
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_pass http://localhost:3535;
    }
}

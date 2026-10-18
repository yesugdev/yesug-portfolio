# yesuvd.tech дээр байршуулах

Portfolio нь өөрийн MongoDB-тэй тусдаа docker compose төсөл бөгөөд `fx-nginx-1` container-ийн network-д холбогдож, nginx `yesuvd.tech`-ийг түүн рүү чиглүүлнэ.

## 0. DNS
`yesuvd.tech` болон `www.yesuvd.tech`-ийн A record сервер IP руу заасан байх ёстой.

## 1. Сервер дээрх nginx-ийн тохиргоог олох
```bash
docker inspect fx-nginx-1 --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}'
docker inspect fx-nginx-1 --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{println}}{{end}}'
```
Эхнийх нь network нэр (жишээ: `fx_default`), хоёр дахь нь nginx config болон SSL сертификатын хавтас.

## 2. Кодоо татаж ажиллуулах
```bash
cd ~ && git clone https://github.com/yesugdev/yesug-portfolio.git portfolio && cd portfolio
cp .env.example .env && nano .env      # ADMIN_PASSWORD, PROXY_NETWORK-оо засна
docker compose up -d --build
docker compose ps                        # app, mongo хоёулаа healthy болно
```

## 3. Өгөгдлөө шилжүүлэх (локал → сервер)
Локал компьютер дээр:
```bash
scp portfolio.archive root@SERVER_IP:~/portfolio/
```
Сервер дээр:
```bash
cd ~/portfolio && docker compose exec -T mongo mongorestore --gzip --archive --drop < portfolio.archive
```

## 4. SSL сертификат
Port 80-ийн нийтлэг блок ACME шалгалтыг дамжуулдаг тул nginx-д хүрэх шаардлагагүй:
```bash
docker run --rm -v fx_certbot-conf:/etc/letsencrypt -v fx_certbot-www:/var/www/certbot \
  certbot/certbot certonly --webroot -w /var/www/certbot -d yesuvd.tech -d www.yesuvd.tech
```

## 5. Nginx template (fx төсөлд)
```bash
cp deploy/portfolio.conf.template /opt/fx/nginx/templates/
cd /opt/fx && cp docker-compose.yml docker-compose.yml.bak && cp .env .env.bak
sed -i 's/^\( *\)MY_DOMAIN: \${MY_DOMAIN:-}$/&\n\1PORTFOLIO_DOMAIN: ${PORTFOLIO_DOMAIN:-}/' docker-compose.yml
sed -i 's/NGINX_ENVSUBST_FILTER: TLS_DOMAIN|ALGO_DOMAIN|MY_DOMAIN$/&|PORTFOLIO_DOMAIN/' docker-compose.yml
sed -i 's#^\( *\)- ./nginx/templates/\${MY_TEMPLATE:-none}.conf.template:/etc/nginx/templates/40-my.conf.template:ro$#&\n\1- ./nginx/templates/${PORTFOLIO_TEMPLATE:-none}.conf.template:/etc/nginx/templates/50-portfolio.conf.template:ro#' docker-compose.yml
printf 'PORTFOLIO_DOMAIN=yesuvd.tech\nPORTFOLIO_TEMPLATE=portfolio\n' >> .env
diff docker-compose.yml.bak docker-compose.yml        # 3 мөр нэмэгдсэн байх ёстой
docker compose run --rm --no-deps nginx nginx -t      # ажиллаж буй nginx-д хүрэхгүйгээр шалгана
docker compose up -d nginx                            # зөвхөн nginx дахин үүснэ (1–2 сек)
```
Буцаах: `cp docker-compose.yml.bak docker-compose.yml && cp .env.bak .env && docker compose up -d nginx`

## Шинэчлэх
```bash
cd ~/portfolio && git pull && docker compose up -d --build
```

## Нөөц хуулбар
```bash
docker compose exec -T mongo mongodump --gzip --archive > backup-$(date +%F).archive
```

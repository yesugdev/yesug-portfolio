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
docker volume create portfolio_mongo-data   # өгөгдлийн volume (нэг удаа)
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

## Аюулгүй ажиллагаа

Энэ сервер дээр олон төсөл нэг nginx-ийг хуваалцдаг. Дараах командуудыг **хэзээ ч бүү ажиллуул**:

| Команд | Юу болох вэ |
|---|---|
| `docker system prune -a --volumes` | Зогссон container-ийн volume (өгөгдөл) устна |
| `docker volume prune` / `docker volume rm ...` | MongoDB-ийн өгөгдөл устна |
| `docker rm -f fx-nginx-1` | Бүх subdomain зогсоно |
| `/opt/fx` дотор `docker compose down` | fx болон nginx зогсож, бүх сайт унана |

Аюулгүй командууд:

- Portfolio шинэчлэх: `cd ~/portfolio && git pull && docker compose up -d --build`. Зөвхөн portfolio дахин асна.
- Nginx-ийн тохиргоо өөрчлөх: эхлээд `docker exec fx-nginx-1 nginx -t`, амжилттай бол `docker exec fx-nginx-1 nginx -s reload`. Container-ийг дахин үүсгэхгүй.
- `docker compose down -v` ч portfolio-гийн өгөгдлийг устгахгүй. Volume нь `external` тул гараар `docker volume rm` хийхгүй бол үлдэнэ.

Nginx-ийн тохиргоо (learn, portfolio) `/opt/fx/docker-compose.yml`-д mount хийгдсэн тул nginx дахин үүссэн ч алга болохгүй. Шинэ сайт нэмэхдээ ч container руу `docker cp` хийлгүй, ижил аргаар mount нэмнэ.

### Өдөр тутмын нөөц
```bash
mkdir -p /root/backups/portfolio
(crontab -l 2>/dev/null; echo "0 3 * * * /root/portfolio/deploy/backup.sh >> /root/backups/portfolio/backup.log 2>&1") | crontab -
/root/portfolio/deploy/backup.sh      # одоо нэг удаа туршина
```
Сэргээх: `docker compose exec -T mongo mongorestore --gzip --archive --drop < /root/backups/portfolio/<файл>.archive`

Сервер бүхэлдээ эвдэрвэл нөөц алга болно. Тиймээс сард нэг удаа компьютер руугаа татаж аваарай:
`scp -r root@SERVER_IP:/root/backups/portfolio ./`

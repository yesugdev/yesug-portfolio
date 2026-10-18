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
Бусад subdomain-ууд ямар аргаар сертификат авсныг шалгана (1-р алхмын mount-уудаас `/etc/letsencrypt` хайна).
Certbot-оор (nginx-ийн `/.well-known/acme-challenge/` нь `/var/www/certbot`-д mount хийгдсэн бол):
```bash
certbot certonly --webroot -w <certbot webroot хавтас> -d yesuvd.tech -d www.yesuvd.tech
```
Эсвэл nginx-ийг түр зогсоогоод: `certbot certonly --standalone -d yesuvd.tech -d www.yesuvd.tech`

## 5. Nginx тохиргоо
`deploy/yesuvd.tech.conf`-ийг nginx-ийн conf.d хавтаст хуулна (1-р алхмаас олсон замаар):
```bash
cp deploy/yesuvd.tech.conf <nginx conf.d хавтас>/
docker exec fx-nginx-1 nginx -t && docker exec fx-nginx-1 nginx -s reload
```

## Шинэчлэх
```bash
cd ~/portfolio && git pull && docker compose up -d --build
```

## Нөөц хуулбар
```bash
docker compose exec -T mongo mongodump --gzip --archive > backup-$(date +%F).archive
```

# This repo is full of hacks

This is the fastest, dirtiest hacking together of calling smart contracts all in a row to accomplish a specific purpose: compounding my CELO-UBE farming pool returns. Don't expect beauty or truth. Hopefully money is enough for you.

## Paste in your private key into .env

Yes, that's right Mr. Decentralization. So read the code and understand it before doing that.

# Deployment

If you love the magic that is running this manually, then you will be swimmingly happy with the joy of putting this in a cronjob on a server.

We recommend flatcar, a container OS that only runs docker containers. Build this Dockerfile (check `.github/workflows/dockerhub.yml`), or just pull from the public Dockerhub (`dukejones/autoube`).

`ssh core@my-ip-address`

`vim ~/.env` # put your env here including private key

`docker pull dukejones/autoube`

`docker run --env-file ~/.env --restart always -d --name autoube dukejones/autoube`

### See it running

`docker logs -f autoube`

### Destroy it (before updating and restarting)

`docker rm -f autoube`

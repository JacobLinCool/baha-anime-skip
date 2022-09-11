# Baha Anime Skip

Skip OP or other things on Bahamut Anime.

## Database

Database is stored in [`packages/baha-anime-skip-db/data.json`](packages/baha-anime-skip-db/data.json).

Currently, the database includes OP data of 2000+ episodes. Most of them are automatically detected by programs based on some hypotheses, source code is available in [`helper`](packages/helper) and [`marker`](packages/marker).

**Any PRs or Issues are welcome.**

The schema details are in [`packages/baha-anime-skip-db/README.md`](packages/baha-anime-skip-db/README.md).

## Tampermonkey Script

> Prerequisite: Tampermonkey installed.

Install from [here](https://raw.githubusercontent.com/JacobLinCool/baha-anime-skip/dist/index.user.js).

The button will show up if there is a event record for the current episode and the time is in the event range.

![Screenshot](./images/screenshot.png)

A panel with report link and debug info is also attached. If you click the link, a pre-filled issue will be opened in this repo.

![Panel](./images/panel.png)

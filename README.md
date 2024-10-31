# LaaS Cloudflare Worker Example

## wrangler 설치

wrangler는 Rust로 작성되어있고, npm이나 cargo로 설치가 가능합니다.

```sh
npm i wrangler -g
# or
cargo install wrangler
```

Workers 프로젝트 생성, 설정, 빌드, 배포 등을 모두 wrangler를 통해서 수행하게 됩니다.

## 프로젝트 실행

wrangler는 앱을 배포하기 전에 실행해보는 두 가지 방법을 제공합니다.

1. wrangler dev: 로컬 환경에서 코드 실행
2. wrangler preview: Cloudflare Workers Playground에 코드를 업로드하여 실행

```sh
# Local
wrangler dev
# Cloudflare Workers Playground
wrangler preview --watch
```

## Worker 배포

```sh
wrangler login

wrangler publish
```

전체 Wrangler CLI 명령어는 [여기](https://developers.cloudflare.com/workers/tooling/wrangler/commands/)를 참고하세요.

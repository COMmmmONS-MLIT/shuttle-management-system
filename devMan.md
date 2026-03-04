# 環境構築マニュアル

## 1. 本書について

本書では、共同送迎管理システム（以下「本システム」という）の環境構築手順について記載しています。本システムの構成や仕様の詳細については以下も参考にしてください。

[技術検証レポート]

## 2. 動作環境

本システムの動作環境は以下のとおりです。

### サーバー環境

| 項目   | 最小動作環境            | 推奨動作環境 |
| ------ | ----------------------- | ------------ |
| OS     | Linux（Docker対応環境） | 同左         |
| CPU    | 2コア以上               | 同左         |
| メモリ | 4GB以上                 | 8GB以上      |
| Docker | Docker 20.10以上        | 同左         |

### 利用技術

#### フロントエンド

| 種別           | 名称       | バージョン |
| -------------- | ---------- | ---------- |
| フレームワーク | Next.js    | 14.2.3     |
| ライブラリ     | React      | 18.2.0     |
| 言語           | TypeScript | 5.0.4      |

#### バックエンド

| 種別           | 名称          | バージョン |
| -------------- | ------------- | ---------- |
| 言語           | Ruby          | 3.3.0      |
| フレームワーク | Ruby on Rails | 7.1.3      |
| データベース   | MySQL         | 8.3.0      |

### クライアント環境

| 項目               | 動作環境                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| 対応ブラウザ       | Google Chrome（最新版）、Mozilla Firefox（最新版）、Microsoft Edge（最新版）、Safari（最新版） |
| ディスプレイ解像度 | 1280×720以上                                                                                   |
| ネットワーク       | Google Maps APIへの接続が必要                                                                  |

## 3. 準備物

本システムを利用するために、以下のものを準備してください。

| 項目                 | 用途                   | 入手方法                                                           |
| -------------------- | ---------------------- | ------------------------------------------------------------------ |
| Google Maps API キー | 地図表示、ルート最適化 | [Google Cloud Console](https://console.cloud.google.com/) から取得 |

### Google Maps API キーの取得手順

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「APIキー」を選択
5. 以下のAPIを有効化
   - Maps JavaScript API
   - Directions API
   - Geocoding API

## 4. フォルダ構成

GitHubからダウンロードしたソースファイルの構成は以下のとおりです。

```
MaaS08/
├── docker-compose.yml    # Docker Compose設定ファイル
├── .env.sample           # 環境変数サンプルファイル
├── server/               # バックエンドAPI（Ruby on Rails）
│   ├── Dockerfile
│   ├── Gemfile
│   ├── app/              # アプリケーションコード
│   ├── config/           # 設定ファイル
│   ├── db/               # データベース関連
│   └── ...
└── front/                # フロントエンド（Next.js）
    ├── Dockerfile
    ├── package.json
    ├── src/              # ソースコード
    └── ...
```

## 5. AWS EC2 でのデプロイ手順

### 5.1 EC2 インスタンスの作成

1. [AWS マネジメントコンソール](https://console.aws.amazon.com/) にログイン
2. EC2 サービスに移動し、「インスタンスを起動」をクリック
3. 以下の設定でインスタンスを作成

| 項目               | 推奨設定                          |
| ------------------ | --------------------------------- |
| AMI                | Ubuntu Server 24.04 LTS（64-bit） |
| インスタンスタイプ | t2.large 以上（2vCPU / 8GB RAM）  |
| ストレージ         | 20GB 以上（gp3 推奨）             |

### 5.2 セキュリティグループの設定

EC2 インスタンスのセキュリティグループに以下のインバウンドルールを追加します。

| タイプ       | プロトコル | ポート範囲 | ソース             | 用途             |
| ------------ | ---------- | ---------- | ------------------ | ---------------- |
| SSH          | TCP        | 22         | 自分の IP アドレス | SSH 接続         |
| カスタム TCP | TCP        | 8080       | 0.0.0.0/0          | フロントエンド   |
| カスタム TCP | TCP        | 3000       | 0.0.0.0/0          | バックエンド API |

> **注意:** 本番環境では、ポート 8080 / 3000 のソースを必要な IP に限定することを推奨します。

### 5.3 EC2 インスタンスへの接続

キーペア（.pem ファイル）を使って SSH 接続します。

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2のパブリックIPアドレス>
```

### 5.4 Docker・Git のインストール

```bash
# パッケージリストの更新
sudo apt-get update

# Git のインストール
sudo apt-get install -y git

# Docker のインストール（Docker Compose 含む）
curl -fsSL https://get.docker.com | sh
```

### 5.5 アプリケーションのセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/COMmmmONS-MLIT/shuttle-management-system.git
cd shuttle-management-system

# 環境変数ファイルの作成
cp .env.sample .env

# 環境変数を編集（Google Maps API キー等を設定）
nano .env
```

`.env` ファイルに以下を設定します。

```bash
# 必須
GOOGLE_MAP_API_KEY=<取得したGoogle Map API KEY>
PUBLIC_HOST=<EC2のパブリックIP>

# 任意（デフォルト値を変更する場合）
FRONT_PORT=8080
API_PORT=3000
DB_PORT=3306

# データベース設定
MYSQL_ALLOW_EMPTY_PASSWORD=yes
RAILS_DATABASE_USER=root
RAILS_DATABASE_PASSWORD=
```

### 5.6 コンテナの起動

```bash
sudo docker compose up -d
```

初回起動時はイメージのビルドとデータベースのセットアップが自動で行われます（数分かかる場合があります）。

### 5.7 初期設定

起動後、ブラウザで以下にアクセスして初期管理者ユーザーを作成します。

```
http://<EC2のパブリックIPアドレス>:8080/install
```

> **補足:** ALB（Application Load Balancer）を使用する場合、ALB のリスナーをポート 80/443 に設定し、EC2 のポート 8080 へフォワードすることでポート番号なしのURLでアクセスできます。

### 5.8 動作確認

```bash
# コンテナの状態確認
sudo docker compose ps

# ログの確認
sudo docker compose logs -f
```

すべてのコンテナが `Up` 状態であれば正常に起動しています。

## 6. トラブルシューティング

### コンテナが起動しない

```bash
# コンテナの状態確認
sudo docker compose ps

# ログの確認
sudo docker compose logs
```

### ポートが既に使用されている

`.env` ファイルでポート番号を変更してください。

```bash
FRONT_PORT=8081
API_PORT=3001
DB_PORT=3307
```

---

## （参考）ローカル環境での構築手順

開発やテスト目的でローカルマシン上に環境を構築する場合の手順です。

### 前提条件

- Docker および Docker Compose がインストールされていること
- Git がインストールされていること

### セットアップ手順

#### (1) リポジトリのクローン

```bash
git clone https://github.com/COMmmmONS-MLIT/shuttle-management-system.git
cd shuttle-management-system
```

#### (2) 環境変数ファイルの作成

```bash
cp .env.sample .env
```

`.env` ファイルに以下を設定します。

```bash
# 必須
GOOGLE_MAP_API_KEY=<取得したGoogle Map API KEY>

# ローカル環境ではPUBLIC_HOSTはlocalhostのまま（設定不要）
```

#### (3) コンテナの起動

```bash
docker compose up -d
```

初回起動時は、イメージのビルドとデータベースのセットアップが行われます。

### 初期設定

ブラウザで http://localhost:8080/install にアクセスし、初期管理者ユーザーを作成してください。

### 開発用コマンド

```bash
# コンテナの起動
docker compose up -d

# コンテナの停止
docker compose down

# コンテナのログ確認
docker compose logs -f

# 特定サービスのログ確認
docker compose logs -f server
docker compose logs -f front
```

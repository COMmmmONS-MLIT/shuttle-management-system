#!/bin/bash
set -e

# PIDファイルが残っていた場合に削除
rm -f tmp/pids/server.pid

# DBが作成済みかチェックし、未作成なら初期セットアップを実行
if ! bundle exec rails db:version > /dev/null 2>&1; then
  echo "==> データベースを作成しています..."
  bundle exec rake db:create
  echo "==> スキーマを適用しています..."
  bundle exec rake db:apply
  echo "==> シードデータを投入しています..."
  bundle exec rails db:seed_fu
  bundle exec rake import:post_codes
  echo "==> 初期セットアップ完了"
fi

exec "$@"

# トーラム攻略データベース（非公式）

## 各ファイルの役割
- index.html：ページの骨組み / style.css：見た目 / script.js：検索・表示の動作
- data/*.json：攻略データ本体（あなたが編集するのは基本ここだけ）
  - items 装備以外のアイテム、equipment 装備、monsters モンスター、skills スキル、materials 素材、recipes 製作レシピ、crystas クリスタ、maps マップ、builds ビルド

## データの書き方
各ファイルは `{"category":"…","records":[ {…}, {…} ]}` の形です。`records` の中に1件ずつ `{}` で追加し、件と件の間は `,`（カンマ）で区切ります（最後の件の後ろには付けません）。
共通項目：id（重複禁止）/ name / category / aliases（別名の配列）/ description / sources（出典URLの配列）/ verified（確認済みなら true）/ updatedAt（例 2026-10-13）
別のデータとの関連は、相手の id を書きます。例：`"dropFrom":["monster-001"]`、`"materials":[{"id":"material-001","qty":3}]`

## 新しい装備を追加する
1. GitHubで data/equipment.json を開き、鉛筆アイコン（編集）を押す。
2. `"records": [` の下にある既存の1件（`{` から `}` まで）をコピーして、`},` の後ろに貼る。
3. id・name・各項目を書き換える。分からない項目は書かない（画面に「情報未登録」と出ます）。
4. 出典を確認できた情報だけ `"verified": true` にし、`sources` にURLを入れる。サンプルは `"isSample"` の行を消す。

## モンスターを追加する
data/monsters.json で同じ手順です。ドロップは素材やアイテムの id を `drops` に書きます。

## 既存情報を修正する
該当ファイルを開き、鉛筆アイコンから文字を直し、updatedAt も更新します。

## IDの重複を防ぐ
`種類-3桁の番号`（例 equipment-001, equipment-002）で、番号は必ず増やす。画面上部に赤い警告が出たら重複です。IDは後から変えないでください（他のデータから参照されるため）。

## JSONの記述ミスを確認する
- 保存後、公開ページを開き、赤い帯の警告が出ていないか確認。
- ミスの定番：カンマの付け忘れ／余分、`"` の閉じ忘れ、`[ ]` `{ }` の数の不一致。
- 保存前に、編集画面のプレビューや https://jsonlint.com で確認できます。

## 変更を公開サイトへ反映する
編集画面右上の「Commit changes…」→「Commit changes」。1〜2分で公開サイトに反映されます（反映されない時は再読み込み）。

## 間違えた変更を戻す
リポジトリ上部の「Commits」→ 戻したい変更を開く → ファイル右の「…」→「View file」から古い内容をコピーして貼り直し、再度Commit。

## バックアップ
リポジトリのトップで「Code」→「Download ZIP」を、ときどき保存（ファイルAppへ）。

## iPhoneだけで公開する
1. SafariでGitHubにログインし、右上「＋」→「New repository」。名前は toram-database、Publicで作成。
2. 「uploading an existing file」から、ZIPを解凍したファイルをアップロード（フォルダごとでOK。data フォルダも含める）。index.html が一番上の階層にあること。
3. Settings → Pages → Branch を main、フォルダは /(root) にして Save。
4. 数分後、表示されたURL（https://ユーザー名.github.io/toram-database/）で公開されます。

## 注意
- 他サイトの文章・画像の転載はせず、利用規約を確認し、自分の言葉で書いてください。
- 初期データはすべて「サンプルデータ」です。

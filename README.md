# これ何？

画像を入れるとwebmがぽんぽん吐き出されるツールです。

- 出力先はローカルディレクトリ（Native File System API使用）

下記の３つの方法で放り込むことができます。

- 画像ドロップでの入力
- クリップボードペーストでの入力
- ファイルダイアログでの入力

変換はWASM(libwebp)で行われます。
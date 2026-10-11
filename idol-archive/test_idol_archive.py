"""執行：python3 -m unittest test_idol_archive.py"""
import json
import tempfile
import unittest
from pathlib import Path

import idol_archive as ia


def write_ytd(path: Path, name: str, data):
    path.write_text(f"window.YTD.{name}.part0 = {json.dumps(data, ensure_ascii=False)}", encoding="utf-8")


class ArchiveTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.arc = ia.Archive(self.dir / "db" / "archive.db")

    def tearDown(self):
        self.arc.db.close()
        self.tmp.cleanup()

    def make_export(self) -> Path:
        root = self.dir / "export"
        data = root / "data"
        (data / "tweets_media").mkdir(parents=True)
        (data / "tweets_media" / "1500000000000000000-abc.jpg").write_bytes(b"jpg")
        write_ytd(data / "account.js", "account", [{"account": {"username": "me", "accountDisplayName": "我"}}])
        write_ytd(data / "tweets.js", "tweets", [{"tweet": {
            "id_str": "1500000000000000000",
            "full_text": "今天的ＬＩＶＥ好棒 &amp; 感動 https://t.co/abc https://t.co/pic",
            "created_at": "Fri Mar 04 12:00:00 +0000 2022",
            "entities": {"urls": [{"url": "https://t.co/abc", "expanded_url": "https://example.com/live"}],
                         "media": [{"url": "https://t.co/pic"}]},
            "extended_entities": {"media": [{"type": "photo", "media_url_https": "https://pbs.twimg.com/media/X.jpg"}]},
            "favorite_count": "12", "retweet_count": "3", "lang": "ja"}}])
        write_ytd(data / "like.js", "like", [
            {"like": {"tweetId": "1600000000000000000", "fullText": "新曲 MV 公開！",
                      "expandedUrl": "https://twitter.com/i/web/status/1600000000000000000"}},
            {"like": {"tweetId": "1610000000000000000", "fullText": "無關的貼文",
                      "expandedUrl": "https://twitter.com/i/web/status/1610000000000000000"}}])
        return root

    def test_snowflake(self):
        self.assertEqual(ia.snowflake_time("1500000000000000000"), "2022-03-05T06:47:23Z")
        self.assertEqual(ia.snowflake_time("20"), "")

    def test_parse_archive(self):
        items = ia.parse_archive(self.make_export())
        self.assertEqual([k for _, k in items], ["tweet", "like", "like"])
        t = items[0][0]
        self.assertEqual(t["author_username"], "me")
        self.assertEqual(t["created_at"], "2022-03-04T12:00:00Z")
        self.assertEqual(t["text"], "今天的ＬＩＶＥ好棒 & 感動 https://example.com/live")
        self.assertEqual(t["likes"], 12)
        self.assertEqual(len(t["media"]), 2)

    def test_import_cli_and_search(self):
        root = self.make_export()
        db = str(self.dir / "db" / "archive.db")
        ia.main(["--db", db, "import-archive", str(root), "--tags", "推し", "--match", "live,新曲"])
        self.arc = ia.Archive(db)
        rows, total = self.arc.search()
        self.assertEqual(total, 2)  # 「無關的貼文」被 --match 排除
        # 全形/半形、大小寫都能找到
        self.assertEqual(self.arc.search("live")[1], 1)
        self.assertEqual(self.arc.search("ＬＩＶＥ")[1], 1)
        # 標籤也可被搜尋與篩選
        self.assertEqual(self.arc.search(tag="推し")[1], 2)
        # OR / 排除 / 日期
        self.assertEqual(self.arc.search("live|新曲")[1], 2)
        self.assertEqual(self.arc.search("推し -新曲")[1], 1)
        self.assertEqual(self.arc.search(date_from="2022-11", date_to="2022-12")[1], 1)
        self.assertEqual(self.arc.search(date_to="2022-03-04")[1], 1)
        self.assertEqual(self.arc.search(has_media=True)[1], 1)
        # 封存檔的圖片被複製進資料庫資料夾
        local = [m["local"] for m in self.arc.search("live")[0][0]["media"] if m["local"]]
        self.assertTrue(local and Path(local[0]).parent == self.arc.media_dir)

    def test_upsert_merges(self):
        self.arc.upsert({"id": "1600000000000000000", "text": "abc", "source": "like"}, ["a"])
        self.arc.upsert({"id": "1600000000000000000", "text": "", "author_username": "idol",
                         "source": "url"}, ["b"])
        r = self.arc.search()[0][0]
        self.assertEqual((r["text"], r["author_username"], r["source"]), ("abc", "idol", "like,url"))
        self.assertEqual(r["tags"], ["a", "b"])
        self.assertEqual(self.arc.search(author="@IDOL")[1], 1)

    def test_like_escape(self):
        self.arc.upsert({"id": "1", "text": "100% 本物"})
        self.arc.upsert({"id": "2", "text": "1000 本物"})
        self.assertEqual(self.arc.search("100%")[1], 1)
        self.assertEqual(self.arc.search('"100% 本物"')[1], 1)

    def test_parse_oembed(self):
        data = {"author_name": "偶像", "author_url": "https://twitter.com/idol",
                "html": '<blockquote class="twitter-tweet"><p lang="zh" dir="ltr">大家好&amp;謝謝<br>'
                        '<a href="https://t.co/x">#生日</a> <a href="https://t.co/p">pic.twitter.com/p</a></p>'
                        '&mdash; 偶像 (@idol) <a href="https://twitter.com/idol/status/123">Jan 1</a></blockquote>'}
        t = ia.parse_oembed(data, "123")
        self.assertEqual(t["text"], "大家好&謝謝\n#生日")
        self.assertEqual(t["author_username"], "idol")
        self.assertEqual(t["lang"], "zh")
        self.assertEqual(len(t["media"]), 1)

    def test_parse_status_url(self):
        self.assertEqual(ia.parse_status_url("https://x.com/idol/status/123?s=20"), ("idol", "123"))
        self.assertEqual(ia.parse_status_url("https://mobile.twitter.com/i/web/status/9"), ("", "9"))
        self.assertIsNone(ia.parse_status_url("https://example.com"))

    def test_parse_api_page(self):
        page = {"data": [{"id": "5", "author_id": "u1", "text": "hi https://t.co/a",
                          "created_at": "2024-05-01T10:00:00.000Z",
                          "entities": {"urls": [{"url": "https://t.co/a", "expanded_url": "https://a.com"}]},
                          "attachments": {"media_keys": ["m1"]},
                          "public_metrics": {"like_count": 9, "retweet_count": 1}}],
                "includes": {"users": [{"id": "u1", "username": "idol", "name": "偶像"}],
                             "media": [{"media_key": "m1", "type": "photo", "url": "https://pbs.twimg.com/media/A.jpg"}]}}
        t = ia.parse_api_page(page)[0]
        self.assertEqual((t["text"], t["author_username"], t["likes"]), ("hi https://a.com", "idol", 9))
        self.assertEqual(t["created_at"], "2024-05-01T10:00:00Z")
        self.assertEqual(t["media"][0]["type"], "photo")

    def test_export(self):
        self.arc.upsert({"id": "1600000000000000000", "text": "測試", "author_username": "idol"}, ["x"])
        self.arc.commit()
        for fmt in ("csv", "json", "html"):
            out = self.dir / f"o.{fmt}"
            self.assertEqual(ia.export(self.arc, fmt, out), 1)
            self.assertIn("測試", out.read_text(encoding="utf-8-sig"))


if __name__ == "__main__":
    unittest.main()

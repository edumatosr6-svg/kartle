#!/usr/bin/env python3
"""Assemble one requirements target into a single .docx.

The target is a collaborator's folder, the promoted Input, or the generated
Output. Its ORDER.md manifest says which documents it holds and in what order;
this renders them in that order and appends a consolidated register of the open
items found across all of them. Naming no target lists them and stops.

Standard library only: the .docx is written as an OOXML package by hand, so the
script runs wherever Python does and needs nothing installed.
"""

from __future__ import annotations

import argparse
import datetime as dt
import re
import sys
import zipfile
from dataclasses import dataclass, field
from pathlib import Path
from xml.sax.saxutils import escape as _escape

EMU_PER_INCH = 914400
CONTENT_WIDTH_IN = 6.1

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
WP = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
PIC = "http://schemas.openxmlformats.org/drawingml/2006/picture"

XML_DECL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'

DEFAULTS = {
    "title": "",
    "subtitle": "",
    "author": "",
    "date": "auto",
    "version": "",
    "language": "en-US",
    "output": "",
    "root": "",
    "discover": "*/*.md",
    "toc": "true",
    "toc-title": "Contents",
    "toc-hint": "Update this field (select all, F9) to build the table of contents.",
    "part-numbers": "true",
    "page-break": "before-each",
    "meta-fields": ["revision", "date", "author"],
    "abstract-field": "",
    "links": "keep",
    "open-items": "appendix",
    "open-items-pattern": r"OPEN-\d{1,3}",
    "open-items-title": "Consolidated open items",
    "open-items-intro": "",
    "open-items-empty": "No open items.",
    "open-items-columns": ["Document", "Id", "Open point"],
    "summary-columns": ["Document", "Open items"],
    "summary-total": "Total",
}


# --------------------------------------------------------------------------
# small helpers
# --------------------------------------------------------------------------

def esc(text: str) -> str:
    """Escape a string for an XML text node, dropping what XML cannot carry."""
    text = "".join(
        ch for ch in text
        if ch in "\t\n\r"
        or 0x20 <= ord(ch) <= 0xD7FF
        or 0xE000 <= ord(ch) <= 0xFFFD
        or ord(ch) > 0xFFFF
    )
    return _escape(text)


def attr(text: str) -> str:
    return _escape(text, {'"': "&quot;"})


def truthy(value) -> bool:
    return str(value).strip().lower() in ("true", "yes", "1", "on")


def as_list(value) -> list:
    if isinstance(value, list):
        return [str(v) for v in value]
    value = str(value).strip()
    if not value:
        return []
    if value.startswith("[") and value.endswith("]"):
        value = value[1:-1]
    return [p.strip().strip("'\"") for p in value.split(",") if p.strip()]


def scalar(value: str):
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "'\"":
        return value[1:-1]
    return value


# --------------------------------------------------------------------------
# front matter
# --------------------------------------------------------------------------

def split_front_matter(text: str):
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = text.split("\n")
    if not lines or lines[0].strip() != "---":
        return {}, text
    for i in range(1, len(lines)):
        if lines[i].strip() in ("---", "..."):
            return parse_front_matter(lines[1:i]), "\n".join(lines[i + 1:])
    return {}, text


def parse_front_matter(lines: list) -> dict:
    """Parse the flat front matter the manifest and the source documents use.

    Supports `key: value`, `key: [a, b]` and block lists of `- item`. Nested
    mappings are deliberately unsupported: every manifest key stays flat.
    """
    data: dict = {}
    key = None
    for raw in lines:
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        if raw[:1] in (" ", "\t") and key and raw.lstrip().startswith("- "):
            if not isinstance(data.get(key), list):
                data[key] = []
            data[key].append(scalar(raw.lstrip()[2:]))
            continue
        m = re.match(r"^([A-Za-z0-9_.\-]+)\s*:\s*(.*)$", raw)
        if not m:
            continue
        key, value = m.group(1), m.group(2).strip()
        if value.startswith("[") and value.endswith("]"):
            data[key] = as_list(value)
        else:
            data[key] = scalar(value)
    return data


# --------------------------------------------------------------------------
# markdown blocks
# --------------------------------------------------------------------------

@dataclass
class ListItem:
    level: int
    ordered: bool
    text: str


@dataclass
class Block:
    kind: str                       # heading para list table quote code rule image
    level: int = 0
    text: str = ""
    items: list = field(default_factory=list)
    rows: list = field(default_factory=list)
    src: str = ""
    alt: str = ""


BULLET_RE = re.compile(r"^(\s*)([-*+])\s+(.*)$")
ORDERED_RE = re.compile(r"^(\s*)(\d{1,3})[.)]\s+(.*)$")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.*?)\s*#*$")
RULE_RE = re.compile(r"^ {0,3}([-*_])(\s*\1){2,}\s*$")
FENCE_RE = re.compile(r"^ {0,3}(`{3,}|~{3,})\s*(\S*)")
TABLE_SEP_RE = re.compile(r"^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$")
IMAGE_ONLY_RE = re.compile(r"^\s*!\[([^\]]*)\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)\s*$")


def is_block_start(line: str) -> bool:
    return bool(
        not line.strip()
        or HEADING_RE.match(line)
        or RULE_RE.match(line)
        or FENCE_RE.match(line)
        or BULLET_RE.match(line)
        or ORDERED_RE.match(line)
        or line.lstrip().startswith(">")
        or line.lstrip().startswith("|")
    )


def parse_markdown(body: str) -> list:
    lines = body.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    blocks: list = []
    i = 0
    while i < len(lines):
        line = lines[i]

        if not line.strip():
            i += 1
            continue

        fence = FENCE_RE.match(line)
        if fence:
            marker = fence.group(1)[0] * 3
            i += 1
            buf = []
            while i < len(lines) and not lines[i].lstrip().startswith(marker):
                buf.append(lines[i])
                i += 1
            i += 1
            blocks.append(Block("code", text="\n".join(buf)))
            continue

        if RULE_RE.match(line):
            blocks.append(Block("rule"))
            i += 1
            continue

        m = HEADING_RE.match(line)
        if m:
            blocks.append(Block("heading", level=len(m.group(1)), text=m.group(2).strip()))
            i += 1
            continue

        m = IMAGE_ONLY_RE.match(line)
        if m:
            blocks.append(Block("image", alt=m.group(1), src=m.group(2)))
            i += 1
            continue

        if line.lstrip().startswith("|") and i + 1 < len(lines) and TABLE_SEP_RE.match(lines[i + 1]):
            rows = []
            while i < len(lines) and lines[i].lstrip().startswith("|"):
                if not TABLE_SEP_RE.match(lines[i]):
                    rows.append(split_table_row(lines[i]))
                i += 1
            if rows:
                blocks.append(Block("table", rows=rows))
            continue

        if line.lstrip().startswith(">"):
            buf = []
            while i < len(lines) and lines[i].lstrip().startswith(">"):
                buf.append(re.sub(r"^\s*>\s?", "", lines[i]))
                i += 1
            blocks.append(Block("quote", text=" ".join(x.strip() for x in buf if x.strip())))
            continue

        if BULLET_RE.match(line) or ORDERED_RE.match(line):
            items: list = []
            while i < len(lines):
                cur = lines[i]
                mb, mo = BULLET_RE.match(cur), ORDERED_RE.match(cur)
                if not (mb or mo):
                    if cur.strip() and items and cur[:1] in (" ", "\t"):
                        items[-1].text += " " + cur.strip()      # lazy continuation
                        i += 1
                        continue
                    break
                m2 = mb or mo
                indent = len(m2.group(1).replace("\t", "    "))
                items.append(ListItem(min(indent // 2, 4), mo is not None, m2.group(3).strip()))
                i += 1
            blocks.append(Block("list", items=items))
            continue

        buf = [line.strip()]
        i += 1
        while i < len(lines) and not is_block_start(lines[i]):
            buf.append(lines[i].strip())
            i += 1
        blocks.append(Block("para", text=" ".join(buf)))

    return blocks


def split_table_row(line: str) -> list:
    line = line.strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|"):
        line = line[:-1]
    cells, cur, escaped = [], "", False
    for ch in line:
        if escaped:
            cur += ch
            escaped = False
        elif ch == "\\":
            escaped = True
        elif ch == "|":
            cells.append(cur.strip())
            cur = ""
        else:
            cur += ch
    cells.append(cur.strip())
    return cells


def plain_text(markdown: str) -> str:
    out = re.sub(r"!\[([^\]]*)\]\([^)]*\)", r"\1", markdown)
    out = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", out)
    out = re.sub(r"[*_`~]+", "", out)
    return out.strip()


# --------------------------------------------------------------------------
# image dimensions
# --------------------------------------------------------------------------

def image_size(path: Path):
    try:
        data = path.read_bytes()
    except OSError:
        return None
    if data[:8] == b"\x89PNG\r\n\x1a\n" and data[12:16] == b"IHDR":
        return int.from_bytes(data[16:20], "big"), int.from_bytes(data[20:24], "big")
    if data[:3] == b"GIF":
        return int.from_bytes(data[6:8], "little"), int.from_bytes(data[8:10], "little")
    if data[:2] == b"\xff\xd8":
        i = 2
        while i + 9 < len(data):
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i + 1]
            if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
                i += 2
                continue
            length = int.from_bytes(data[i + 2:i + 4], "big")
            if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
                return (int.from_bytes(data[i + 7:i + 9], "big"),
                        int.from_bytes(data[i + 5:i + 7], "big"))
            if length <= 0:
                break
            i += 2 + length
    return None


# --------------------------------------------------------------------------
# the .docx package
# --------------------------------------------------------------------------

class Docx:
    """Builds a WordprocessingML package from paragraph and table fragments."""

    def __init__(self, language: str = "en-US"):
        self.language = language
        self.body: list = []
        self.rels: list = []                 # (id, type, target, external)
        self.media: dict = {}
        self.ordered_nums: list = []
        self._docpr = 0
        self._footer_rid = ""
        self.add_rel(f"{R}/styles", "styles.xml")
        self.add_rel(f"{R}/numbering", "numbering.xml")
        self.add_rel(f"{R}/settings", "settings.xml")

    # -- relationships ----------------------------------------------------
    def add_rel(self, rel_type: str, target: str, external: bool = False) -> str:
        rid = "rId%d" % (len(self.rels) + 1)
        self.rels.append((rid, rel_type, target, external))
        return rid

    def hyperlink_rel(self, url: str) -> str:
        return self.add_rel(f"{R}/hyperlink", url, external=True)

    def image_rel(self, path: Path):
        suffix = path.suffix.lower().lstrip(".")
        if suffix not in ("png", "jpg", "jpeg", "gif"):
            return None
        try:
            data = path.read_bytes()
        except OSError:
            return None
        name = "image%d.%s" % (len(self.media) + 1, suffix)
        self.media[name] = data
        return self.add_rel(f"{R}/image", f"media/{name}")

    def next_docpr(self) -> int:
        self._docpr += 1
        return self._docpr

    def new_ordered_num(self) -> int:
        """A numId of its own, so every ordered list restarts at 1."""
        num_id = 2 + len(self.ordered_nums)
        self.ordered_nums.append(num_id)
        return num_id

    # -- content ----------------------------------------------------------
    def add(self, xml: str) -> None:
        self.body.append(xml)

    # -- parts ------------------------------------------------------------
    def _document(self) -> str:
        sect = (
            '<w:sectPr>'
            f'<w:footerReference w:type="default" r:id="{self._footer_rid}"/>'
            '<w:pgSz w:w="11906" w:h="16838"/>'
            '<w:pgMar w:top="1418" w:right="1304" w:bottom="1418" w:left="1304" '
            'w:header="709" w:footer="709" w:gutter="0"/>'
            '<w:cols w:space="708"/><w:docGrid w:linePitch="360"/>'
            '</w:sectPr>'
        )
        return (
            XML_DECL
            + f'<w:document xmlns:w="{W}" xmlns:r="{R}" xmlns:wp="{WP}" '
              f'xmlns:a="{A}" xmlns:pic="{PIC}">'
            + "<w:body>" + "".join(self.body) + sect + "</w:body></w:document>"
        )

    def _rels(self) -> str:
        rows = []
        for rid, rel_type, target, external in self.rels:
            mode = ' TargetMode="External"' if external else ""
            rows.append(f'<Relationship Id="{rid}" Type="{attr(rel_type)}" '
                        f'Target="{attr(target)}"{mode}/>')
        return (XML_DECL
                + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/'
                  'relationships">' + "".join(rows) + "</Relationships>")

    def _styles(self) -> str:
        def para(style_id, name, spec, based="Normal", nxt="Normal"):
            return (f'<w:style w:type="paragraph" w:styleId="{style_id}">'
                    f'<w:name w:val="{attr(name)}"/><w:basedOn w:val="{based}"/>'
                    f'<w:next w:val="{nxt}"/><w:qFormat/>{spec}</w:style>')

        heads = []
        for lvl, sz, color, before, after in [
            (1, 30, "1F3864", 320, 140), (2, 25, "2E5496", 280, 120),
            (3, 22, "2E5496", 240, 100), (4, 21, "44546A", 200, 80),
            (5, 21, "44546A", 180, 80), (6, 21, "44546A", 180, 80),
        ]:
            heads.append(para(
                f"Heading{lvl}", f"heading {lvl}",
                '<w:pPr><w:keepNext/><w:keepLines/>'
                f'<w:spacing w:before="{before}" w:after="{after}"/>'
                f'<w:outlineLvl w:val="{lvl - 1}"/></w:pPr>'
                f'<w:rPr><w:b/><w:color w:val="{color}"/><w:sz w:val="{sz}"/>'
                f'<w:szCs w:val="{sz}"/></w:rPr>'))

        return (
            XML_DECL
            + f'<w:styles xmlns:w="{W}">'
            + '<w:docDefaults><w:rPrDefault><w:rPr>'
              '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>'
              '<w:sz w:val="21"/><w:szCs w:val="21"/>'
              f'<w:lang w:val="{attr(self.language)}"/>'
              '</w:rPr></w:rPrDefault><w:pPrDefault><w:pPr>'
              '<w:spacing w:after="140" w:line="276" w:lineRule="auto"/>'
              '</w:pPr></w:pPrDefault></w:docDefaults>'
            + '<w:style w:type="paragraph" w:default="1" w:styleId="Normal">'
              '<w:name w:val="Normal"/><w:qFormat/></w:style>'
            + "".join(heads)
            + para("Title", "Title",
                   '<w:pPr><w:spacing w:before="2600" w:after="0"/></w:pPr>'
                   '<w:rPr><w:b/><w:color w:val="1F3864"/><w:sz w:val="56"/>'
                   '<w:szCs w:val="56"/></w:rPr>')
            + para("Subtitle", "Subtitle",
                   '<w:pPr><w:spacing w:before="120" w:after="0"/></w:pPr>'
                   '<w:rPr><w:color w:val="44546A"/><w:sz w:val="30"/>'
                   '<w:szCs w:val="30"/></w:rPr>')
            + para("CoverMeta", "Cover Meta",
                   '<w:pPr><w:spacing w:before="0" w:after="60"/></w:pPr>'
                   '<w:rPr><w:color w:val="595959"/><w:sz w:val="20"/></w:rPr>')
            + para("PartMeta", "Part Meta",
                   '<w:pPr><w:spacing w:before="0" w:after="200"/></w:pPr>'
                   '<w:rPr><w:i/><w:color w:val="595959"/><w:sz w:val="18"/></w:rPr>')
            + para("Abstract", "Abstract",
                   '<w:pPr><w:spacing w:before="0" w:after="200"/>'
                   '<w:ind w:left="284"/></w:pPr>'
                   '<w:rPr><w:i/><w:color w:val="404040"/></w:rPr>')
            + para("ListParagraph", "List Paragraph",
                   '<w:pPr><w:spacing w:after="60"/><w:contextualSpacing/></w:pPr>')
            + para("Quote", "Quote",
                   '<w:pPr><w:pBdr>'
                   '<w:left w:val="single" w:sz="18" w:space="8" w:color="8EAADB"/>'
                   '</w:pBdr><w:ind w:left="284"/></w:pPr>'
                   '<w:rPr><w:i/><w:color w:val="404040"/></w:rPr>')
            + para("SourceCode", "Source Code",
                   '<w:pPr><w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>'
                   '<w:spacing w:after="0" w:line="240" w:lineRule="auto"/>'
                   '<w:ind w:left="142" w:right="142"/></w:pPr>'
                   '<w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>'
                   '<w:sz w:val="19"/></w:rPr>')
            + para("TableHeader", "Table Header",
                   '<w:pPr><w:keepNext/><w:spacing w:before="40" w:after="40"/></w:pPr>'
                   '<w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="20"/></w:rPr>')
            + para("TableCell", "Table Cell",
                   '<w:pPr><w:spacing w:before="40" w:after="40"/></w:pPr>'
                   '<w:rPr><w:sz w:val="20"/></w:rPr>')
            + para("Caption", "caption",
                   '<w:pPr><w:spacing w:before="60" w:after="200"/>'
                   '<w:jc w:val="center"/></w:pPr>'
                   '<w:rPr><w:i/><w:color w:val="595959"/><w:sz w:val="18"/></w:rPr>')
            + '<w:style w:type="character" w:styleId="CodeChar">'
              '<w:name w:val="Code Char"/><w:rPr>'
              '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>'
              '<w:color w:val="A31515"/><w:sz w:val="19"/>'
              '<w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/></w:rPr></w:style>'
            + '<w:style w:type="character" w:styleId="Hyperlink">'
              '<w:name w:val="Hyperlink"/>'
              '<w:rPr><w:color w:val="0563C1"/><w:u w:val="single"/></w:rPr></w:style>'
            + "</w:styles>"
        )

    def _numbering(self) -> str:
        lvls = []
        for lvl in range(5):
            char, font = [("", "Symbol"), ("o", "Courier New"),
                          ("", "Wingdings"), ("", "Symbol"),
                          ("o", "Courier New")][lvl]
            lvls.append(
                f'<w:lvl w:ilvl="{lvl}"><w:start w:val="1"/>'
                '<w:numFmt w:val="bullet"/>'
                f'<w:lvlText w:val="{attr(char)}"/><w:lvlJc w:val="left"/>'
                f'<w:pPr><w:ind w:left="{360 + 340 * lvl}" w:hanging="284"/></w:pPr>'
                f'<w:rPr><w:rFonts w:ascii="{font}" w:hAnsi="{font}" w:hint="default"/>'
                '</w:rPr></w:lvl>')
        formats = ["decimal", "lowerLetter", "lowerRoman", "decimal", "lowerLetter"]
        olvls = []
        for lvl in range(5):
            olvls.append(
                f'<w:lvl w:ilvl="{lvl}"><w:start w:val="1"/>'
                f'<w:numFmt w:val="{formats[lvl]}"/>'
                f'<w:lvlText w:val="%{lvl + 1}."/><w:lvlJc w:val="left"/>'
                f'<w:pPr><w:ind w:left="{360 + 340 * lvl}" w:hanging="284"/></w:pPr>'
                '</w:lvl>')
        nums = ['<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>']
        for num_id in self.ordered_nums:
            nums.append(f'<w:num w:numId="{num_id}"><w:abstractNumId w:val="1"/></w:num>')
        return (
            XML_DECL + f'<w:numbering xmlns:w="{W}">'
            + '<w:abstractNum w:abstractNumId="0">'
              '<w:multiLevelType w:val="hybridMultilevel"/>'
            + "".join(lvls) + "</w:abstractNum>"
            + '<w:abstractNum w:abstractNumId="1">'
              '<w:multiLevelType w:val="multilevel"/>'
            + "".join(olvls) + "</w:abstractNum>"
            + "".join(nums) + "</w:numbering>"
        )

    def _settings(self) -> str:
        return (XML_DECL + f'<w:settings xmlns:w="{W}">'
                '<w:zoom w:percent="100"/><w:updateFields w:val="true"/>'
                '<w:defaultTabStop w:val="708"/></w:settings>')

    def _footer(self, left_text: str) -> str:
        grey = '<w:rPr><w:color w:val="808080"/><w:sz w:val="16"/></w:rPr>'
        return (
            XML_DECL + f'<w:ftr xmlns:w="{W}" xmlns:r="{R}">'
            '<w:p><w:pPr><w:tabs><w:tab w:val="right" w:pos="9298"/></w:tabs>'
            '<w:spacing w:after="0"/></w:pPr>'
            f'<w:r>{grey}<w:t xml:space="preserve">{esc(left_text)}</w:t></w:r>'
            f'<w:r>{grey}<w:tab/></w:r>'
            '<w:r><w:fldChar w:fldCharType="begin"/></w:r>'
            '<w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>'
            '<w:r><w:fldChar w:fldCharType="separate"/></w:r>'
            f'<w:r>{grey}<w:t>1</w:t></w:r>'
            '<w:r><w:fldChar w:fldCharType="end"/></w:r>'
            '</w:p></w:ftr>')

    def _content_types(self) -> str:
        override = ('<Override PartName="/%s" ContentType="application/vnd.openxmlformats-'
                    'officedocument.wordprocessingml.%s+xml"/>')
        media_defaults = ""
        for ext, mime in (("png", "image/png"), ("jpeg", "image/jpeg"),
                          ("jpg", "image/jpeg"), ("gif", "image/gif")):
            if any(n.endswith("." + ext) for n in self.media):
                media_defaults += f'<Default Extension="{ext}" ContentType="{mime}"/>'
        return (
            XML_DECL
            + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
              '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.'
              'relationships+xml"/>'
              '<Default Extension="xml" ContentType="application/xml"/>'
            + media_defaults
            + override % ("word/document.xml", "document.main")
            + override % ("word/styles.xml", "styles")
            + override % ("word/numbering.xml", "numbering")
            + override % ("word/settings.xml", "settings")
            + override % ("word/footer1.xml", "footer")
            + '<Override PartName="/docProps/core.xml" ContentType="application/vnd.'
              'openxmlformats-package.core-properties+xml"/>'
            + "</Types>")

    def _core_props(self, title: str, author: str, subject: str) -> str:
        now = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        return (
            XML_DECL
            + '<cp:coreProperties '
              'xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/'
              'core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" '
              'xmlns:dcterms="http://purl.org/dc/terms/" '
              'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
            f'<dc:title>{esc(title)}</dc:title>'
            f'<dc:subject>{esc(subject)}</dc:subject>'
            f'<dc:creator>{esc(author)}</dc:creator>'
            f'<cp:lastModifiedBy>{esc(author)}</cp:lastModifiedBy>'
            f'<dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>'
            f'<dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>'
            '</cp:coreProperties>')

    def save(self, path: Path, title: str, author: str, subject: str) -> None:
        self._footer_rid = self.add_rel(f"{R}/footer", "footer1.xml")
        path.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
            z.writestr("[Content_Types].xml", self._content_types())
            z.writestr(
                "_rels/.rels",
                XML_DECL
                + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/'
                  'relationships">'
                  f'<Relationship Id="rId1" Type="{R}/officeDocument" '
                  'Target="word/document.xml"/>'
                  '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/'
                  '2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>'
                  "</Relationships>")
            z.writestr("docProps/core.xml", self._core_props(title, author, subject))
            z.writestr("word/document.xml", self._document())
            z.writestr("word/_rels/document.xml.rels", self._rels())
            z.writestr("word/styles.xml", self._styles())
            z.writestr("word/numbering.xml", self._numbering())
            z.writestr("word/settings.xml", self._settings())
            z.writestr("word/footer1.xml", self._footer(title))
            for name, data in self.media.items():
                z.writestr(f"word/media/{name}", data)


# --------------------------------------------------------------------------
# markdown -> WordprocessingML
# --------------------------------------------------------------------------

INLINE_RE = re.compile(
    r"(?P<code>`+)(?P<ctext>.+?)(?P=code)"
    r"|!\[(?P<ialt>[^\]]*)\]\((?P<isrc>[^)\s]+)(?:\s+\"[^\"]*\")?\)"
    r"|\[(?P<ltext>[^\]]*)\]\((?P<lhref>[^)\s]+)(?:\s+\"[^\"]*\")?\)"
    r"|\*\*(?P<btext>.+?)\*\*"
    r"|__(?P<btext2>.+?)__"
    r"|(?<![\w*])\*(?P<itext>[^*\n]+?)\*(?![\w*])"
    r"|(?<![\w_])_(?P<itext2>[^_\n]+?)_(?![\w_])"
    r"|~~(?P<stext>.+?)~~",
    re.DOTALL,
)


class Renderer:
    """Turns parsed blocks into paragraph and table XML inside a Docx."""

    def __init__(self, docx: Docx, root_dir: Path, links: str = "keep"):
        self.docx = docx
        self.root_dir = root_dir
        self.base_dir = root_dir      # reset to the folder of the document being rendered
        self.links = links            # keep: real URLs stay links · text: nothing links out

    # -- runs -------------------------------------------------------------
    def run(self, text: str, bold=False, italic=False, strike=False,
            style="", size=0, color="") -> str:
        if not text:
            return ""
        props = ""
        if style:
            props += f'<w:rStyle w:val="{style}"/>'
        if bold:
            props += "<w:b/>"
        if italic:
            props += "<w:i/>"
        if strike:
            props += "<w:strike/>"
        if color:
            props += f'<w:color w:val="{color}"/>'
        if size:
            props += f'<w:sz w:val="{size}"/>'
        rpr = f"<w:rPr>{props}</w:rPr>" if props else ""
        parts = []
        for idx, chunk in enumerate(text.split("\n")):
            if idx:
                parts.append("<w:br/>")
            if chunk:
                parts.append(f'<w:t xml:space="preserve">{esc(chunk)}</w:t>')
        return f"<w:r>{rpr}{''.join(parts)}</w:r>"

    def runs(self, text: str, bold=False, italic=False, strike=False, size=0) -> str:
        out, pos = [], 0
        for m in INLINE_RE.finditer(text):
            if m.start() > pos:
                out.append(self.run(text[pos:m.start()], bold=bold, italic=italic,
                                    strike=strike, size=size))
            if m.group("ctext") is not None:
                out.append(self.run(m.group("ctext"), bold=bold, italic=italic,
                                    style="CodeChar", size=size))
            elif m.group("isrc") is not None:
                out.append(self.image_run(m.group("isrc"), m.group("ialt")))
            elif m.group("lhref") is not None:
                out.append(self.link(m.group("ltext"), m.group("lhref"),
                                     bold=bold, italic=italic, size=size))
            elif m.group("btext") is not None or m.group("btext2") is not None:
                inner = m.group("btext") if m.group("btext") is not None else m.group("btext2")
                out.append(self.runs(inner, bold=True, italic=italic, strike=strike, size=size))
            elif m.group("itext") is not None or m.group("itext2") is not None:
                inner = m.group("itext") if m.group("itext") is not None else m.group("itext2")
                out.append(self.runs(inner, bold=bold, italic=True, strike=strike, size=size))
            elif m.group("stext") is not None:
                out.append(self.runs(m.group("stext"), bold=bold, italic=italic,
                                     strike=True, size=size))
            pos = m.end()
        if pos < len(text):
            out.append(self.run(text[pos:], bold=bold, italic=italic, strike=strike, size=size))
        return "".join(out)

    def link(self, label: str, href: str, **kw) -> str:
        label = label or href
        # A relative link means nothing outside the repository, and under
        # `links: text` nothing at all points out of the assembled document.
        if self.links == "text" or not re.match(r"^(https?://|mailto:)", href, re.I):
            return self.runs(label, **kw)
        rid = self.docx.hyperlink_rel(href)
        return f'<w:hyperlink r:id="{rid}">{self.run(label, style="Hyperlink", **kw)}</w:hyperlink>'

    def resolve_asset(self, src: str):
        """An asset path is relative to its own document first, the root second."""
        if Path(src).is_absolute():
            return Path(src)
        for base in (self.base_dir, self.root_dir):
            candidate = base / src
            if candidate.is_file():
                return candidate
        return self.base_dir / src

    def image_run(self, src: str, alt: str) -> str:
        path = self.resolve_asset(src)
        rid = self.docx.image_rel(path) if path.is_file() else None
        size = image_size(path) if rid else None
        if not rid or not size:
            return self.run(f"[{alt or src}]", italic=True, color="808080")
        width_px, height_px = size
        cx = min(int(CONTENT_WIDTH_IN * EMU_PER_INCH), int(width_px / 96 * EMU_PER_INCH))
        cy = max(1, int(cx * height_px / max(width_px, 1)))
        pid = self.docx.next_docpr()
        name = attr(alt or path.name)
        return (
            '<w:r><w:drawing>'
            '<wp:inline distT="0" distB="0" distL="0" distR="0">'
            f'<wp:extent cx="{cx}" cy="{cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/>'
            f'<wp:docPr id="{pid}" name="{name}"/>'
            '<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/>'
            '</wp:cNvGraphicFramePr>'
            '<a:graphic><a:graphicData '
            'uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
            f'<pic:pic><pic:nvPicPr><pic:cNvPr id="{pid}" name="{name}"/>'
            '<pic:cNvPicPr/></pic:nvPicPr>'
            f'<pic:blipFill><a:blip r:embed="{rid}"/>'
            '<a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
            f'<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>'
            '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic>'
            '</a:graphicData></a:graphic></wp:inline></w:drawing></w:r>')

    # -- paragraphs -------------------------------------------------------
    def para(self, content: str, style="", num=None, ilvl=0, page_break=False,
             align="", extra="") -> str:
        props = ""
        if style:
            props += f'<w:pStyle w:val="{style}"/>'
        if page_break:
            props += "<w:pageBreakBefore/>"
        if num is not None:
            props += f'<w:numPr><w:ilvl w:val="{ilvl}"/><w:numId w:val="{num}"/></w:numPr>'
        if extra:
            props += extra
        if align:
            props += f'<w:jc w:val="{align}"/>'
        ppr = f"<w:pPr>{props}</w:pPr>" if props else ""
        return f"<w:p>{ppr}{content}</w:p>"

    def text_para(self, text: str, **kw) -> str:
        return self.para(self.runs(text), **kw)

    def heading(self, text: str, level: int, page_break=False) -> str:
        level = max(1, min(level, 6))
        return self.para(self.runs(text), style=f"Heading{level}", page_break=page_break)

    # -- tables -----------------------------------------------------------
    def table(self, rows: list, widths=None, header: bool = True) -> str:
        if not rows:
            return ""
        cols = max(len(r) for r in rows)
        rows = [list(r) + [""] * (cols - len(r)) for r in rows]
        if not widths or len(widths) != cols:
            weights = []
            for c in range(cols):
                longest = max((len(plain_text(r[c])) for r in rows), default=1)
                weights.append(max(6, min(longest, 70)))
            total = sum(weights) or 1
            widths = [max(6, round(w * 100 / total)) for w in weights]
        total_w = sum(widths) or 1
        col_w = [round(w * 9298 / total_w) for w in widths]
        grid = "".join(f'<w:gridCol w:w="{w}"/>' for w in col_w)

        borders = ('<w:tblBorders>'
                   '<w:top w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>'
                   '<w:left w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>'
                   '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>'
                   '<w:right w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>'
                   '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>'
                   '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>'
                   '</w:tblBorders>')
        tbl_pr = ('<w:tblPr><w:tblW w:w="5000" w:type="pct"/>' + borders
                  + '<w:tblLayout w:type="fixed"/>'
                    '<w:tblCellMar>'
                    '<w:top w:w="60" w:type="dxa"/><w:left w:w="90" w:type="dxa"/>'
                    '<w:bottom w:w="60" w:type="dxa"/><w:right w:w="90" w:type="dxa"/>'
                    '</w:tblCellMar>'
                    '<w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" '
                    'w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr>')

        out = [f"<w:tbl>{tbl_pr}<w:tblGrid>{grid}</w:tblGrid>"]
        for idx, row in enumerate(rows):
            is_head = header and idx == 0
            cells = []
            for c, cell in enumerate(row):
                if is_head:
                    shade = '<w:shd w:val="clear" w:color="auto" w:fill="2E5496"/>'
                elif idx % 2 == 0:
                    shade = '<w:shd w:val="clear" w:color="auto" w:fill="F5F7FB"/>'
                else:
                    shade = ""
                style = "TableHeader" if is_head else "TableCell"
                body = self.para(self.runs(cell), style=style)
                cells.append(f'<w:tc><w:tcPr><w:tcW w:w="{col_w[c]}" w:type="dxa"/>'
                             f'{shade}<w:vAlign w:val="center"/></w:tcPr>{body}</w:tc>')
            tr_pr = ('<w:trPr><w:cantSplit/><w:tblHeader/></w:trPr>' if is_head
                     else "<w:trPr><w:cantSplit/></w:trPr>")
            out.append(f"<w:tr>{tr_pr}{''.join(cells)}</w:tr>")
        out.append("</w:tbl>")
        # a spacer keeps two consecutive tables from merging into one
        out.append('<w:p><w:pPr><w:spacing w:after="0" w:line="200" w:lineRule="auto"/>'
                   "</w:pPr></w:p>")
        return "".join(out)

    # -- blocks -----------------------------------------------------------
    def blocks(self, blocks: list, base_level: int) -> None:
        """Render one document's blocks under a part heading of `base_level`.

        A document's own top heading level is normalised to `base_level + 1`,
        so a set mixing `#`-led and `##`-led documents still produces one
        consistent outline — and every section stays inside the TOC's range.
        """
        levels = [b.level for b in blocks if b.kind == "heading"]
        offset = base_level + 1 - (min(levels) if levels else 1)
        for block in blocks:
            if block.kind == "heading":
                self.docx.add(self.heading(block.text, block.level + offset))
            elif block.kind == "para":
                self.docx.add(self.text_para(block.text))
            elif block.kind == "quote":
                self.docx.add(self.text_para(block.text, style="Quote"))
            elif block.kind == "rule":
                self.docx.add(self.para(
                    "", extra='<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" '
                              'w:color="BFBFBF"/></w:pBdr>'))
            elif block.kind == "code":
                for line in block.text.split("\n"):
                    self.docx.add(self.para(self.run(line or " "), style="SourceCode"))
            elif block.kind == "image":
                self.docx.add(self.para(self.image_run(block.src, block.alt), align="center"))
                if block.alt:
                    self.docx.add(self.text_para(block.alt, style="Caption"))
            elif block.kind == "table":
                self.docx.add(self.table(block.rows))
            elif block.kind == "list":
                ordered_num = None
                for item in block.items:
                    if item.ordered:
                        if ordered_num is None:
                            ordered_num = self.docx.new_ordered_num()
                        num = ordered_num
                    else:
                        num = 1
                    self.docx.add(self.para(self.runs(item.text), style="ListParagraph",
                                            num=num, ilvl=item.level))


# --------------------------------------------------------------------------
# the manifest
# --------------------------------------------------------------------------

@dataclass
class Entry:
    path: str
    title: str = ""
    group: str = ""


@dataclass
class Manifest:
    order_path: Path
    root: Path
    meta: dict
    entries: list

    def get(self, key: str):
        value = self.meta.get(key, "")
        if value in ("", [], None):
            return DEFAULTS.get(key, "")
        return value


ENTRY_RE = re.compile(r"^\s*(?:\d{1,3}[.)]|[-*+])\s+(.*)$")
SPLIT_RE = re.compile(r"\s+(?:—|–|--|\|)\s+")


def load_manifest(order_path: Path, repo_root: Path) -> Manifest:
    text = order_path.read_text(encoding="utf-8")
    meta, body = split_front_matter(text)
    root_value = str(meta.get("root", "")).strip()
    root = order_path.parent if not root_value else (repo_root / root_value)
    entries: list = []
    group = ""
    for line in body.split("\n"):
        heading = HEADING_RE.match(line)
        if heading:
            group = plain_text(heading.group(2).strip())
            continue
        m = ENTRY_RE.match(line)
        if not m:
            continue
        raw = m.group(1).strip()
        if raw.startswith("<!--"):
            continue
        parts = SPLIT_RE.split(raw, maxsplit=1)
        path = plain_text(parts[0]).strip().strip("`")
        title = plain_text(parts[1]).strip() if len(parts) > 1 else ""
        if not path.lower().endswith(".md"):
            continue
        entries.append(Entry(path=path, title=title, group=group))
    return Manifest(order_path=order_path.resolve(), root=root.resolve(),
                    meta=meta, entries=entries)


def discover(manifest: Manifest) -> list:
    patterns = as_list(manifest.get("discover")) or ["*/*.md"]
    found = set()
    for pattern in patterns:
        for path in manifest.root.glob(pattern):
            if path.is_file() and path.resolve() != manifest.order_path:
                found.add(path.relative_to(manifest.root).as_posix())
    return sorted(found)


# --------------------------------------------------------------------------
# assembly
# --------------------------------------------------------------------------

@dataclass
class OpenItem:
    ident: str
    text: str


@dataclass
class Part:
    entry: Entry
    path: Path
    title: str
    meta: dict
    blocks: list
    open_items: list


def harvest_open_items(blocks: list, pattern) -> list:
    items: list = []
    for block in blocks:
        candidates: list = []
        if block.kind == "list":
            candidates = [item.text for item in block.items]
        elif block.kind == "para":
            candidates = [block.text]
        elif block.kind == "table":
            candidates = [" — ".join(row) for row in block.rows[1:]]
        for text in candidates:
            flat = plain_text(text)
            m = pattern.match(flat)
            if not m:
                continue
            rest = flat[m.end():].lstrip(" :.–—-")
            items.append(OpenItem(ident=m.group(1), text=rest or flat))
    return items


def load_parts(manifest: Manifest, problems: list) -> list:
    pattern = re.compile(r"^\s*(" + str(manifest.get("open-items-pattern")) + r")")
    parts: list = []
    for entry in manifest.entries:
        path = (manifest.root / entry.path).resolve()
        if not path.is_file():
            problems.append(f"listed but missing: {entry.path}")
            continue
        meta, body = split_front_matter(path.read_text(encoding="utf-8"))
        blocks = parse_markdown(body)
        title = entry.title or str(meta.get("title") or meta.get("name") or "").strip()
        if not title:
            first = next((b for b in blocks if b.kind == "heading"), None)
            title = first.text if first else path.stem
        parts.append(Part(entry=entry, path=path, title=title, meta=meta, blocks=blocks,
                          open_items=harvest_open_items(blocks, pattern)))
    return parts


def meta_line(part: Part, fields: list) -> str:
    chunks = []
    for key in fields:
        value = part.meta.get(key)
        if value in (None, "", []):
            continue
        chunks.append(", ".join(as_list(value)) if isinstance(value, list) else str(value))
    return " · ".join(chunks)


def build_document(manifest: Manifest, parts: list, output: Path) -> None:
    docx = Docx(language=str(manifest.get("language")))
    renderer = Renderer(docx, manifest.root, links=str(manifest.get("links")))

    title = str(manifest.get("title")) or manifest.root.name
    subtitle = str(manifest.get("subtitle"))
    author = str(manifest.get("author"))
    version = str(manifest.get("version"))
    date_value = str(manifest.get("date"))
    if date_value.strip().lower() in ("auto", "today"):
        date_value = dt.date.today().isoformat()

    # cover
    docx.add(renderer.text_para(title, style="Title"))
    if subtitle:
        docx.add(renderer.text_para(subtitle, style="Subtitle"))
    docx.add(renderer.para("", extra='<w:spacing w:before="0" w:after="400"/>'))
    for line in (author, date_value, version):
        if line:
            docx.add(renderer.text_para(line, style="CoverMeta"))

    # One section is not a grouping: a lone heading over every entry — the one
    # the scaffold writes — would only add an empty level to the outline.
    groups = [g for g in dict.fromkeys(e.group for e in manifest.entries) if g]
    grouped = len(groups) > 1
    numbered = truthy(manifest.get("part-numbers"))

    if truthy(manifest.get("toc")):
        docx.add(renderer.heading(str(manifest.get("toc-title")), 1, page_break=True))
        hint = str(manifest.get("toc-hint"))
        docx.add(renderer.para(
            '<w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/></w:r>'
            '<w:r><w:instrText xml:space="preserve"> TOC \\o "1-3" \\h \\z \\u '
            '</w:instrText></w:r>'
            '<w:r><w:fldChar w:fldCharType="separate"/></w:r>'
            + (renderer.run(hint, italic=True, color="808080") if hint else "")
            + '<w:r><w:fldChar w:fldCharType="end"/></w:r>'))

    page_break_each = str(manifest.get("page-break")) != "none"
    meta_fields = as_list(manifest.get("meta-fields"))
    abstract_field = str(manifest.get("abstract-field"))

    current_group = None
    for index, part in enumerate(parts, 1):
        opened_group = False
        if grouped and part.entry.group != current_group:
            current_group = part.entry.group
            if current_group:
                docx.add(renderer.heading(current_group, 1, page_break=True))
                opened_group = True
        label = f"{index}. {part.title}" if numbered else part.title
        level = 2 if grouped else 1
        docx.add(renderer.heading(label, level,
                                  page_break=page_break_each and not opened_group))
        line = meta_line(part, meta_fields)
        if line:
            docx.add(renderer.text_para(line, style="PartMeta"))
        if abstract_field and part.meta.get(abstract_field):
            docx.add(renderer.text_para(str(part.meta[abstract_field]), style="Abstract"))
        renderer.base_dir = part.path.parent
        renderer.blocks(part.blocks, base_level=level)
    renderer.base_dir = renderer.root_dir

    # the consolidated open items
    if str(manifest.get("open-items")) != "none":
        docx.add(renderer.heading(str(manifest.get("open-items-title")), 1, page_break=True))
        intro = str(manifest.get("open-items-intro"))
        if intro:
            docx.add(renderer.text_para(intro))
        total = sum(len(p.open_items) for p in parts)
        rows = [as_list(manifest.get("summary-columns"))]
        for part in parts:
            rows.append([part.title, str(len(part.open_items))])
        rows.append([f"**{manifest.get('summary-total')}**", f"**{total}**"])
        docx.add(renderer.table(rows, widths=[82, 18]))
        if total:
            item_rows = [as_list(manifest.get("open-items-columns"))]
            for part in parts:
                for item in part.open_items:
                    item_rows.append([part.title, item.ident, item.text])
            docx.add(renderer.table(item_rows, widths=[20, 10, 70]))
        else:
            docx.add(renderer.text_para(str(manifest.get("open-items-empty"))))

    docx.save(output, title=title, author=author, subject=subtitle)


# --------------------------------------------------------------------------
# init
# --------------------------------------------------------------------------

def write_scaffold(order_path: Path, root: Path, repo_root: Path) -> None:
    files = sorted(p.relative_to(root).as_posix() for p in root.glob("*/*.md") if p.is_file())
    try:
        output_rel = (root / (root.name + ".docx")).relative_to(repo_root).as_posix()
    except ValueError:
        output_rel = (root.name + ".docx")
    lines = [
        "---",
        f"title: {root.name}",
        "subtitle: ",
        "author: ",
        "date: auto",
        "version: ",
        "language: en-US",
        f"output: {output_rel}",
        "discover: */*.md",
        "toc: true",
        "toc-title: Contents",
        "part-numbers: true",
        "page-break: before-each",
        "meta-fields: [revision, date, author]",
        "abstract-field: description",
        "links: keep",
        "open-items: appendix",
        "open-items-title: Consolidated open items",
        "open-items-columns: [Document, Id, Open point]",
        "summary-columns: [Document, Open items]",
        "---",
        "",
        "# Order",
        "",
        "<!-- one entry per line: `<path relative to the root> — <title in the export>` -->",
        "",
    ]
    lines += [f"{i}. {f}" for i, f in enumerate(files, 1)] or ["<!-- no markdown found -->"]
    order_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


# --------------------------------------------------------------------------
# the targets of the requirements stage
# --------------------------------------------------------------------------
#
# The only place this tool is bound to a stage. `Input` and `Output` are the
# stage roots the conventions name; the collaborative folder is where the
# drafts of each author live before they are promoted. Nothing else in this
# script knows a path.

STAGE_INPUT = "200 Requirements/220 Input"
STAGE_OUTPUT = "200 Requirements/230 Output"
COLLABORATIVE = "200 Requirements/240 Colaborative"


def available_targets(repo_root: Path) -> list:
    """Every target a run may name: the two stage roots, then each collaborator."""
    targets = []
    for keyword, rel in (("Input", STAGE_INPUT), ("Output", STAGE_OUTPUT)):
        path = repo_root / rel
        if path.is_dir():
            targets.append((keyword, path))
    collaborative = repo_root / COLLABORATIVE
    if collaborative.is_dir():
        for folder in sorted(p for p in collaborative.iterdir() if p.is_dir()):
            targets.append((folder.name, folder))
    return targets


def resolve_target(name: str, repo_root: Path):
    """Match a target by name, case-insensitively. The keywords win a tie."""
    wanted = name.strip().strip("/\\").lower()
    for label, path in available_targets(repo_root):
        if label.lower() == wanted:
            return label, path
    return None, None


def print_targets(repo_root: Path, stream) -> None:
    targets = available_targets(repo_root)
    if not targets:
        print(f"no targets under {COLLABORATIVE} and no stage folders", file=stream)
        return
    print("target        manifest   documents", file=stream)
    print("-" * 64, file=stream)
    for label, path in targets:
        manifest = "ORDER.md" if (path / "ORDER.md").is_file() else "—"
        count = len([p for p in path.glob("*/*.md") if p.is_file()])
        print(f"{label:<13} {manifest:<10} {count}", file=stream)


# --------------------------------------------------------------------------
# cli
# --------------------------------------------------------------------------

def main(argv: list) -> int:
    ap = argparse.ArgumentParser(
        description="Assemble a requirements document set into one .docx.")
    ap.add_argument("target", nargs="?",
                    help="a collaborator's name, or Input, or Output. "
                         "Omitted, the targets are listed and nothing runs")
    ap.add_argument("--output", help="output .docx; overrides the manifest's `output:`")
    ap.add_argument("--root", default=".", help="repository root; default the current directory")
    ap.add_argument("--check", action="store_true", help="validate the manifest, write nothing")
    ap.add_argument("--init", action="store_true",
                    help="scaffold an ORDER.md from what is on disk")
    args = ap.parse_args(argv)

    repo_root = Path(args.root).resolve()

    def shown(path: Path):
        try:
            return path.relative_to(repo_root).as_posix()
        except ValueError:
            return str(path)

    # No target is not a default: the run says which set it is assembling, or
    # it lists the choices and stops so a human can say.
    if not args.target:
        print("name a target: a collaborator, or Input, or Output\n")
        print_targets(repo_root, sys.stdout)
        return 2

    label, root = resolve_target(args.target, repo_root)
    if root is None:
        print(f"unknown target: {args.target}\n", file=sys.stderr)
        print_targets(repo_root, sys.stderr)
        return 2
    order_path = root / "ORDER.md"

    if args.init:
        if order_path.exists():
            print(f"refusing to overwrite {shown(order_path)}", file=sys.stderr)
            return 1
        write_scaffold(order_path, order_path.parent, repo_root)
        print(f"scaffolded {shown(order_path)} for {label} — put the entries in reading order")
        return 0

    if not order_path.is_file():
        print(f"{label} has no manifest at {shown(order_path)} — run with --init to scaffold one",
              file=sys.stderr)
        return 1

    manifest = load_manifest(order_path, repo_root)
    problems: list = []
    parts = load_parts(manifest, problems)
    listed = {e.path for e in manifest.entries}
    unlisted = [f for f in discover(manifest) if f not in listed]

    print(f"target   : {label}")
    print(f"manifest : {shown(order_path)}")
    print(f"root     : {shown(manifest.root)}")
    print()
    print(f"{'#':>2}  {'open':>4}  document")
    print("-" * 64)
    group = None
    for i, part in enumerate(parts, 1):
        if part.entry.group != group:
            group = part.entry.group
            if group:
                print(f"      {group}")
        print(f"{i:>2}  {len(part.open_items):>4}  {part.title}  ({part.entry.path})")
    total = sum(len(p.open_items) for p in parts)
    print("-" * 64)
    print(f"{'':>2}  {total:>4}  open items across {len(parts)} documents")

    for problem in problems:
        print(f"ERROR   {problem}", file=sys.stderr)
    for f in unlisted:
        print(f"WARNING present on disk, absent from ORDER.md: {f}", file=sys.stderr)

    if args.check:
        print("\nchecked, nothing written")
        return 1 if problems else 0
    if problems:
        print("\nnothing written: fix the entries above", file=sys.stderr)
        return 1
    if not parts:
        print("\nnothing written: the manifest lists no document", file=sys.stderr)
        return 1

    if args.output:
        output = Path(args.output)
    elif str(manifest.get("output")):
        output = Path(str(manifest.get("output")))
    else:
        output = manifest.root / f"{manifest.root.name}.docx"
    if not output.is_absolute():
        output = repo_root / output

    try:
        build_document(manifest, parts, output)
    except PermissionError:
        # Word holds a lock on the file it has open, and the export is the one
        # thing here that cannot be retried around it.
        print(f"\ncannot write {shown(output)}: the file is open in another "
              f"application. Close it and run again.", file=sys.stderr)
        return 1
    print(f"\nwrote {shown(output)}  ({output.stat().st_size / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

# -*- coding: utf-8 -*-
import json
import re
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls


def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)


def set_cell_margins(cell, top=60, bottom=60, left=100, right=100):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)


def add_field(paragraph, field_text):
    run_begin = paragraph.add_run()
    run_begin.font.name = "Times New Roman"
    run_begin.font.size = Pt(9)
    fldChar1 = parse_xml(r'<w:fldChar %s w:fldCharType="begin"/>' % nsdecls('w'))
    run_begin._r.append(fldChar1)

    run_instr = paragraph.add_run()
    run_instr.font.name = "Times New Roman"
    run_instr.font.size = Pt(9)
    instrText = parse_xml(r'<w:instrText %s xml:space="preserve"> %s </w:instrText>' % (nsdecls('w'), field_text))
    run_instr._r.append(instrText)

    run_sep = paragraph.add_run()
    run_sep.font.name = "Times New Roman"
    run_sep.font.size = Pt(9)
    fldChar2 = parse_xml(r'<w:fldChar %s w:fldCharType="separate"/>' % nsdecls('w'))
    run_sep._r.append(fldChar2)

    run_end = paragraph.add_run()
    run_end.font.name = "Times New Roman"
    run_end.font.size = Pt(9)
    fldChar3 = parse_xml(r'<w:fldChar %s w:fldCharType="end"/>' % nsdecls('w'))
    run_end._r.append(fldChar3)


def add_page_number_to_footer(section):
    footer = section.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("Trang ")
    run.font.name = "Times New Roman"
    run.font.size = Pt(9)

    add_field(p, "PAGE")

    run2 = p.add_run(" / ")
    run2.font.name = "Times New Roman"
    run2.font.size = Pt(9)

    add_field(p, "NUMPAGES")


def add_highlighted_text(paragraph, full_text, keyword, base_bold=False, kw_bold=True, kw_underline=True, kw_color=None, font_size=10):
    """Add text to paragraph, highlighting `keyword` if found."""
    text_str = str(full_text or "")
    kw_str = str(keyword or "").strip()
    if not kw_str or len(kw_str) < 2:
        r = paragraph.add_run(text_str)
        r.bold = base_bold
        r.font.size = Pt(font_size)
        return

    idx = text_str.lower().find(kw_str.lower())
    if idx == -1:
        r = paragraph.add_run(text_str)
        r.bold = base_bold
        r.font.size = Pt(font_size)
        return

    before = text_str[:idx]
    match = text_str[idx:idx + len(kw_str)]
    after = text_str[idx + len(kw_str):]

    if before:
        r1 = paragraph.add_run(before)
        r1.bold = base_bold
        r1.font.size = Pt(font_size)

    r2 = paragraph.add_run(match)
    r2.bold = kw_bold
    r2.underline = kw_underline
    r2.font.size = Pt(font_size)
    if kw_color:
        r2.font.color.rgb = kw_color

    if after:
        r3 = paragraph.add_run(after)
        r3.bold = base_bold
        r3.font.size = Pt(font_size)


def set_section_columns(section, num_cols=2, space_dxa=340, sep=True):
    sectPr = section._sectPr
    cols = sectPr.xpath('./w:cols')
    if cols:
        cols_el = cols[0]
    else:
        cols_el = OxmlElement('w:cols')
        sectPr.append(cols_el)
    cols_el.set(qn('w:num'), str(num_cols))
    cols_el.set(qn('w:space'), str(space_dxa))
    if sep and num_cols > 1:
        cols_el.set(qn('w:sep'), '1')
    else:
        if qn('w:sep') in cols_el.attrib:
            del cols_el.attrib[qn('w:sep')]


def load_data():
    with open("questions_enriched.json", "r", encoding="utf-8") as f:
        questions = json.load(f)

    # Parse tips-data.js to get BIDDING_TOPICS and MASTER_TIPS
    with open("tips-data.js", "r", encoding="utf-8") as f:
        js_text = f.read()

    # Extract BIDDING_TOPICS and MASTER_TIPS using node to dump clean JSON
    import subprocess
    cmd = [
        "node",
        "-e",
        "const fs=require('fs'); window={}; eval(fs.readFileSync('tips-data.js','utf8')); console.log(JSON.stringify({topics: window.BIDDING_TOPICS, tips: window.MASTER_TIPS}));"
    ]
    out = subprocess.check_output(cmd, encoding="utf-8")
    tips_obj = json.loads(out)
    return questions, tips_obj["topics"], tips_obj["tips"]


def expand_correct_answer_text(q):
    """If the correct option is 'Tất cả phương án trên đều đúng' or 'Phương án A và B đều đúng',
    append the actual content of those referenced options so the theory reader understands the full rule!"""
    ans_letter = q["answer"]
    ans_text = q["options"][ans_letter]
    low = ans_text.lower()

    if "tất cả" in low and ("đều đúng" in low or "phương án trên" in low or "đáp án trên" in low):
        sub_parts = [f"({k}) {q['options'][k]}" for k in ["A", "B", "C"] if k != ans_letter]
        return f"{ans_text} [Gồm: {'; '.join(sub_parts)}]"

    if "cả 3" in low and "đều đúng" in low:
        sub_parts = [f"({k}) {q['options'][k]}" for k in ["A", "B", "C"] if k != ans_letter]
        return f"{ans_text} [Gồm: {'; '.join(sub_parts)}]"

    m_ab = re.search(r'(?:phương án|đáp án|nhà thầu)\s+([abcd])\s+và\s+([abcd])\s+(?:đều\s+)?đúng', low)
    if m_ab:
        k1, k2 = m_ab.group(1).upper(), m_ab.group(2).upper()
        return f"{ans_text} [Gồm ({k1}): {q['options'].get(k1, '')}; và ({k2}): {q['options'].get(k2, '')}]"

    if "đều sai" in low:
        sub_parts = [f"({k}) {q['options'][k]}" for k in ["A", "B", "C"] if k != ans_letter]
        return f"{ans_text} [Lưu ý các mệnh đề SAI gồm: {'; '.join(sub_parts)}]"

    return ans_text


def build_theory_docx(questions, topics, master_tips, filename):
    doc = Document()

    # Base style
    style = doc.styles["Normal"]
    style.font.name = "Times New Roman"
    style.font.size = Pt(10)
    style.paragraph_format.line_spacing = 1.1
    style.paragraph_format.space_before = Pt(0)
    style.paragraph_format.space_after = Pt(2)

    # Page margins (A4 compact)
    section = doc.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(1.2)
    section.bottom_margin = Cm(1.2)
    section.left_margin = Cm(1.5)
    section.right_margin = Cm(1.2)
    add_page_number_to_footer(section)

    # Title Banner
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(2)
    r_t = p_title.add_run("TÀI LIỆU HỌC NHANH LÝ THUYẾT & MẸO GHI NHỚ 340 CÂU ĐẤU THẦU")
    r_t.bold = True
    r_t.font.size = Pt(14)
    r_t.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(8)
    r_sub = p_sub.add_run(
        "Bộ đề 340 câu Cục Quản lý đấu thầu ban hành • Cập nhật Luật 90/2025/QH15, NĐ 214/2025/NĐ-CP, TT 79 & 80/2025/TT-BTC\n"
        "(Tài liệu thiết kế cô đọng: Bảng quy luật nhớ nhanh + Tóm tắt Câu hỏi – Đáp án đúng – Từ khóa – Giải thích theo 10 chuyên đề)"
    )
    r_sub.italic = True
    r_sub.font.size = Pt(9.5)

    # PART I: 6 MASTER TIP TABLES
    p_p1 = doc.add_paragraph()
    p_p1.paragraph_format.space_before = Pt(4)
    p_p1.paragraph_format.space_after = Pt(4)
    r_p1 = p_p1.add_run("PHẦN I. BÍ KÍP & MẸO GHI NHỚ HỆ THỐNG (ĐỌC TRƯỚC ĐỂ NẮM 60% QUY LUẬT)")
    r_p1.bold = True
    r_p1.font.size = Pt(12)
    r_p1.font.color.rgb = RGBColor(0xB9, 0x1C, 0x1C)

    for sec in master_tips:
        p_sec = doc.add_paragraph()
        p_sec.paragraph_format.space_before = Pt(6)
        p_sec.paragraph_format.space_after = Pt(2)
        p_sec.paragraph_format.keep_with_next = True
        r_sec = p_sec.add_run(f"{sec['title']} — {sec['summary']}")
        r_sec.bold = True
        r_sec.font.size = Pt(10.5)
        r_sec.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

        tbl = doc.add_table(rows=1, cols=3)
        tbl.style = "Table Grid"
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False

        hdr_cells = tbl.rows[0].cells
        headers = [("Mốc / Từ khóa", Cm(4.2)), ("Quy luật & Mẹo ghi nhớ nhanh", Cm(11.8)), ("Câu áp dụng", Cm(2.3))]
        for idx, (h_text, width) in enumerate(headers):
            hdr_cells[idx].width = width
            set_cell_background(hdr_cells[idx], "DBEAFE")
            set_cell_margins(hdr_cells[idx], top=50, bottom=50, left=80, right=80)
            p_h = hdr_cells[idx].paragraphs[0]
            p_h.paragraph_format.space_after = Pt(0)
            r_h = p_h.add_run(h_text)
            r_h.bold = True
            r_h.font.size = Pt(9.5)

        for item in sec["items"]:
            row_cells = tbl.add_row().cells
            row_cells[0].width = Cm(4.2)
            row_cells[1].width = Cm(11.8)
            row_cells[2].width = Cm(2.3)
            for c in row_cells:
                set_cell_margins(c, top=45, bottom=45, left=80, right=80)

            p0 = row_cells[0].paragraphs[0]
            p0.paragraph_format.space_after = Pt(0)
            r0 = p0.add_run(item["key"])
            r0.bold = True
            r0.font.size = Pt(9.5)

            p1 = row_cells[1].paragraphs[0]
            p1.paragraph_format.space_after = Pt(0)
            r1 = p1.add_run(item["rule"])
            r1.font.size = Pt(9.5)

            p2 = row_cells[2].paragraphs[0]
            p2.paragraph_format.space_after = Pt(0)
            q_str = ", ".join(str(x) for x in item["questions"])
            r2 = p2.add_run(f"Câu {q_str}")
            r2.font.size = Pt(9)
            r2.italic = True

    # PART II: 340 QUESTIONS GROUPED BY 10 TOPICS (STUDY FORMAT)
    p_p2 = doc.add_paragraph()
    p_p2.paragraph_format.space_before = Pt(10)
    p_p2.paragraph_format.space_after = Pt(4)
    r_p2 = p_p2.add_run(
        "PHẦN II. LÝ THUYẾT TRỌNG TÂM, ĐÁP ÁN ĐÚNG, MẸO NHỚ & GIẢI THÍCH CHI TIẾT 340 CÂU (THEO 10 CHUYÊN ĐỀ)"
    )
    r_p2.bold = True
    r_p2.font.size = Pt(12)
    r_p2.font.color.rgb = RGBColor(0xB9, 0x1C, 0x1C)

    p_guide = doc.add_paragraph()
    p_guide.paragraph_format.space_after = Pt(6)
    r_g = p_guide.add_run(
        "Hướng dẫn học nhanh: Phần chữ IN ĐẬM GẠCH CHÂN trong câu hỏi và đáp án chính là 'Cặp Từ Khóa Vàng'. "
        "Khi ôn tập, chỉ cần nhìn cụm gạch chân ở câu hỏi là phản xạ ngay ra cụm gạch chân ở đáp án đúng!"
    )
    r_g.italic = True
    r_g.font.size = Pt(9.5)

    for t in topics:
        t_qs = [q for q in questions if q["topic_id"] == t["id"]]
        p_th = doc.add_paragraph()
        p_th.paragraph_format.space_before = Pt(8)
        p_th.paragraph_format.space_after = Pt(3)
        p_th.paragraph_format.keep_with_next = True
        r_th = p_th.add_run(f"CHUYÊN ĐỀ {t['name'].upper()} ({len(t_qs)} CÂU)")
        r_th.bold = True
        r_th.font.size = Pt(11)
        r_th.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

        for q in t_qs:
            # Question + Answer + Tip + Explanation in a super compact block
            p_item = doc.add_paragraph()
            p_item.paragraph_format.space_before = Pt(2)
            p_item.paragraph_format.space_after = Pt(3)
            p_item.paragraph_format.line_spacing = 1.08

            # 1. Question number & Question text
            r_num = p_item.add_run(f"Câu {q['id']}. ")
            r_num.bold = True
            r_num.font.size = Pt(10)
            r_num.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

            q_single_line = re.sub(r'\s*\n\s*', ' / ', q["question"].strip())
            add_highlighted_text(
                p_item,
                q_single_line,
                q.get("question_keyword", ""),
                base_bold=False,
                kw_bold=True,
                kw_underline=True,
                kw_color=None,
                font_size=10
            )

            # 2. Correct Answer line
            p_item.add_run("\n   ➤ ")
            r_ans_lbl = p_item.add_run(f"Đáp án đúng [{q['answer']}]: ")
            r_ans_lbl.bold = True
            r_ans_lbl.font.size = Pt(9.5)
            r_ans_lbl.font.color.rgb = RGBColor(0x04, 0x78, 0x57)

            ans_expanded = expand_correct_answer_text(q)
            add_highlighted_text(
                p_item,
                ans_expanded,
                q.get("answer_keyword", ""),
                base_bold=False,
                kw_bold=True,
                kw_underline=True,
                kw_color=RGBColor(0x04, 0x78, 0x57),
                font_size=9.5
            )

            # 3. Tip & Explanation line
            p_item.add_run("\n   • ")
            r_tip_lbl = p_item.add_run("Mẹo nhớ: ")
            r_tip_lbl.bold = True
            r_tip_lbl.font.size = Pt(9.5)
            r_tip_lbl.font.color.rgb = RGBColor(0xB4, 0x53, 0x09)

            r_tip_txt = p_item.add_run(f"{q.get('tip', '')} ")
            r_tip_txt.font.size = Pt(9.5)

            r_exp_lbl = p_item.add_run("| Giải thích: ")
            r_exp_lbl.bold = True
            r_exp_lbl.font.size = Pt(9.5)

            legal_str = f" ({q['legal_note']})" if q.get("legal_note") else ""
            r_exp_txt = p_item.add_run(f"{q.get('explanation', '')}{legal_str}")
            r_exp_txt.font.size = Pt(9.5)

    doc.save(filename)
    print(f"Saved Theory Word file: {filename}")


def build_quiz_docx(questions, topics, filename):
    doc = Document()

    # Ultra compact style for paper saving
    style = doc.styles["Normal"]
    style.font.name = "Times New Roman"
    style.font.size = Pt(9.5)
    style.paragraph_format.line_spacing = 1.03
    style.paragraph_format.space_before = Pt(0)
    style.paragraph_format.space_after = Pt(1.5)

    # Section 1: Header (1 column)
    sec_top = doc.sections[0]
    sec_top.page_width = Cm(21.0)
    sec_top.page_height = Cm(29.7)
    sec_top.top_margin = Cm(1.0)
    sec_top.bottom_margin = Cm(1.0)
    sec_top.left_margin = Cm(1.1)
    sec_top.right_margin = Cm(1.0)
    set_section_columns(sec_top, num_cols=1, sep=False)
    add_page_number_to_footer(sec_top)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(1)
    r_t = p_title.add_run("BỘ ĐỀ LUYỆN TẬP TRẮC NGHIỆM 340 CÂU NGHIỆP VỤ CHUYÊN MÔN VỀ ĐẤU THẦU")
    r_t.bold = True
    r_t.font.size = Pt(13)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(4)
    r_sub = p_sub.add_run(
        "(Bản in siêu tiết kiệm giấy 2 cột để tự khoanh trắc nghiệm • Bảng Đáp Án Chuẩn 340 câu nằm ở trang cuối tài liệu)"
    )
    r_sub.italic = True
    r_sub.font.size = Pt(9)

    # Section 2: Continuous 2-column layout for the 340 multiple-choice questions!
    from docx.enum.section import WD_SECTION
    sec_cols = doc.add_section(WD_SECTION.CONTINUOUS)
    sec_cols.top_margin = Cm(1.0)
    sec_cols.bottom_margin = Cm(1.0)
    sec_cols.left_margin = Cm(1.1)
    sec_cols.right_margin = Cm(1.0)
    set_section_columns(sec_cols, num_cols=2, space_dxa=280, sep=True)

    for q in questions:
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_before = Pt(2)
        p_q.paragraph_format.space_after = Pt(1.5)
        p_q.paragraph_format.line_spacing = 1.03

        r_id = p_q.add_run(f"Câu {q['id']}. ")
        r_id.bold = True
        r_id.font.size = Pt(9.5)

        q_clean = re.sub(r'\s*\n\s*', '\n', q["question"].strip())
        r_qt = p_q.add_run(q_clean)
        r_qt.bold = True
        r_qt.font.size = Pt(9.5)

        opts = q["options"]
        a_txt = f"A. {opts['A']}"
        b_txt = f"B. {opts['B']}"
        c_txt = f"C. {opts['C']}"
        d_txt = f"D. {opts['D']}"

        max_len = max(len(a_txt), len(b_txt), len(c_txt), len(d_txt))
        total_len = len(a_txt) + len(b_txt) + len(c_txt) + len(d_txt)

        # Smart inline layout to save paper!
        if total_len <= 62 and max_len <= 18:
            # All 4 options fit on a single line in 1 column!
            r_opt = p_q.add_run(f"\n{a_txt}    {b_txt}    {c_txt}    {d_txt}")
            r_opt.font.size = Pt(9.5)
        elif max_len <= 32:
            # 2 options per line
            r_opt = p_q.add_run(f"\n{a_txt}      {b_txt}\n{c_txt}      {d_txt}")
            r_opt.font.size = Pt(9.5)
        else:
            # 1 option per line inside the same paragraph (saves paragraph spacing!)
            r_opt = p_q.add_run(f"\n{a_txt}\n{b_txt}\n{c_txt}\n{d_txt}")
            r_opt.font.size = Pt(9.5)

    # Section 3: New Page at the end for Answer Key Grid (1 column)
    sec_ans = doc.add_section(WD_SECTION.NEW_PAGE)
    sec_ans.top_margin = Cm(1.0)
    sec_ans.bottom_margin = Cm(1.0)
    sec_ans.left_margin = Cm(1.1)
    sec_ans.right_margin = Cm(1.0)
    set_section_columns(sec_ans, num_cols=1, sep=False)

    p_ak = doc.add_paragraph()
    p_ak.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ak.paragraph_format.space_after = Pt(4)
    r_ak = p_ak.add_run("BẢNG ĐÁP ÁN CHUẨN 340 CÂU (DÙNG ĐỂ TRA CỨU & TỰ CHẤM ĐIỂM)")
    r_ak.bold = True
    r_ak.font.size = Pt(12)

    # Create a 10-column grid table (34 rows x 10 cols = 340 cells)
    cols_count = 10
    rows_count = 34
    tbl = doc.add_table(rows=rows_count, cols=cols_count)
    tbl.style = "Table Grid"
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER

    for r_idx in range(rows_count):
        row_cells = tbl.rows[r_idx].cells
        for c_idx in range(cols_count):
            q_num = r_idx * cols_count + c_idx + 1
            cell = row_cells[c_idx]
            set_cell_margins(cell, top=30, bottom=30, left=40, right=40)
            p_c = cell.paragraphs[0]
            p_c.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_c.paragraph_format.space_after = Pt(0)
            if q_num <= len(questions):
                q_obj = questions[q_num - 1]
                r_n = p_c.add_run(f"{q_num}: ")
                r_n.font.size = Pt(9)
                r_a = p_c.add_run(q_obj["answer"])
                r_a.bold = True
                r_a.font.size = Pt(9.5)
                r_a.font.color.rgb = RGBColor(0xB9, 0x1C, 0x1C)

    doc.save(filename)
    print(f"Saved Quiz Word file: {filename}")


if __name__ == "__main__":
    questions, topics, master_tips = load_data()
    build_theory_docx(
        questions,
        topics,
        master_tips,
        "1_Tai_Lieu_Hoc_Ly_Thuyet_Va_Meo_Nho_340_Cau_Dau_Thau.docx"
    )
    build_quiz_docx(
        questions,
        topics,
        "2_Bo_De_Trac_Nghiem_340_Cau_In_Tiet_Kiem_Giay.docx"
    )


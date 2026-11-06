# -*- coding: utf-8 -*-
import json
import re
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from generate_word_docs import (
    set_cell_background,
    set_cell_margins,
    add_page_number_to_footer,
    add_highlighted_text,
    expand_correct_answer_text,
)

TRAP_GROUPS = [
    {
        "id": "G1",
        "title": "NHÓM 1: 13 CÂU BẪY TÍNH TOÁN CON SỐ, HỢP ĐỒNG TƯƠNG TỰ & THỜI GIAN CHÀO GIÁ",
        "desc": "Các câu hỏi có bẫy công thức (chia theo chu kỳ 1 năm, cùng mã HS lấy hạng mục lớn nhất, tách hợp đồng, tính phí kiến nghị khi trượt kỹ thuật, giờ kết thúc chào giá rút gọn).",
        "q_ids": [69, 70, 76, 78, 79, 104, 112, 113, 114, 117, 189, 266, 271],
    },
    {
        "id": "G2",
        "title": "NHÓM 2: 20 CÂU BẪY CÓ 'TẤT CẢ ĐỀU ĐÚNG' HOẶC 'A VÀ B ĐỀU ĐÚNG' NHƯNG KHÔNG ĐƯỢC CHỌN D!",
        "desc": "Theo phản xạ, thí sinh thấy 'Tất cả phương án trên đều đúng' rất hay chọn D. Nhưng ở 20 câu dưới đây, phương án D là BẪY!",
        "q_ids": [20, 27, 29, 30, 43, 46, 73, 85, 92, 103, 108, 110, 115, 232, 237, 247, 269, 273, 274, 300],
    },
    {
        "id": "G3",
        "title": "NHÓM 3: 12 CÂU DỄ SAI DO THAY ĐỔI THẨM QUYỀN MỚI (LUẬT 90/2025 & NĐ 214/2025)",
        "desc": "Ai suy luận theo quy định cũ sẽ làm sai 100% (Chủ đầu tư duyệt KHLCNT, tự quyết thời gian đánh giá/phê duyệt, quyết định xử lý tình huống phức tạp, bỏ thẩm định ở nhiều hình thức).",
        "q_ids": [89, 125, 129, 130, 131, 132, 133, 151, 153, 154, 194, 254],
    },
    {
        "id": "G4",
        "title": "NHÓM 4: 13 CÂU BẪY TÌNH HUỐNG VỀ BẢO ĐẢM CẠNH TRANH & LIÊN DANH VI PHẠM",
        "desc": "Phân biệt cực kỹ: Anh em ruột dự thầu; Chi cục (hành chính) vs Đơn vị sự nghiệp; Liên danh khi nào cấm riêng 1 thành viên, khi nào cấm cả liên danh, khi nào tịch thu bảo đảm.",
        "q_ids": [28, 81, 98, 102, 116, 163, 168, 169, 195, 198, 205, 207, 211],
    },
    {
        "id": "G5",
        "title": "NHÓM 5: 14 CÂU BẪY PHỦ ĐỊNH, NGOẠI LỆ HIỆP ĐỊNH CPTPP & 3 CÂU 'TẤT CẢ ĐỀU SAI'",
        "desc": "Các câu hỏi ngược ('không đúng', 'không bắt buộc'), câu đáp án 'Tất cả đều sai' (296, 301, 314) và các điểm đặc thù của CPTPP (không cho phép đấu thầu qua mạng).",
        "q_ids": [17, 55, 65, 96, 97, 174, 179, 180, 245, 296, 301, 314, 321, 336],
    },
]


def main():
    with open("questions_enriched.json", "r", encoding="utf-8") as f:
        questions = json.load(f)

    trap_map = {}
    for g in TRAP_GROUPS:
        for qid in g["q_ids"]:
            trap_map[qid] = g["title"]

    for q in questions:
        qid = q["id"]
        q["is_trap"] = qid in trap_map
        q["trap_group"] = trap_map.get(qid, "")

    with open("questions_enriched.json", "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    js_content = "// Bộ 340 câu hỏi ôn thi chứng chỉ nghiệp vụ chuyên môn về đấu thầu\nwindow.QUESTIONS_DATA = " + json.dumps(questions, ensure_ascii=False, indent=2) + ";\n"
    with open("questions-data.js", "w", encoding="utf-8") as f:
        f.write(js_content)

    q_by_id = {q["id"]: q for q in questions}

    # Build Word Doc for the 72 Trickiest Questions
    doc = Document()
    style = doc.styles["Normal"]
    style.font.name = "Times New Roman"
    style.font.size = Pt(10)
    style.paragraph_format.line_spacing = 1.08
    style.paragraph_format.space_before = Pt(0)
    style.paragraph_format.space_after = Pt(2)

    section = doc.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(1.2)
    section.bottom_margin = Cm(1.2)
    section.left_margin = Cm(1.5)
    section.right_margin = Cm(1.2)
    add_page_number_to_footer(section)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(2)
    r_t = p_title.add_run("SỔ TAY 72 CÂU HỎI DỄ SAI & NHIỀU BẪY NHẤT TRONG BỘ ĐỀ 340 CÂU ĐẤU THẦU")
    r_t.bold = True
    r_t.font.size = Pt(13.5)
    r_t.font.color.rgb = RGBColor(0xB9, 0x1C, 0x1C)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(6)
    r_sub = p_sub.add_run(
        "Tổng hợp 5 nhóm câu hỏi có tỷ lệ thí sinh làm sai cao nhất • Phân tích rõ 'Bẫy hay nhầm' và 'Mẹo chốt đáp án đúng'"
    )
    r_sub.italic = True
    r_sub.font.size = Pt(9.5)

    for g in TRAP_GROUPS:
        p_gh = doc.add_paragraph()
        p_gh.paragraph_format.space_before = Pt(8)
        p_gh.paragraph_format.space_after = Pt(2)
        p_gh.paragraph_format.keep_with_next = True
        r_gh = p_gh.add_run(g["title"])
        r_gh.bold = True
        r_gh.font.size = Pt(11)
        r_gh.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

        p_gd = doc.add_paragraph()
        p_gd.paragraph_format.space_after = Pt(4)
        p_gd.paragraph_format.keep_with_next = True
        r_gd = p_gd.add_run(g["desc"])
        r_gd.italic = True
        r_gd.font.size = Pt(9.5)

        for qid in g["q_ids"]:
            q = q_by_id[qid]
            p_item = doc.add_paragraph()
            p_item.paragraph_format.space_before = Pt(2)
            p_item.paragraph_format.space_after = Pt(3.5)
            p_item.paragraph_format.line_spacing = 1.08

            r_num = p_item.add_run(f"🔥 Câu {q['id']}. ")
            r_num.bold = True
            r_num.font.size = Pt(10)
            r_num.font.color.rgb = RGBColor(0xB9, 0x1C, 0x1C)

            q_single = re.sub(r'\s*\n\s*', ' / ', q["question"].strip())
            add_highlighted_text(
                p_item,
                q_single,
                q.get("question_keyword", ""),
                base_bold=True,
                kw_bold=True,
                kw_underline=True,
                kw_color=RGBColor(0x1E, 0x3A, 0x8A),
                font_size=10
            )

            # Show all 4 options briefly if it's a trap question so user sees the trap option vs right option
            p_item.add_run("\n   ➤ ")
            r_ans_lbl = p_item.add_run(f"ĐÁP ÁN ĐÚNG [{q['answer']}]: ")
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

            p_item.add_run("\n   ⚠️ ")
            r_tip_lbl = p_item.add_run("Mẹo tránh bẫy & Ghi nhớ: ")
            r_tip_lbl.bold = True
            r_tip_lbl.font.size = Pt(9.5)
            r_tip_lbl.font.color.rgb = RGBColor(0xB4, 0x53, 0x09)

            r_tip_txt = p_item.add_run(f"{q.get('tip', '')} — ")
            r_tip_txt.font.size = Pt(9.5)

            r_exp_txt = p_item.add_run(f"{q.get('explanation', '')}")
            r_exp_txt.font.size = Pt(9.5)

    out_docx = "3_Bo_72_Cau_Hoi_De_Sai_Va_Nhieu_Bay_Nhat.docx"
    doc.save(out_docx)
    print(f"Saved {out_docx} with {len(trap_map)} trap questions!")


if __name__ == "__main__":
    main()


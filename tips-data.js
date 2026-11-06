// Dữ liệu Bí Kíp & Mẹo Ghi Nhớ Nhanh Hệ Thống 340 Câu Đấu Thầu
window.BIDDING_TOPICS = [
  {
    id: "T1",
    name: "1. Quy định chung, Đối tượng & Ưu đãi",
    shortName: "Quy định chung & Ưu đãi",
    icon: "⚖️",
    color: "#2563eb",
    desc: "Phạm vi điều chỉnh, đối tượng áp dụng, ngôn ngữ, lưu trữ hồ sơ, bảo đảm cạnh tranh và ưu đãi trong đấu thầu."
  },
  {
    id: "T2",
    name: "2. Hình thức LCNT & Kế hoạch LCNT",
    shortName: "Hình thức & KHLCNT",
    icon: "📋",
    color: "#7c3aed",
    desc: "Các hình thức lựa chọn nhà thầu (chỉ định thầu, chào hàng cạnh tranh, mua sắm trực tiếp, đặt hàng...), hạn mức và lập KHLCNT."
  },
  {
    id: "T3",
    name: "3. Lập HSMT/E-HSMT & Tiêu chuẩn đánh giá",
    shortName: "HSMT & Tiêu chuẩn",
    icon: "📑",
    color: "#0891b2",
    desc: "Căn cứ lập HSMT, tiêu chuẩn đánh giá tính hợp lệ, năng lực kinh nghiệm, kỹ thuật, tài chính, hợp đồng tương tự, nhãn hiệu, xuất xứ."
  },
  {
    id: "T4",
    name: "4. Đánh giá HSDT, Thương thảo & Xét duyệt",
    shortName: "Đánh giá & Xét duyệt",
    icon: "🔍",
    color: "#059669",
    desc: "Quy trình đánh giá HSDT/E-HSDT, làm rõ, sửa lỗi, hiệu chỉnh sai lệch, thương thảo hợp đồng và điều kiện xét duyệt trúng thầu."
  },
  {
    id: "T5",
    name: "5. Hợp đồng đấu thầu & Bảo đảm THHĐ",
    shortName: "Hợp đồng đấu thầu",
    icon: "🤝",
    color: "#d97706",
    desc: "Các loại hợp đồng (trọn gói, đơn giá, theo thời gian, tỷ lệ %, chi phí cộng phí...), bảo đảm thực hiện hợp đồng, sửa đổi hợp đồng."
  },
  {
    id: "T6",
    name: "6. Mua sắm tập trung",
    shortName: "Mua sắm tập trung",
    icon: "🏢",
    color: "#db2777",
    desc: "Danh mục mua sắm tập trung, đơn vị mua sắm tập trung, thỏa thuận khung (tối đa 36 tháng), trách nhiệm và xử lý vi phạm."
  },
  {
    id: "T7",
    name: "7. Trách nhiệm, Xử lý vi phạm & Kiến nghị",
    shortName: "Vi phạm & Kiến nghị",
    icon: "🚨",
    color: "#dc2626",
    desc: "Thẩm quyền của Người có thẩm quyền & Chủ đầu tư, thời gian cấm thầu (6th-1năm, 1-3năm, 3-5năm), quy trình và chi phí giải quyết kiến nghị."
  },
  {
    id: "T8",
    name: "8. Xử lý tình huống & Hủy thầu",
    shortName: "Xử lý tình huống",
    icon: "🛠️",
    color: "#ea580c",
    desc: "Các tình huống phức tạp trong đấu thầu, chia phần, giá thấp khác thường, thay đổi hàng hóa, liên danh vi phạm, hủy thầu, đình chỉ."
  },
  {
    id: "T9",
    name: "9. Đấu thầu qua mạng & Chào giá/Mua sắm trực tuyến",
    shortName: "Đấu thầu qua mạng",
    icon: "💻",
    color: "#4f46e5",
    desc: "Hệ thống mạng ĐTQG, E-HSDT, hệ thống tự động đánh giá, sự cố hệ thống, Chào giá trực tuyến (thông thường/rút gọn) & Mua sắm trực tuyến."
  },
  {
    id: "T10",
    name: "10. Hiệp định quốc tế (CPTPP, EVFTA, UKVFTA) & Hiệu lực",
    shortName: "Hiệp định & Hiệu lực",
    icon: "🌐",
    color: "#0d9488",
    desc: "Đấu thầu nội khối theo CPTPP, EVFTA, UKVFTA (NĐ 95/2020, NĐ 09/2022, NĐ 17/2025) và mốc hiệu lực Luật 90/2025/QH15, TT 80/2025/TT-BTC."
  }
];

window.MASTER_TIPS = [
  {
    id: "numbers-money",
    title: "1. Bảng Nhớ Nhanh Các Con Số Hạn Mức Tiền Tệ",
    icon: "💰",
    badge: "Cực hay hỏi",
    summary: "Chỉ cần nhớ đúng 7 mốc tiền tệ này là giải quyết ngay ~25 câu hỏi về hạn mức trong đề!",
    items: [
      {
        key: "≤ 50 triệu đồng",
        rule: "Mua sắm không phải lập KHLCNT (chỉ cần tiết kiệm, hiệu quả, đủ hóa đơn chứng từ) HOẶC được lập KHLCNT để đấu thầu. Cũng là mốc Bảo đảm dự thầu < 50 triệu đồng thì chỉ cần cam kết trong đơn dự thầu (không phải đính kèm thư bảo lãnh khi nộp E-HSDT).",
        questions: [44, 66, 67, 225]
      },
      {
        key: "≤ 500 triệu đồng",
        rule: "1) Hạn mức CHỈ ĐỊNH THẦU đối với gói thầu thuộc DỰ TOÁN MUA SẮM thường xuyên (không hình thành dự án).\n2) Hạn mức MUA SẮM TRỰC TUYẾN đối với hàng hóa, dịch vụ thuộc DỰ TOÁN MUA SẮM.\n3) Gói thầu dưới 500 triệu thuộc dự toán mua sắm: CĐT được quyết định cho phép nhà thầu có ≥ 50% lao động là người khuyết tật, thương binh, dân tộc thiểu số (HĐLĐ ≥ 3 tháng) tham dự.",
        questions: [33, 251, 253, 297]
      },
      {
        key: "≤ 01 tỷ đồng",
        rule: "Hạn mức MUA SẮM TRỰC TUYẾN đối với hàng hóa, dịch vụ thuộc DỰ ÁN ĐẦU TƯ (nhớ: Dự toán mua sắm = 500 triệu; Dự án = 1 tỷ).",
        questions: [253]
      },
      {
        key: "≤ 02 tỷ đồng",
        rule: "Hạn mức CHỈ ĐỊNH THẦU đối với gói thầu mua sắm hàng hóa, xây lắp, dịch vụ phi tư vấn, hỗn hợp thuộc DỰ ÁN ĐẦU TƯ (riêng tư vấn thuộc dự án là 800 triệu).",
        questions: [34]
      },
      {
        key: "≤ 10 tỷ đồng",
        rule: "1) Hạn mức áp dụng CHÀO HÀNG CẠNH TRANH (dịch vụ phi tư vấn thông dụng đơn giản, hàng hóa thông dụng sẵn có, xây lắp đơn giản).\n2) Gói hàng hóa/phi tư vấn ≤ 10 tỷ (hoặc xây lắp/hỗn hợp ≤ 20 tỷ) khi đóng thầu không có nhà thầu nộp E-HSDT thì gia hạn tối thiểu 05 ngày làm việc (nếu lớn hơn mốc này thì gia hạn tối thiểu 10 ngày).",
        questions: [31, 32, 233, 268]
      },
      {
        key: "Không giới hạn hạn mức",
        rule: "1) ĐẤU THẦU RỘNG RÃI: Không quy định hạn mức áp dụng (giá nào cũng được đấu rộng rãi).\n2) CHÀO GIÁ TRỰC TUYẾN THÔNG THƯỜNG đối với dự toán mua sắm hàng hóa: Không quy định hạn mức áp dụng.",
        questions: [37, 270]
      },
      {
        key: "25 triệu đồng (0,025%)",
        rule: "Chi phí giải quyết kiến nghị KQLCNT = 0,025% giá dự thầu của nhà thầu kiến nghị (tối thiểu 2 triệu, tối đa 50 triệu). Lưu ý BẪY Câu 189: Nhà thầu rớt kỹ thuật (gói 1 giai đoạn 2 túi hồ sơ) chưa được mở túi tài chính nên phải tính 0,025% x GIÁ GÓI THẦU (100 tỷ) = 25 triệu đồng (chứ không tính theo 90 tỷ tự khai!).",
        questions: [189]
      }
    ]
  },
  {
    id: "numbers-time",
    title: "2. Bảng Nhớ Nhanh Các Mốc Thời Gian (Giờ / Ngày / Tháng / Năm)",
    icon: "⏱️",
    badge: "Ăn điểm 100%",
    summary: "Các câu hỏi về thời hạn rất dễ nhầm giữa 'ngày' và 'ngày làm việc'. Ghi nhớ bảng này để chọn chuẩn xác!",
    items: [
      {
        key: "02 giờ",
        rule: "1) Đấu thầu QUA MẠNG: Chủ đầu tư phải mở thầu và công khai biên bản mở thầu trong thời hạn không quá 02 giờ kể từ thời điểm đóng thầu.\n2) Sự cố Hệ thống: Tự động gia hạn các gói thầu có thời điểm đóng thầu/kết thúc chào giá trực tuyến trong khoảng từ khi sự cố đến sau khi khắc phục xong 02 giờ.",
        questions: [227, 230, 275]
      },
      {
        key: "24 giờ",
        rule: "Đấu thầu KHÔNG QUA MẠNG: Biên bản mở thầu phải được đăng tải trên Hệ thống mạng ĐTQG trong thời hạn 24 giờ kể từ thời điểm mở thầu.",
        questions: [124]
      },
      {
        key: "02 ngày làm việc",
        rule: "1) Nộp chi phí giải quyết kiến nghị: Trong 02 ngày làm việc kể từ ngày nhận được thông báo của bộ phận thường trực.\n2) Giải thích lý do không trúng thầu: Chủ đầu tư phải trả lời trong 02 ngày làm việc kể từ ngày nhà thầu yêu cầu.",
        questions: [185, 315]
      },
      {
        key: "03 ngày làm việc",
        rule: "1) Thời gian tối thiểu Chủ đầu tư dành cho nhà thầu để làm rõ E-HSDT (bổ sung cam kết bảo hành, bảo trì...): Không ít hơn 03 ngày làm việc.\n2) Chào giá trực tuyến rút gọn: Nhà thầu xác nhận chấp thuận được trao hợp đồng trong tối đa 03 ngày làm việc.\n3) Mua sắm trực tuyến: Nhà thầu xác nhận hoặc từ chối đơn hàng trong 03 ngày làm việc.\n4) Chào giá trực tuyến thông thường: Gửi thông báo mời trước thời điểm bắt đầu chào giá tối thiểu 03 ngày làm việc.",
        questions: [96, 235, 244, 308, 310]
      },
      {
        key: "05 ngày làm việc",
        rule: "Con số 'VÀNG' xuất hiện nhiều nhất:\n1) Đăng tải KHLCNT lên Hệ thống: Chậm nhất 05 ngày làm việc kể từ ngày ban hành.\n2) Đăng tải thông tin chủ yếu của hợp đồng: Chậm nhất 05 ngày làm việc kể từ ngày hợp đồng CÓ HIỆU LỰC.\n3) Nộp bổ sung HÀNG MẪU (đấu thầu qua mạng): Trong vòng 05 ngày làm việc sau thời điểm đóng thầu.\n4) Nộp bản gốc bảo lãnh dự thầu giấy khi CĐT yêu cầu: Trong vòng 05 ngày làm việc.",
        questions: [42, 68, 218, 259, 299]
      },
      {
        key: "07 ngày làm việc",
        rule: "Chủ đầu tư đăng tải danh sách nhà thầu có hành vi vi phạm và bị đánh giá về uy tín trên Hệ thống trong thời hạn 07 ngày làm việc kể từ ngày nhà thầu có hành vi vi phạm.",
        questions: [219]
      },
      {
        key: "10 ngày (ngày thường)",
        rule: "1) Trả lại nguyên trạng HSĐX tài chính của gói TƯ VẤN không qua mạng không vượt qua bước kỹ thuật: Trong thời hạn 10 ngày kể từ ngày ký hợp đồng.\n2) Gia hạn đóng thầu khi không có nhà thầu hoặc chỉ có 1 nhà thầu (gói xây lắp rộng rãi / gói hàng hóa 15 tỷ > 10 tỷ): Tối thiểu 10 ngày.",
        questions: [26, 90, 268]
      },
      {
        key: "30 ngày",
        rule: "Hội đồng giải quyết kiến nghị phải có văn bản giải quyết kiến nghị về KQLCNT trong thời hạn 30 ngày kể từ ngày Hội đồng được thành lập.",
        questions: [177]
      },
      {
        key: "12 tháng / 24 tháng / 36 tháng",
        rule: "• 12 tháng: Điều kiện Mua sắm trực tiếp (từ khi ký HĐ trước đến ngày phê duyệt KQ mua sắm trực tiếp không quá 12 tháng).\n• 24 tháng: Thời gian áp dụng Mua sắm trực tuyến tối đa 24 tháng.\n• 36 tháng: Thời hạn áp dụng Thỏa thuận khung (mua sắm tập trung) không quá 36 tháng.",
        questions: [39, 139, 221]
      },
      {
        key: "03 năm / 05 năm / 10 năm",
        rule: "• 03 năm: Kinh nghiệm tối thiểu của thành viên Tổ chuyên gia thuộc tổ chức tư vấn đấu thầu.\n• 05 năm: Thời hạn lưu trữ hồ sơ trong trường hợp HỦY THẦU (kể từ ngày ban hành QĐ hủy thầu).\n• 10 năm: Thời hiệu áp dụng biện pháp CẤM tham gia hoạt động đấu thầu (10 năm tính từ ngày XẢY RA hành vi vi phạm).",
        questions: [16, 23, 158]
      }
    ]
  },
  {
    id: "numbers-percent",
    title: "3. Bảng Nhớ Nhanh Tỷ Lệ Phần Trăm (%) & Cách Tính Hợp Đồng Tương Tự",
    icon: "📊",
    badge: "Hay nhầm lẫn",
    summary: "Nắm vững các công thức tính quy mô hợp đồng tương tự, điểm kỹ thuật và tỷ lệ bảo đảm.",
    items: [
      {
        key: "Hợp đồng tương tự theo chu kỳ năm (Câu 70, 79, 117)",
        rule: "Gói thầu có tính chất lặp lại theo chu kỳ qua các năm (như thuê máy chủ 5 năm, giặt là 3 năm, mua sắm 2 năm):\n• Tính giá trị 1 năm = Giá gói thầu / Số năm.\n• Hàng hóa (Câu 79): Bằng 50% giá trị 1 năm.\n• Phi tư vấn như thuê máy chủ, giặt là (Câu 70, 117): Bằng 30% giá trị 1 năm! Ví dụ Câu 70: 5 tỷ / 5 năm = 1 tỷ/năm -> 30% của 1 tỷ = 300 triệu đồng! Câu 117: 12 tỷ / 3 năm = 4 tỷ/năm -> 30% của 4 tỷ = 1,2 tỷ đồng (được cộng dồn các HĐ trong vòng 12 tháng đối với phi tư vấn!).",
        questions: [70, 79, 113, 117]
      },
      {
        key: "Hợp đồng tương tự cùng Mã HS (Câu 78, 114)",
        rule: "• Nếu gói thầu có nhiều hàng hóa CÙNG MÃ HS (Câu 78: Hàng A 4 tỷ và Hàng B 6 tỷ cùng mã HS 9035): Chỉ lấy 50% của hạng mục có giá trị LỚN NHẤT (50% x 6 tỷ = 3 tỷ đồng), KHÔNG cộng gộp thành 5 tỷ!\n• Nếu gói thầu có nhiều hàng hóa KHÁC MÃ HS (Câu 114: Điều hòa 1 tỷ = cần 500tr; Laptop 2 tỷ = cần 1 tỷ): Một hạng mục chỉ được chứng minh bằng tối đa 01 hợp đồng (nên tách điều hòa làm 2 hợp đồng 400tr + 100tr như đáp án A Câu 114 là KHÔNG ĐÁP ỨNG!).",
        questions: [78, 93, 114]
      },
      {
        key: "Công trình tương tự cấp thấp hơn (Câu 76, 112)",
        rule: "• Tổ hợp nhiều công trình (Câu 76): Chỉ xét theo công trình CHÍNH có cấp cao nhất (Nhà A1 cấp II, quy mô ≥ 50% x 2X), không bắt buộc phải có hàng rào, nhà bảo vệ.\n• Quy đổi công trình cấp thấp hơn liền kề (Câu 112): Đang xét Nhà cấp II giá trị 60 tỷ -> Nhà thầu được dùng 02 công trình Nhà cấp III mà MỖI công trình có giá trị ≥ 50% x 60 tỷ = 30 tỷ (vậy cặp 30 tỷ và 50 tỷ là ĐẠT).",
        questions: [76, 92, 112]
      },
      {
        key: "Mua sắm tập trung giảm quy mô HĐ tương tự: Y / 1,25",
        rule: "Mua sắm tập trung hoặc số lượng lớn: Có thể điều chỉnh giảm yêu cầu quy mô hợp đồng tương tự xuống còn Y/1,25 (Y thông thường khoảng 50% giá trị gói thầu) và/hoặc chia thành các phần (lô).",
        questions: [150]
      },
      {
        key: "Điểm uy tín tư vấn = 50 điểm (thang 1.000) & Điểm kỹ thuật tối thiểu = 70%",
        rule: "• Gói thầu tư vấn chấm thang 1.000 điểm: Điểm tiêu chí uy tín mặc định là 50 điểm (Câu 69).\n• Phương pháp chấm điểm kỹ thuật: Mức điểm yêu cầu tối thiểu về kỹ thuật KHÔNG THẤP HƠN 70% tổng số điểm kỹ thuật (Câu 281).",
        questions: [69, 281]
      },
      {
        key: "Chào giá trực tuyến rút gọn: Không thấp hơn 90%",
        rule: "Kể từ lượt chào giá thứ hai, giá chào của nhà thầu không được thấp hơn 90% giá thấp nhất đang hiển thị trên Hệ thống (để chống phá giá ảo). Đặc biệt: Chào giá trực tuyến rút gọn KHÔNG yêu cầu bảo đảm dự thầu và KHÔNG phải thẩm định KQLCNT!",
        questions: [248, 249, 254]
      },
      {
        key: "Bảo đảm thực hiện hợp đồng khi giá dự thầu thấp khác thường: Tối đa 30%",
        rule: "Thông thường BĐTHHĐ từ 2% - 10% giá hợp đồng (gói EC dự thầu bằng 85% giá gói thầu chưa phải thấp khác thường dưới 80% nên không được đòi 15% - Câu 207). Nhưng nếu giá dự thầu thấp khác thường hoặc không cân bằng (đấu thầu quốc tế), CĐT có thể yêu cầu BĐTHHĐ lớn hơn 10% nhưng TỐI ĐA KHÔNG QUÁ 30% giá hợp đồng (Câu 191, 209).",
        questions: [191, 207, 209]
      }
    ]
  },
  {
    id: "penalties-disputes",
    title: "4. Bảng Nhớ Nhanh Mức Cấm Thầu, Khóa Tài Khoản & Giải Quyết Kiến Nghị",
    icon: "🔨",
    badge: "Rất dễ lấy điểm",
    summary: "Phân biệt rõ thời gian cấm theo hành vi, xử lý thành viên liên danh và thẩm quyền giải quyết kiến nghị.",
    items: [
      {
        key: "Khung thời gian CẤM THẦU theo hành vi (Câu 160, 161, 162, 166, 167)",
        rule: "• Từ 03 năm đến 05 năm: Hành vi GIAN LẬN (làm giả hồ sơ, tài liệu), THÔNG THẦU (dàn xếp rút HSDT), đưa/nhận hối lộ.\n• Từ 01 năm đến 03 năm: Hành vi CẢN TRỞ; Tư vấn giám sát đồng thời thực hiện tư vấn kiểm định cùng gói thầu.\n• Từ 06 tháng đến 01 năm: Tham gia lập đồng thời tham gia thẩm định HSMT cùng 1 gói thầu.\n• Nhiều hành vi vi phạm cùng phạm vi: Cộng tổng thời gian cấm nhưng TỐI ĐA KHÔNG QUÁ 05 NĂM (thuộc thẩm quyền của Người có thẩm quyền).",
        questions: [160, 161, 162, 166, 167]
      },
      {
        key: "Liên danh A-B vi phạm: Khi nào cấm riêng A, khi nào cấm cả A và B? (Câu 116, 163, 168, 169)",
        rule: "Mẹo cực dễ nhớ:\n• Về BẢO ĐẢM DỰ THẦU (Câu 116): 1 thành viên gian lận -> KHÔNG hoàn trả bảo đảm dự thầu của CẢ LIÊN DANH A-B.\n• Về CẤM THẦU khi LÀM GIẢ HỒ SƠ của riêng mình (Câu 163, 168): Ai làm giả người nấy chịu -> Chỉ cấm riêng thành viên A (3 - 5 năm).\n• Về CẤM THẦU khi THÔNG THẦU / DÀN XẾP để liên danh trúng thầu (Câu 169): Vì mục đích cho cả liên danh trúng thầu -> Cấm TẤT CẢ thành viên liên danh A-B (3 - 5 năm)!",
        questions: [116, 163, 168, 169]
      },
      {
        key: "Khóa tài khoản / chức năng 06 tháng trên Hệ thống mạng ĐTQG",
        rule: "Khóa 06 tháng trong 3 trường hợp:\n1) Nhà thầu đã ký thỏa thuận khung nhưng không ký HĐ / không nộp BĐTHHĐ (06 tháng kể từ ngày đơn vị mua sắm tập trung công khai tên).\n2) Tư vấn đấu thầu dùng tài khoản của mình đăng tải thay Chủ đầu tư các nội dung thuộc trách nhiệm của CĐT.\n3) Chào giá trực tuyến rút gọn: Từ chối xác nhận trao HĐ -> Khóa chức năng chào giá trực tuyến 06 tháng kể từ ngày CĐT công khai tên (Câu 245 hỏi câu KHÔNG ĐÚNG -> chọn B 'Khóa 03 tháng từ ngày Bộ Tài chính...').",
        questions: [144, 217, 245]
      },
      {
        key: "Giải quyết kiến nghị: Ai giải quyết? (Câu 172 - 188)",
        rule: "• Kiến nghị TRƯỚC khi có thông báo KQLCNT: Do Chủ đầu tư, Người có thẩm quyền giải quyết (Nếu gửi đồng thời cả hai -> CHỦ ĐẦU TƯ giải quyết - Câu 179).\n• Kiến nghị VỀ KẾT QUẢ LCNT: Do Chủ đầu tư, Hội đồng giải quyết kiến nghị giải quyết (Nếu gửi đồng thời cho bộ phận thường trực HĐGQKN và CĐT -> HỘI ĐỒNG GIẢI QUYẾT KIẾN NGHỊ giải quyết - Câu 180).\n• Nếu đang giải quyết kiến nghị mà nhà thầu gửi đơn KHIẾU NẠI -> CHẤM DỨT NGAY việc giải quyết kiến nghị (Câu 174).\n• Nộp tiền và quản lý chi phí kiến nghị: Bộ phận thường trực giúp việc cho Chủ tịch Hội đồng giải quyết kiến nghị (Câu 175, 188).",
        questions: [172, 173, 174, 175, 179, 180, 188]
      }
    ]
  },
  {
    id: "authority-roles",
    title: "5. Bảng Phân Định Thẩm Quyền & Điểm Mới Đấu Thầu (Luật 90/2025 & NĐ 214/2025)",
    icon: "🏛️",
    badge: "Trọng tâm mới",
    summary: "Luật sửa đổi năm 2025 phân cấp rất mạnh cho Chủ đầu tư và bỏ vai trò Bên mời thầu ở nhiều khâu!",
    items: [
      {
        key: "Chủ đầu tư quyết định hầu hết quy trình (Không còn giới hạn cứng số ngày đánh giá/phê duyệt)",
        rule: "• Ai phê duyệt Kế hoạch lựa chọn nhà thầu (KHLCNT)? -> CHỦ ĐẦU TƯ phê duyệt (trừ trường hợp chưa xác định được CĐT). Người có thẩm quyền chỉ phê duyệt Kế hoạch TỔNG THỂ LCNT (Câu 151, 153, 154)!\n• Thời gian đánh giá HSDT, thời gian phê duyệt HSMT, thời gian phê duyệt KQLCNT: Đều do CHỦ ĐẦU TƯ quyết định trên cơ sở bảo đảm tiến độ của dự án, gói thầu (Câu 131, 132, 133)!\n• Thẩm quyền xử lý tình huống phức tạp (Câu 194): CHỦ ĐẦU TƯ quyết định xử lý tình huống sau khi có ý kiến của người có thẩm quyền.",
        questions: [131, 132, 133, 151, 153, 154, 194]
      },
      {
        key: "Miễn thẩm định ở các hình thức đơn giản",
        rule: "KHÔNG bắt buộc thẩm định ở các bước:\n1) Danh sách xếp hạng nhà thầu: Không phải thẩm định trước khi phê duyệt (Câu 89).\n2) Mua sắm trực tiếp: Không bao gồm bước thẩm định HSYC (Câu 129).\n3) Chào hàng cạnh tranh: Không bao gồm bước thẩm định KQLCNT (Câu 130).\n4) Chào giá trực tuyến rút gọn: Không phải thẩm định KQLCNT (Câu 254).",
        questions: [89, 129, 130, 254]
      },
      {
        key: "Phân biệt: Đình chỉ vs. Hủy thầu vs. Không công nhận KQLCNT vs. Hủy QĐ phê duyệt KQLCNT",
        rule: "• ĐÌNH CHỈ cuộc thầu (Câu 164): Trong quá trình tổ chức LCNT cho đến TRƯỚC khi phê duyệt KQLCNT.\n• HỦY THẦU (Câu 202): Từ ngày phát hành HSMST/HSMQT/HSMT/HSYC đến TRƯỚC khi ký kết hợp đồng, thỏa thuận khung.\n• KHÔNG CÔNG NHẬN KQLCNT (Câu 165): Thực hiện trong quá trình thực hiện hợp đồng (hoặc sau khi có KQLCNT phát hiện vi phạm).\n• HỦY QĐ PHÊ DUYỆT KQLCNT (Câu 205): Khi nhà thầu trúng thầu không tiến hành hoàn thiện, ký kết hợp đồng hoặc tại thời điểm ký HĐ không còn đáp ứng năng lực.",
        questions: [164, 165, 202, 205]
      },
      {
        key: "Cách tính thời điểm kết thúc Chào giá trực tuyến rút gọn (Câu 243, 266, 271)",
        rule: "Công thức giải nhanh Câu 266 và Câu 271:\n• Quy tắc 1: Thời điểm bắt đầu và kết thúc chào giá trực tuyến rút gọn BẮT BUỘC TRONG GIỜ HÀNH CHÍNH (từ 08h00, thứ 2 đến thứ 6) (Câu 243).\n• Quy tắc 2 (Câu 271 - Gói 01 tỷ đồng): Đăng TBMT lúc 11h00 Thứ 2 (15/9/2025) -> Thời gian chuẩn bị và chào giá tối thiểu theo ngày làm việc kết thúc sớm nhất vào đầu giờ hành chính Thứ 2 tuần kế tiếp: **08h00 ngày Thứ 2 (22/9/2025)**.\n• Quy tắc 3 (Câu 266 - Gói 02 tỷ đồng): Đăng TBMT lúc 11h00 Thứ 2 (15/9/2025) -> Kết thúc sớm nhất vào **08h00 ngày Thứ 4 (24/9/2025)**.",
        questions: [243, 266, 271]
      },
      {
        key: "Hiệp định quốc tế (CPTPP, EVFTA, UKVFTA) & Hiệu lực VBPL (Câu 319 - 340)",
        rule: "• Việt Nam mở cửa thị trường mua sắm chính phủ trong 3 Hiệp định: CPTPP, EVFTA, UKVFTA (chưa là thành viên GPA của WTO; RCEP không có quy định chỉ định thầu).\n• CPTPP ký ban đầu gồm: 11 nước (Câu 320); CPTPP KHÔNG cho phép áp dụng đấu thầu qua mạng (Câu 336 - Chọn A) và chỉ quy định 2 hình thức: Đấu thầu rộng rãi & Chỉ định thầu (Câu 335).\n• EVFTA có hiệu lực từ: 01/8/2020 (Câu 327). Mẫu HSMT hàng hóa UKVFTA theo: Thông tư 12/2022/TT-BKHĐT (Câu 328).\n• Luật số 90/2025/QH15 có hiệu lực từ: **01/7/2025** (Câu 339).\n• Thông tư 80/2025/TT-BTC có hiệu lực từ: **08/8/2025** (Câu 340).",
        questions: [319, 320, 321, 327, 328, 330, 335, 336, 339, 340]
      }
    ]
  },
  {
    id: "all-above-traps",
    title: "6. Thống Kê Đầy Đủ Các Câu 'Tất Cả Đều Đúng' (18 Câu), 'Hai Ý Đúng' (20 Câu) & Câu Bẫy",
    icon: "🎯",
    badge: "Thống kê 100%",
    summary: "Trong 340 câu: Có chính xác 18 câu chọn 'Tất cả các ý đều đúng' + 20 câu chọn 'Hai ý (A&B / B&C / A&C) đều đúng' (= 38 câu đáp án gộp). Hãy thuộc 16 câu BẪY không chọn 'Tất cả đều đúng' dưới đây để đạt độ chính xác 100%!",
    items: [
      {
        key: "✅ 18 Câu chọn 'Tất cả các phương án/đáp án trên đều đúng' (Chọn D)",
        rule: "Trong toàn bộ 340 câu có 34 câu xuất hiện dòng 'Tất cả/Các phương án trên đều đúng' hoặc 'Cả 3 phương án đều đúng', trong đó có ĐÚNG 18 CÂU chọn đáp án D là ĐÚNG:\n• Câu 2 (Phạm vi điều chỉnh Luật Đấu thầu)\n• Câu 10, 11 (Đối tượng và nhà thầu trong nước được hưởng ưu đãi)\n• Câu 101 (Xử lý khi rút E-HSDT sau đóng thầu)\n• Câu 113 (HĐ tương tự gói vệ sinh tòa nhà 1 tỷ)\n• Câu 118 (Chứng minh cam kết cung cấp tín dụng)\n• Câu 123 (Tài liệu thuộc hồ sơ hợp đồng)\n• Câu 135 (Thương thảo HĐ gói 1 giai đoạn 1 túi hồ sơ)\n• Câu 184 (Công khai tài liệu giải quyết kiến nghị)\n• Câu 213, 256 (Giá trị văn bản điện tử trên Hệ thống)\n• Câu 222 (Công việc phải thực hiện trên Hệ thống)\n• Câu 231 (Trách nhiệm nhà thầu khi tham dự thầu qua mạng)\n• Câu 238 (Đánh giá kết quả hoạt động tài chính qua mạng)\n• Câu 260 (Các gói thầu không phải đấu thầu qua mạng)\n• Câu 262 (Trách nhiệm theo dõi khi sửa đổi E-HSMT)\n• Câu 277 (Bảo lãnh dự thầu điện tử luôn đáp ứng giá trị, hiệu lực, thụ hưởng)\n• Câu 286 (Trường hợp áp dụng hợp đồng theo thời gian).",
        questions: [2, 10, 11, 101, 113, 118, 123, 135, 184, 213, 222, 231, 238, 256, 260, 262, 277, 286]
      },
      {
        key: "✅ 20 Câu chọn 'Hai phương án (A&B / B&C / A&C) đều đúng'",
        rule: "Có 20 câu mà đáp án đúng là phương án gộp 2 ý:\n• 17 câu chọn D ('A và B/C đều đúng' hoặc 'B và C đều đúng'): Câu 6 (Khái niệm đấu thầu), Câu 44 (Mua sắm ≤ 50 triệu), Câu 45 (Đền bù GPMB), Câu 71 (Lao động trong nước đấu thầu quốc tế), Câu 90 (Chỉ có 1 nhà thầu nộp HSDT gói xây lắp), Câu 93 (HĐ hàng hóa tương tự: lĩnh vực tổng quát hoặc 4 số mã HS), Câu 138 (Đơn vị mua sắm tập trung), Câu 176 (Không hoàn trả phí kiến nghị), Câu 209 (HSDT không cân bằng), Câu 211 (Tịch thu BĐTHHĐ liên danh), Câu 221 (Thời gian mua sắm trực tuyến 24 tháng), Câu 224 (Tài liệu đăng tải khi sửa đổi E-HSMT), Câu 233 (Không có nhà thầu nộp E-HSDT), Câu 241 (Gia hạn hiệu lực HSDT), Câu 261 (Thời điểm hủy E-TBMT), Câu 272 (File đính kèm không coi là 1 phần E-HSMT), Câu 275 (Thời điểm đóng thầu khi hệ thống sự cố).\n• 03 câu chọn C ('A và B đều đúng'): Câu 9 (Khái niệm hàng hóa), Câu 107 (HĐ tương tự cung cấp thuốc cho y tế tư nhân & cơ sở kinh doanh thuốc), Câu 252 (Ký hợp đồng điện tử trong mua sắm tập trung).",
        questions: [6, 9, 44, 45, 71, 90, 93, 107, 138, 176, 209, 211, 221, 224, 233, 241, 252, 261, 272, 275]
      },
      {
        key: "⚠️ 16 Câu BẪY có 'Tất cả/Cả 3 đều đúng' nhưng TUYỆT ĐỐI KHÔNG CHỌN D!",
        rule: "Chỉ có đúng 16 câu trong bộ 340 câu có dòng 'Tất cả/Các phương án trên đều đúng' nhưng đáp án đúng lại là A, B hoặc C:\n• Câu 30 (Phát hành HSMT không qua mạng): Chọn A (Phát hành trên Hệ thống mạng ĐTQG).\n• Câu 43 (Nội dung KHLCNT): Chọn A (Giá gói thầu).\n• Câu 46 (Giá trị công việc đã thực hiện khi đã thanh lý HĐ): Chọn B (Giá trị thanh lý hợp đồng).\n• Câu 73 (HĐ tương tự mua 20 máy điều hòa): Chọn A (Cùng lĩnh vực tổng quát).\n• Câu 92 (HĐ xây lắp tương tự 1 công trình độc lập): Chọn A (Hoàn thành toàn bộ hoặc phần lớn...).\n• Câu 110 (Bảo lãnh dự thầu không hợp lệ): Chọn C (Ký trước khi phát hành HSMT).\n• Câu 115 (Thầu phụ của liên danh): Chọn A (20% trên phần việc từng thành viên đảm nhận).\n• Câu 201 (Giải pháp khi hủy thầu): Chọn C (Không phải điều chỉnh thời gian bắt đầu tổ chức LCNT trong KHLCNT).\n• Câu 215 (Nhà thầu kê khai thông tin gì trên Hệ thống): Chọn C (Thông tin về năng lực, kinh nghiệm).\n• Câu 232 (Khi nào phải nộp lại E-HSDT): Chọn C (Khi E-HSMT được sửa đổi).\n• Câu 237 (Hệ thống tự động đánh giá): Chọn C (Doanh thu bình quân 3 năm gần nhất).\n• Câu 247 (Xác nhận chấp thuận trao HĐ): Chọn C (Chào giá trực tuyến rút gọn).\n• Câu 269 (Phương thức LCNT qua mạng): Chọn A (01 giai đoạn 01 túi hồ sơ).\n• Câu 273 (Yêu cầu file đăng tải trên Hệ thống): Chọn C (Không nhiễm virus, không lỗi hỏng, không mật khẩu).\n• Câu 274 (File đính kèm trong E-HSMT không mở được): Chọn A (Đăng tải và phát hành lại toàn bộ E-HSMT).\n• Câu 300 (Chữ ký biên bản mở thầu không qua mạng): Chọn C (Chủ đầu tư và các nhà thầu tham dự lễ mở thầu).",
        questions: [30, 43, 46, 73, 92, 110, 115, 201, 215, 232, 237, 247, 269, 273, 274, 300]
      },
      {
        key: "⚠️ 30 Câu BẪY có 'Phương án A và B/C đều đúng' nhưng KHÔNG CHỌN!",
        rule: "Các câu có phương án gộp 2 ý nhưng chỉ có 1 ý đúng duy nhất:\n• Câu 20 (Chọn A), Câu 27 (Chọn C), Câu 29 (Chọn A), Câu 41 (Chọn A), Câu 59 (Chọn C), Câu 85 (Chọn A), Câu 89 (Chọn B), Câu 103 (Chọn A), Câu 108 (Chọn C), Câu 125 (Chọn B), Câu 131 (Chọn A), Câu 132 (Chọn A), Câu 139 (Chọn B), Câu 148 (Chọn C), Câu 149 (Chọn C), Câu 165 (Chọn C), Câu 170 (Chọn B), Câu 183 (Chọn B), Câu 186 (Chọn C), Câu 193 (Chọn A), Câu 214 (Chọn C), Câu 242 (Chọn C), Câu 250 (Chọn C), Câu 253 (Chọn A), Câu 254 (Chọn C), Câu 255 (Chọn B), Câu 276 (Chọn C), Câu 294 (Chọn C), Câu 312 (Chọn B), Câu 318 (Chọn A).",
        questions: [20, 27, 29, 41, 59, 85, 89, 103, 108, 125, 131, 132, 139, 148, 149, 165, 170, 183, 186, 193, 214, 242, 250, 253, 254, 255, 276, 294, 312, 318]
      },
      {
        key: "❌ 03 Câu chọn 'Các phương án trên đều sai' (Chọn D)",
        rule: "Trong 28 câu có xuất hiện dòng 'Tất cả/Các phương án trên đều sai', chỉ có ĐÚNG 3 CÂU chọn D là đáp án đúng (còn lại 25 câu kia không chọn D):\n• Câu 296 (Mua sắm trực tuyến dịch vụ tư vấn -> Sai vì mua sắm trực tuyến không áp dụng cho tư vấn).\n• Câu 301 (Đấu thầu qua mạng đánh giá bản chụp/bản gốc -> Sai vì đấu thầu qua mạng đánh giá trên dữ liệu điện tử).\n• Câu 314 (Gói thầu bảo hiểm dùng giấy chứng nhận bảo hiểm bảo lãnh do chính mình phát hành -> Sai vì không được tự bảo lãnh cho chính mình).",
        questions: [296, 301, 314]
      }
    ]
  }
];


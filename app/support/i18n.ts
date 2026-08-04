export type SupportLocale = "zh-CN" | "zh-TW" | "en" | "ja" | "ko";

export const supportLocales: SupportLocale[] = ["zh-CN", "zh-TW", "en", "ja", "ko"];

export const localeNames: Record<SupportLocale, string> = {
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  en: "English",
  ja: "日本語",
  ko: "한국어",
};

const en: Record<string, string> = {
  "网站导航": "Website navigation", "主导航": "Main navigation", "产品": "Products", "技术与能力": "Technology", "关于我们": "About us", "帮助中心": "Help Center", "提交工单": "Submit a ticket",
  "官方帮助中心": "Official Help Center", "官方技术支持": "Official technical support", "查找设备、健康数据、账户、服务及系统相关的使用帮助。": "Find help for devices, health data, accounts, services, and system features.",
  "搜索帮助内容，例如：设备连接、健康报告、定位异常……": "Search help, e.g. device connection, health reports, location…", "搜索帮助内容": "Search help content", "清除搜索": "Clear search", "暂未找到匹配内容，请尝试更换关键词或提交支持工单。": "No matching content. Try another keyword or submit a ticket.",
  "帮助目录": "Help directory", "查找支持内容": "Find support content", "选择一个分类，查看对应的帮助与解决方案。": "Choose a category to browse help and solutions.", "支持内容分类": "Support categories", "官方工单服务": "Official ticket service", "没有找到需要的内容？": "Didn’t find what you need?", "如果仍未解决您的问题，我们随时为您提供帮助。": "If your issue is still unresolved, we’re here to help.", "平均响应时间：15 分钟": "Average response time: 15 minutes", "服务时间：周一至周日 9:00–22:00": "Hours: Mon–Sun, 9:00–22:00",
  "支持范围": "Support scope", "常见问题": "FAQ", "操作指南": "Guides", "在线支持": "Online support", "升级与维护": "Updates & maintenance", "数据安全": "Data security",
  "PalEcho 为用户提供覆盖设备、数据、账户及平台服务的官方支持。": "PalEcho provides official support for devices, data, accounts, and platform services.", "快速查看用户最常遇到的问题。": "Quick answers to common questions.", "从首次使用到日常管理，快速了解 PalEcho 的主要功能。": "Learn PalEcho’s core features, from setup to everyday management.", "通过官方渠道提交问题并获得帮助。": "Contact us through official channels and get help.", "查看最新版本、功能更新及维护安排。": "See the latest releases, feature updates, and maintenance notices.", "了解 PalEcho 如何保护设备数据、健康信息与账户安全。": "Learn how PalEcho protects device data, health information, and accounts.",
  "智能硬件设备": "Smart hardware", "查看设备连接、佩戴、充电及使用帮助。": "Help with connecting, wearing, charging, and using your device.", "健康助手": "Health Assistant", "了解健康分析、异常提醒及报告功能。": "Learn about health analysis, alerts, and reports.", "健康数据管理": "Health data management", "查看数据同步、健康档案和历史记录。": "Manage sync, health profiles, and history.", "数字宠物功能": "Digital pet features", "了解陪伴互动、状态记录与日常功能。": "Learn about companion interactions, status records, and daily features.", "商城与订单": "Store & orders", "处理订单查询、配送与售后相关问题。": "Help with orders, delivery, and after-sales service.", "账户与会员": "Account & membership", "管理登录信息、会员权益与账户设置。": "Manage sign-in details, membership benefits, and settings.", "定位与防丢": "Location & safety", "查看定位权限、电子围栏与防丢帮助。": "Help with location permissions, geofences, and lost-pet safety.", "系统更新": "System updates", "了解版本更新、功能变化与使用要求。": "Learn about releases, changes, and requirements.",
  "设备无法连接怎么办？": "What if my device will not connect?", "从设备电量、蓝牙权限与网络环境开始排查。": "Start with battery, Bluetooth permissions, and network conditions.", "为什么没有健康数据？": "Why is there no health data?", "检查佩戴、同步状态和账户绑定情况。": "Check wearing, sync status, and account binding.", "定位出现偏差怎么办？": "What if the location is inaccurate?", "了解定位权限与室内外环境的影响。": "Learn how permissions and indoor or outdoor conditions affect location.", "健康报告没有更新怎么办？": "Why has my health report not updated?", "确认同步状态和报告生成时间。": "Check sync status and report generation time.", "设备续航时间异常怎么办？": "Why is battery life shorter than expected?", "查看充电状态、使用环境与定位设置。": "Review charging, usage conditions, and location settings.", "账号无法登录怎么办？": "What if I cannot sign in?", "通过登录方式、验证码和账户状态逐项确认。": "Check sign-in method, verification code, and account status.", "会员权益没有生效怎么办？": "Why are membership benefits not active?", "确认购买账户与当前登录账户保持一致。": "Make sure the purchase and sign-in accounts match.", "设备更换后如何重新绑定？": "How do I bind a replacement device?", "先解除旧设备，再按照引导完成新设备绑定。": "Unbind the old device, then follow the setup flow for the new one.",
  "首次绑定设备": "Pair your device for the first time", "完成设备开机、配对与首次同步。": "Power on, pair, and complete the first sync.", "约 2 分钟": "About 2 min", "正确佩戴设备": "Wear the device correctly", "了解合适的佩戴位置与日常检查。": "Learn the right position and daily checks.", "查看健康快照": "View a health snapshot", "快速了解宠物当日的状态变化。": "See your pet’s daily status at a glance.", "约 3 分钟": "About 3 min", "阅读健康报告": "Read a health report", "掌握报告中重点信息的查看方式。": "Learn how to review key report insights.", "使用健康助手": "Use Health Assistant", "了解健康分析与日常提醒功能。": "Learn about health analysis and daily reminders.", "创建宠物健康档案": "Create a pet health profile", "建立完整、连续的健康记录。": "Build a complete, continuous health record.", "设置电子围栏": "Set up a geofence", "为常用活动区域添加安全提醒。": "Add safety alerts for familiar activity areas.", "管理账户与会员": "Manage account & membership", "查看账户设置和会员权益。": "Review account settings and membership benefits.",
  "提交支持工单": "Submit a support ticket", "描述问题并上传相关图片，我们会尽快处理。": "Describe the issue and upload images so we can help quickly.", "查询工单进度": "Track a ticket", "通过工单编号查看当前处理状态。": "Check progress with your ticket number.", "意见与建议": "Feedback & suggestions", "向 PalEcho 提交产品建议和使用反馈。": "Share product ideas and feedback with PalEcho.", "服务说明": "Service policy", "查看服务时间、响应规则及支持范围。": "Review service hours, response rules, and support scope.", "健康助手功能升级": "Health Assistant upgrade", "优化健康分析体验与提醒呈现方式。": "Improved health analysis and alert presentation.", "功能更新": "Feature update", "健康快照功能上线": "Health Snapshot is now live", "支持更清晰地回顾每日健康状态。": "Review daily health status more clearly.", "新增设备支持": "New device support", "更多设备已支持连接与健康数据同步。": "More devices now support connection and health sync.", "维护公告": "Maintenance notice", "数据加密": "Data encryption", "设备与平台之间的数据传输采用安全加密机制。": "Device-to-platform transfers use secure encryption.", "隐私保护": "Privacy protection", "清楚说明数据用途，并由用户自主决定授权。": "We explain data use clearly and let users control consent.", "权限管理": "Permission management", "用户可管理设备、账户及数据访问权限。": "Manage access to devices, accounts, and data.", "云端同步": "Cloud sync", "查看不同设备间的健康记录同步说明。": "Learn how health records sync across devices.", "数据导出": "Data export", "按需要申请导出个人和宠物相关数据。": "Request an export of personal and pet data when needed.", "数据删除": "Data deletion", "用户可以申请删除账户及相关数据。": "Request deletion of your account and related data.",
  "官方支持内容": "Official support content", "查看“": "View ", "”相关的使用说明与解决方案。": "-related instructions and solutions.", "打开 PalEcho 应用并进入对应功能页面。": "Open PalEcho and go to the relevant feature.", "按照页面中的提示完成设置或检查。": "Follow the on-screen setup or troubleshooting steps.", "如果问题仍未解决，请提交支持工单。": "If the issue remains, submit a support ticket.", "官方解决方案": "Official solution", "最近更新：2026.08": "Updated: 2026.08", "返回支持中心": "Back to Help Center", "解决步骤": "Steps to resolve", "仍然需要帮助？": "Still need help?", "提交工单并描述遇到的情况，我们会继续协助你。": "Submit a ticket with details and we’ll continue to help.",
  "请尽可能完整地描述问题，我们会根据你提供的信息尽快处理。": "Describe the issue in as much detail as possible so we can help quickly.", "工单处理状态": "Ticket status", "待处理": "Open", "处理中": "In progress", "已回复": "Replied", "已解决": "Resolved", "问题类型": "Issue type", "请选择问题类型": "Select an issue type", "设备使用": "Device use", "健康数据": "Health data", "系统服务": "System service", "其他问题": "Other", "问题标题": "Issue title", "请用一句话概括遇到的问题": "Summarize the issue in one sentence", "问题描述": "Issue description", "请描述问题发生的时间、操作步骤和当前情况": "Describe when it happened, what you did, and the current status", "设备型号（可选）": "Device model (optional)", "例如：Pulse 01": "e.g. Pulse 01", "账户信息（可选）": "Account details (optional)", "手机号或邮箱": "Phone number or email", "上传图片或视频（可选）": "Upload images or video (optional)", "支持上传问题截图或相关视频，便于我们快速了解情况。": "Screenshots or videos help us understand the issue faster.", "联系方式": "Contact details", "方便我们回复你的手机号或邮箱": "Phone number or email for our reply", "请勿填写密码、支付验证码等敏感信息。提交即表示你同意我们使用上述信息处理本次支持请求。": "Do not include passwords or payment codes. Submitting means you agree that we may use this information to handle your request.", "工单提交成功": "Ticket submitted", "我们已经收到你的问题": "We’ve received your issue", "请保存下方编号，后续可用于查询处理进度。": "Save the number below to track progress.", "当前状态：待处理": "Current status: Open", "平均响应时间：15 分钟 · 服务时间：周一至周日 9:00–22:00": "Average response: 15 min · Hours: Mon–Sun, 9:00–22:00",
};

const zhTW: Record<string, string> = {
  "产品": "產品", "技术与能力": "技術與能力", "关于我们": "關於我們", "帮助中心": "幫助中心", "提交工单": "提交工單", "官方帮助中心": "官方幫助中心", "官方技术支持": "官方技術支援", "查找设备、健康数据、账户、服务及系统相关的使用帮助。": "查找裝置、健康數據、帳戶、服務與系統相關的使用幫助。", "帮助目录": "幫助目錄", "查找支持内容": "查找支援內容", "选择一个分类，查看对应的帮助与解决方案。": "選擇分類，查看對應的幫助與解決方案。", "在线支持": "線上支援", "升级与维护": "升級與維護", "数据安全": "資料安全", "支持范围": "支援範圍", "常见问题": "常見問題", "操作指南": "操作指南", "提交支持工单": "提交支援工單", "没有找到需要的内容？": "找不到需要的內容？", "如果仍未解决您的问题，我们随时为您提供帮助。": "如果問題仍未解決，我們隨時為你提供幫助。", "平均响应时间：15 分钟": "平均回應時間：15 分鐘", "服务时间：周一至周日 9:00–22:00": "服務時間：週一至週日 9:00–22:00",
  "智能硬件设备": "智慧硬體裝置", "健康助手": "健康助手", "健康数据管理": "健康資料管理", "数字宠物功能": "數位寵物功能", "商城与订单": "商城與訂單", "账户与会员": "帳戶與會員", "定位与防丢": "定位與防丟", "系统更新": "系統更新", "常见问题（FAQ）": "常見問題（FAQ）", "功能更新": "功能更新", "维护公告": "維護公告", "官方解决方案": "官方解決方案", "最近更新：2026.08": "最近更新：2026.08", "返回支持中心": "返回支援中心", "解决步骤": "解決步驟", "仍然需要帮助？": "仍然需要幫助？", "提交工单并描述遇到的情况，我们会继续协助你。": "提交工單並描述情況，我們會繼續協助你。",
};

Object.assign(en, {
  "确认设备已经开机，并保持在手机附近。": "Make sure the device is on and near your phone.",
  "在 PalEcho 应用中打开蓝牙与附近设备权限。": "Allow Bluetooth and nearby-device access for PalEcho.",
  "按照设备页面提示完成配对与首次同步。": "Follow the device setup to pair and complete the first sync.",
  "进入健康页面，确认设备数据已经完成同步。": "Open Health and confirm that device data has synced.",
  "打开健康助手，选择需要了解的健康记录。": "Open Health Assistant and choose the record you want to review.",
  "健康分析仅作为日常管理参考，如有异常请及时寻求专业帮助。": "Health analysis is for daily reference only. Seek professional help when needed.",
  "在健康快照中查看当日数据。": "View today’s data in Health Snapshot.",
  "进入健康档案，按日期回顾历史变化。": "Open the health profile to review changes by date.",
  "数据未更新时，请先检查设备连接和同步状态。": "If data is not updated, check the connection and sync status first.",
  "确认设备电量充足，并重新启动设备。": "Make sure the battery is charged and restart the device.",
  "将设备放在手机附近，重新打开应用并尝试连接。": "Bring the device near your phone, reopen the app, and try again.",
  "仍然无法连接时，请提交支持工单并附上设备型号。": "If it still will not connect, submit a ticket with the device model.",
  "确认手机和设备已经获得定位权限。": "Make sure your phone and device have location permission.",
  "移动到开阔环境后等待位置重新更新。": "Move to an open area and wait for the location to refresh.",
  "如果偏差持续出现，请记录时间和地点并提交工单。": "If the issue continues, note the time and place and submit a ticket.",
  "确认数据已经同步，并检查报告生成时间。": "Confirm that data has synced and check the report timestamp.",
  "打开设备页面，确认最新数据已经完成同步。": "Open the device page and confirm that the latest data has synced.",
  "检查报告页面显示的生成时间，稍后重新进入页面。": "Check the report timestamp and return to the page later.",
  "问题持续时，请提交工单并提供报告日期。": "If the issue continues, submit a ticket with the report date.",
  "清洁充电触点，并完成一次完整充电。": "Clean the charging contacts and complete a full charge.",
  "检查是否开启持续定位或其他高频功能。": "Check whether continuous location or other high-frequency features are on.",
  "记录异常发生时间与使用情况，必要时提交工单。": "Record when it happened and how the device was used; submit a ticket if needed.",
  "检查手机蓝牙和 PalEcho 应用的相关权限。": "Check Bluetooth and PalEcho permissions on your phone.",
  "确认使用的是注册时的手机号或邮箱。": "Make sure you are using the registered phone number or email.",
  "检查验证码是否过期，并重新获取。": "Check whether the verification code has expired and request a new one.",
  "仍无法登录时，请通过工单提供账户信息。": "If you still cannot sign in, include account details in a ticket.",
});

Object.assign(zhTW, {
  "确认设备已经开机，并保持在手机附近。": "確認裝置已開機，並保持在手機附近。", "在 PalEcho 应用中打开蓝牙与附近设备权限。": "在 PalEcho 應用中開啟藍牙與附近裝置權限。", "按照设备页面提示完成配对与首次同步。": "依照裝置頁面提示完成配對與首次同步。", "确认设备电量充足，并重新启动设备。": "確認裝置電量充足並重新啟動。", "检查手机蓝牙和 PalEcho 应用的相关权限。": "檢查手機藍牙與 PalEcho 應用的相關權限。", "将设备放在手机附近，重新打开应用并尝试连接。": "將裝置放在手機附近，重新開啟應用並嘗試連線。", "仍然无法连接时，请提交支持工单并附上设备型号。": "仍無法連線時，請提交支援工單並附上裝置型號。", "在健康快照中查看当日数据。": "在健康快照查看當日數據。", "进入健康档案，按日期回顾历史变化。": "進入健康檔案，依日期回顧歷史變化。", "数据未更新时，请先检查设备连接和同步状态。": "資料未更新時，請先檢查裝置連線與同步狀態。"
});

const ja: Record<string, string> = {
  "产品": "製品", "技术与能力": "技術と能力", "关于我们": "私たちについて", "帮助中心": "ヘルプセンター", "提交工单": "サポートチケット", "官方帮助中心": "公式ヘルプセンター", "官方技术支持": "公式テクニカルサポート", "查找设备、健康数据、账户、服务及系统相关的使用帮助。": "デバイス、健康データ、アカウント、サービス、システムの使い方を検索できます。", "帮助目录": "ヘルプ一覧", "查找支持内容": "サポートを探す", "选择一个分类，查看对应的帮助与解决方案。": "カテゴリを選び、ヘルプと解決策を確認してください。", "在线支持": "オンラインサポート", "升级与维护": "アップデートとメンテナンス", "数据安全": "データセキュリティ", "支持范围": "サポート範囲", "常见问题": "よくある質問", "操作指南": "ガイド", "提交支持工单": "サポートチケットを送信", "没有找到需要的内容？": "必要な情報が見つかりませんか？", "如果仍未解决您的问题，我们随时为您提供帮助。": "解決しない場合も、いつでもサポートします。", "平均响应时间：15 分钟": "平均応答時間：15分", "服务时间：周一至周日 9:00–22:00": "対応時間：月〜日 9:00〜22:00",
  "智能硬件设备": "スマートデバイス", "健康助手": "ヘルスアシスタント", "健康数据管理": "健康データ管理", "数字宠物功能": "デジタルペット機能", "商城与订单": "ストアと注文", "账户与会员": "アカウントと会員", "定位与防丢": "位置情報と紛失対策", "系统更新": "システムアップデート", "功能更新": "機能アップデート", "维护公告": "メンテナンス告知", "官方解决方案": "公式ソリューション", "最近更新：2026.08": "更新：2026.08", "返回支持中心": "ヘルプセンターへ戻る", "解决步骤": "解決手順", "仍然需要帮助？": "まだサポートが必要ですか？", "提交工单并描述遇到的情况，我们会继续协助你。": "状況を記載してチケットを送信すれば、引き続きサポートします。",
};

Object.assign(ja, {
  "确认设备已经开机，并保持在手机附近。": "デバイスの電源を入れ、スマートフォンの近くに置きます。", "在 PalEcho 应用中打开蓝牙与附近设备权限。": "PalEcho に Bluetooth と近くのデバイスへのアクセスを許可します。", "按照设备页面提示完成配对与首次同步。": "画面の案内に従ってペアリングと初回同期を完了します。", "确认设备电量充足，并重新启动设备。": "充電を確認し、デバイスを再起動します。", "检查手机蓝牙和 PalEcho 应用的相关权限。": "スマートフォンの Bluetooth と PalEcho の権限を確認します。", "将设备放在手机附近，重新打开应用并尝试连接。": "デバイスをスマートフォンの近くに置き、アプリを再起動して接続します。", "仍然无法连接时，请提交支持工单并附上设备型号。": "接続できない場合は、デバイス名を添えてチケットを送信してください。", "在健康快照中查看当日数据。": "ヘルススナップショットで今日のデータを確認します。", "进入健康档案，按日期回顾历史变化。": "健康プロフィールで日付ごとの変化を確認します。", "数据未更新时，请先检查设备连接和同步状态。": "データが更新されない場合は、接続と同期状態を確認します。"
});

Object.assign(zhTW, {
  "PalEcho 为用户提供覆盖设备、数据、账户及平台服务的官方支持。": "PalEcho 為使用者提供涵蓋裝置、資料、帳戶與平台服務的官方支援。", "快速查看用户最常遇到的问题。": "快速查看使用者最常遇到的問題。", "从首次使用到日常管理，快速了解 PalEcho 的主要功能。": "從首次使用到日常管理，快速了解 PalEcho 的主要功能。", "通过官方渠道提交问题并获得帮助。": "透過官方管道提交問題並獲得幫助。", "查看最新版本、功能更新及维护安排。": "查看最新版本、功能更新與維護安排。", "了解 PalEcho 如何保护设备数据、健康信息与账户安全。": "了解 PalEcho 如何保護裝置資料、健康資訊與帳戶安全。",
  "查看设备连接、佩戴、充电及使用帮助。": "查看裝置連線、佩戴、充電與使用幫助。", "了解健康分析、异常提醒及报告功能。": "了解健康分析、異常提醒與報告功能。", "查看数据同步、健康档案和历史记录。": "查看資料同步、健康檔案與歷史記錄。", "了解陪伴互动、状态记录与日常功能。": "了解陪伴互動、狀態記錄與日常功能。", "处理订单查询、配送与售后相关问题。": "處理訂單查詢、配送與售後相關問題。", "管理登录信息、会员权益与账户设置。": "管理登入資訊、會員權益與帳戶設定。", "查看定位权限、电子围栏与防丢帮助。": "查看定位權限、電子圍籬與防丟幫助。", "了解版本更新、功能变化与使用要求。": "了解版本更新、功能變化與使用要求。",
  "设备无法连接怎么办？": "裝置無法連線怎麼辦？", "从设备电量、蓝牙权限与网络环境开始排查。": "從裝置電量、藍牙權限與網路環境開始排查。", "为什么没有健康数据？": "為什麼沒有健康資料？", "检查佩戴、同步状态和账户绑定情况。": "檢查佩戴、同步狀態與帳戶綁定情況。", "定位出现偏差怎么办？": "定位出現偏差怎麼辦？", "了解定位权限与室内外环境的影响。": "了解定位權限與室內外環境的影響。", "健康报告没有更新怎么办？": "健康報告沒有更新怎麼辦？", "确认同步状态和报告生成时间。": "確認同步狀態與報告產生時間。", "设备续航时间异常怎么办？": "裝置續航時間異常怎麼辦？", "查看充电状态、使用环境与定位设置。": "查看充電狀態、使用環境與定位設定。", "账号无法登录怎么办？": "帳號無法登入怎麼辦？", "通过登录方式、验证码和账户状态逐项确认。": "逐項確認登入方式、驗證碼與帳戶狀態。", "会员权益没有生效怎么办？": "會員權益沒有生效怎麼辦？", "确认购买账户与当前登录账户保持一致。": "確認購買帳戶與目前登入帳戶一致。", "设备更换后如何重新绑定？": "更換裝置後如何重新綁定？", "先解除旧设备，再按照引导完成新设备绑定。": "先解除舊裝置，再依照引導完成新裝置綁定。",
  "首次绑定设备": "首次綁定裝置", "完成设备开机、配对与首次同步。": "完成裝置開機、配對與首次同步。", "正确佩戴设备": "正確佩戴裝置", "了解合适的佩戴位置与日常检查。": "了解合適的佩戴位置與日常檢查。", "查看健康快照": "查看健康快照", "快速了解宠物当日的状态变化。": "快速了解寵物當日的狀態變化。", "阅读健康报告": "閱讀健康報告", "掌握报告中重点信息的查看方式。": "掌握報告中重點資訊的查看方式。", "使用健康助手": "使用健康助手", "了解健康分析与日常提醒功能。": "了解健康分析與日常提醒功能。", "创建宠物健康档案": "建立寵物健康檔案", "建立完整、连续的健康记录。": "建立完整、連續的健康記錄。", "设置电子围栏": "設定電子圍籬", "为常用活动区域添加安全提醒。": "為常用活動區域新增安全提醒。", "管理账户与会员": "管理帳戶與會員", "查看账户设置和会员权益。": "查看帳戶設定與會員權益。", "约 2 分钟": "約 2 分鐘", "约 3 分钟": "約 3 分鐘",
  "在线支持": "線上支援", "提交支持工单": "提交支援工單", "描述问题并上传相关图片，我们会尽快处理。": "描述問題並上傳相關圖片，我們會盡快處理。", "查询工单进度": "查詢工單進度", "通过工单编号查看当前处理状态。": "透過工單編號查看目前處理狀態。", "意见与建议": "意見與建議", "向 PalEcho 提交产品建议和使用反馈。": "向 PalEcho 提交產品建議與使用回饋。", "服务说明": "服務說明", "查看服务时间、响应规则及支持范围。": "查看服務時間、回應規則與支援範圍。"
});

Object.assign(ja, {
  "PalEcho 为用户提供覆盖设备、数据、账户及平台服务的官方支持。": "PalEcho はデバイス、データ、アカウント、プラットフォームサービスを公式にサポートします。", "快速查看用户最常遇到的问题。": "よくある問題をすぐに確認できます。", "从首次使用到日常管理，快速了解 PalEcho 的主要功能。": "初回設定から日常管理まで、PalEcho の主な機能を確認できます。", "通过官方渠道提交问题并获得帮助。": "公式窓口から問題を送信し、サポートを受けられます。", "查看最新版本、功能更新及维护安排。": "最新バージョン、機能更新、メンテナンス予定を確認できます。", "了解 PalEcho 如何保护设备数据、健康信息与账户安全。": "PalEcho がデバイスデータ、健康情報、アカウントを守る方法を確認できます。",
  "查看设备连接、佩戴、充电及使用帮助。": "接続、装着、充電、使用方法を確認できます。", "了解健康分析、异常提醒及报告功能。": "健康分析、異常通知、レポート機能を確認できます。", "查看数据同步、健康档案和历史记录。": "データ同期、健康プロフィール、履歴を確認できます。", "了解陪伴互动、状态记录与日常功能。": "ふれあい、状態記録、日常機能を確認できます。", "处理订单查询、配送与售后相关问题。": "注文、配送、アフターサービスに関する問題を解決します。", "管理登录信息、会员权益与账户设置。": "ログイン情報、会員特典、アカウント設定を管理します。", "查看定位权限、电子围栏与防丢帮助。": "位置情報の権限、ジオフェンス、紛失対策を確認できます。", "了解版本更新、功能变化与使用要求。": "バージョン更新、変更点、利用条件を確認できます。",
  "设备无法连接怎么办？": "デバイスを接続できない場合", "从设备电量、蓝牙权限与网络环境开始排查。": "バッテリー、Bluetooth 権限、ネットワークから確認します。", "为什么没有健康数据？": "健康データがない場合", "检查佩戴、同步状态和账户绑定情况。": "装着状態、同期、アカウント連携を確認します。", "定位出现偏差怎么办？": "位置情報がずれる場合", "了解定位权限与室内外环境的影响。": "権限と屋内外の環境による影響を確認します。", "健康报告没有更新怎么办？": "健康レポートが更新されない場合", "确认同步状态和报告生成时间。": "同期状態とレポート生成時刻を確認します。", "设备续航时间异常怎么办？": "バッテリー持続時間が短い場合", "查看充电状态、使用环境与定位设置。": "充電、使用環境、位置情報設定を確認します。", "账号无法登录怎么办？": "ログインできない場合", "通过登录方式、验证码和账户状态逐项确认。": "ログイン方法、認証コード、アカウント状態を確認します。", "会员权益没有生效怎么办？": "会員特典が反映されない場合", "确认购买账户与当前登录账户保持一致。": "購入アカウントとログイン中のアカウントが一致するか確認します。", "设备更换后如何重新绑定？": "デバイス交換後に再連携する方法", "先解除旧设备，再按照引导完成新设备绑定。": "旧デバイスを解除し、新しいデバイスを案内に沿って連携します。",
  "首次绑定设备": "デバイスを初めてペアリング", "完成设备开机、配对与首次同步。": "電源を入れ、ペアリングと初回同期を完了します。", "正确佩戴设备": "デバイスを正しく装着", "了解合适的佩戴位置与日常检查。": "適切な装着位置と日々の確認方法を学びます。", "查看健康快照": "ヘルススナップショットを見る", "快速了解宠物当日的状态变化。": "その日の状態変化をすぐに確認します。", "阅读健康报告": "健康レポートを読む", "掌握报告中重点信息的查看方式。": "レポートの重要な情報を確認します。", "使用健康助手": "ヘルスアシスタントを使う", "了解健康分析与日常提醒功能。": "健康分析と日常リマインダーを確認します。", "创建宠物健康档案": "ペットの健康プロフィールを作成", "建立完整、连续的健康记录。": "完全で継続的な健康記録を作成します。", "设置电子围栏": "ジオフェンスを設定", "为常用活动区域添加安全提醒。": "よく使う活動エリアに安全通知を追加します。", "管理账户与会员": "アカウントと会員を管理", "查看账户设置和会员权益。": "アカウント設定と会員特典を確認します。", "约 2 分钟": "約2分", "约 3 分钟": "約3分",
  "在线支持": "オンラインサポート", "提交支持工单": "サポートチケットを送信", "描述问题并上传相关图片，我们会尽快处理。": "問題を記載し、画像を添付して送信します。", "查询工单进度": "チケットの進捗を確認", "通过工单编号查看当前处理状态。": "チケット番号で現在の状態を確認します。", "意见与建议": "意見と提案", "向 PalEcho 提交产品建议和使用反馈。": "PalEcho に製品提案や利用フィードバックを送ります。", "服务说明": "サービス案内", "查看服务时间、响应规则及支持范围。": "対応時間、応答ルール、サポート範囲を確認します。"
});

export const supportText: Record<SupportLocale, Record<string, string>> = {
  "zh-CN": {},
  "zh-TW": zhTW,
  en,
  ja,
  ko: en,
};

export function translate(locale: SupportLocale, value: string): string {
  return supportText[locale][value] ?? value;
}

export function getStoredLocale(): SupportLocale {
  if (typeof window === "undefined") return "zh-CN";
  const value = window.localStorage.getItem("palecho_lang") as SupportLocale | null;
  return value && supportLocales.includes(value) ? value : "zh-CN";
}

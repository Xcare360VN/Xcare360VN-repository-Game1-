// Version 1.5 - Tải động Nhà tài trợ từ sheet 'Myinfo'
// Chào mừng bạn đến với mã nguồn Google Apps Script cho trò chơi "Có Bao Nhiêu Người Giống Bạn?"
//
// HƯỚNG DẪN CÀI ĐẶT:
// 1. Mở Google Sheet của bạn.
// 2. Vào "Tiện ích mở rộng" (Extensions) > "Apps Script".
// 3. Xóa toàn bộ mã hiện có trong trình soạn thảo.
// 4. Sao chép TOÀN BỘ nội dung của tệp này và dán vào trình soạn thảo.
// 5. Nhấn vào biểu tượng "Lưu dự án" (hình đĩa mềm).
// 6. Nhấn vào nút "Triển khai" (Deploy) > "Quản lý các bản triển khai" (Manage deployments).
// 7. Tìm bản triển khai đang hoạt động của bạn (thường chỉ có một), nhấp vào biểu tượng bút chì ("Chỉnh sửa").
// 8. Trong mục "Phiên bản" (Version), chọn "Phiên bản mới" (New version).
// 9. Nhấn nút "Triển khai" (Deploy).
// **QUAN TRỌNG**: Bằng cách này, bạn sẽ cập nhật ứng dụng web hiện có mà không thay đổi URL của nó.

// ===============================================================================================

const SS = SpreadsheetApp.getActiveSpreadsheet();

/**
 * Hàm trợ giúp để chuyển đổi một sheet thành một mảng các đối tượng JSON.
 * Hàng đầu tiên của sheet được sử dụng làm key cho các đối tượng.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Sheet cần chuyển đổi.
 * @returns {object[]} Một mảng các đối tượng đại diện cho các hàng.
 */
function sheetToJSON(sheet) {
  if (!sheet) return [];
  
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length < 2) return []; // Cần ít nhất một hàng tiêu đề và một hàng dữ liệu

  const headers = values[0].map(header => header.toString().trim());
  const json = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const obj = {};
    let hasData = false;
    for (let j = 0; j < headers.length; j++) {
      if (headers[j]) { // Chỉ thêm thuộc tính nếu có tiêu đề
        obj[headers[j]] = row[j];
        if (row[j] !== '' && row[j] !== null && row[j] !== undefined) {
          hasData = true;
        }
      }
    }
    // Chỉ thêm đối tượng vào mảng nếu hàng đó có ít nhất một ô có dữ liệu
    if (hasData) {
      json.push(obj);
    }
  }
  
  return json;
}

/**
 * Hàm trợ giúp để ghi lại phản hồi và trả về dưới dạng ContentService.
 * @param {object} data - Dữ liệu cần trả về.
 * @returns {GoogleAppsScript.Content.TextOutput} Phản hồi JSON.
 */
function createJsonResponse(data) {
  // Cấu trúc nhất quán cho các phản hồi thành công
  const responseObject = {
    status: 'success',
    data: data,
  };
  const jsonString = JSON.stringify(responseObject);
  return ContentService.createTextOutput(jsonString).setMimeType(ContentService.MimeType.JSON);
}


/**
 * Hàm trợ giúp để tạo phản hồi lỗi chuẩn.
 * @param {string} message - Thông báo lỗi.
 * @param {number} statusCode - (Tùy chọn) Mã trạng thái HTTP.
 * @returns {GoogleAppsScript.Content.TextOutput} Phản hồi lỗi JSON.
 */
function createErrorResponse(message, statusCode = 400) {
   const errorObject = {
    status: 'error',
    message: message
  };
  const jsonString = JSON.stringify(errorObject);
  // Mặc dù chúng ta không thể đặt mã trạng thái HTTP một cách trực tiếp,
  // việc có nó trong log có thể hữu ích cho việc gỡ lỗi.
  console.error(`Tạo lỗi phản hồi (${statusCode}): ${message}`);
  return ContentService.createTextOutput(jsonString).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Xử lý các yêu cầu GET đến ứng dụng web.
 * Đây là hàm chính điều hướng các hành động dựa trên tham số 'action'.
 * @param {object} e - Đối tượng sự kiện từ yêu cầu GET.
 * @returns {GoogleAppsScript.Content.TextOutput} Phản hồi JSON.
 */
function doGet(e) {
  // BƯỚC KIỂM TRA QUAN TRỌNG NHẤT: Script có được liên kết với một Sheet không?
  if (!SS) {
    return createErrorResponse("Lỗi nghiêm trọng: Script này không được liên kết với bất kỳ tệp Google Sheet nào. Vui lòng tạo script từ bên trong tệp Sheet của bạn qua menu 'Tiện ích mở rộng > Apps Script'.");
  }
  
  try {
    const params = e.parameter;
    // FIX: Làm sạch tham số 'action' để loại bỏ khoảng trắng thừa có thể gây lỗi.
    const action = params.action ? params.action.trim() : null;
    console.log(`Hành động đã xử lý: "${action}", Tham số: ${JSON.stringify(params)}`);


    switch (action) {
      case 'getSpreadsheetName':
        return createJsonResponse({ name: SS.getName() });

      case 'getTopics':
        // Lấy danh sách chủ đề từ sheet 'Mylist'
        const myListSheet = SS.getSheetByName('Mylist');
        if (!myListSheet) {
          return createErrorResponse("Không tìm thấy sheet 'Mylist'. Hãy chắc chắn bạn đã tạo và đặt tên chính xác cho sheet này.");
        }
        const topics = sheetToJSON(myListSheet);
        return createJsonResponse(topics);
      
      case 'getSponsors':
        // Lấy danh sách nhà tài trợ từ sheet 'Myinfo'
        const myInfoSheet = SS.getSheetByName('Myinfo');
        if (!myInfoSheet) {
          return createErrorResponse("Không tìm thấy sheet 'Myinfo'. Hãy chắc chắn bạn đã tạo và đặt tên chính xác cho sheet này.");
        }
        const sponsors = sheetToJSON(myInfoSheet);
        return createJsonResponse(sponsors);

      case 'getQuestions':
        // Lấy các câu hỏi cho một chủ đề cụ thể
        const topicIdForQuestions = params.topicId;
        if (!topicIdForQuestions) {
          return createErrorResponse("Thiếu tham số 'topicId'.");
        }
        const questionSheet = SS.getSheetByName(topicIdForQuestions);
        if (!questionSheet) {
          return createErrorResponse(`Không tìm thấy sheet với tên: ${topicIdForQuestions}.`);
        }
        const questions = sheetToJSON(questionSheet);
        return createJsonResponse(questions);

      case 'submit':
        // Gửi một câu trả lời
        const { topicId, questionId, selectedOption } = params;
        if (!topicId || !questionId || !selectedOption) {
           return createErrorResponse("Thiếu các tham số bắt buộc (topicId, questionId, selectedOption) để gửi.");
        }
        
        const sheetToUpdate = SS.getSheetByName(topicId);
        if (!sheetToUpdate) {
          return createErrorResponse(`Không tìm thấy sheet '${topicId}' để cập nhật.`);
        }

        const data = sheetToUpdate.getDataRange().getValues();
        const headers = data[0].map(h => h.toString().trim());
        const idColIndex = headers.indexOf('id');
        const statsColIndex = headers.indexOf('stats');

        if (idColIndex === -1 || statsColIndex === -1) {
            return createErrorResponse(`Sheet '${topicId}' thiếu cột 'id' hoặc 'stats'.`);
        }

        for (let i = 1; i < data.length; i++) {
          if (data[i][idColIndex] === questionId) {
            let stats;
            try {
              // Cố gắng phân tích cú pháp JSON, nếu không thành công hoặc trống, bắt đầu với một đối tượng trống
              stats = JSON.parse(data[i][statsColIndex] || '{}');
            } catch (jsonError) {
              console.error(`Lỗi phân tích JSON ở hàng ${i+1} cho questionId ${questionId}: ${data[i][statsColIndex]}. Sẽ bắt đầu lại thống kê.`);
              // Bắt đầu lại thống kê cho câu hỏi này nếu JSON bị hỏng
              stats = {}; 
            }
            
            // Tìm key hiện có không phân biệt hoa thường và cập nhật nó
            let foundKey = Object.keys(stats).find(key => key.toLowerCase() === selectedOption.toLowerCase());
            let keyToUpdate = foundKey || selectedOption; // Sử dụng key gốc nếu không tìm thấy

            stats[keyToUpdate] = (stats[keyToUpdate] || 0) + 1;
            
            sheetToUpdate.getRange(i + 1, statsColIndex + 1).setValue(JSON.stringify(stats));
            return createJsonResponse({ status: 'success', message: 'Đã ghi lại câu trả lời.' });
          }
        }
        return createErrorResponse(`Không tìm thấy câu hỏi với ID '${questionId}' trong sheet '${topicId}'.`);

      case 'test':
         // Yêu cầu kiểm tra đơn giản để xác minh kết nối
         return createJsonResponse({ status: 'success', message: 'Kết nối GHI thành công.' });

      default:
        const allParams = JSON.stringify(params);
        const errorMessage = `Hành động không hợp lệ hoặc bị thiếu. Script đã nhận action='${action}'. Toàn bộ tham số: ${allParams}`;
        return createErrorResponse(errorMessage);
    }
  } catch (error) {
    console.error(`Lỗi nghiêm trọng trong doGet: ${error.message}\nStack: ${error.stack}`);
    return createErrorResponse(`Đã xảy ra lỗi máy chủ nội bộ: ${error.message}`);
  }
}
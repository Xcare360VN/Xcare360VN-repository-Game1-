import { MY_LIST, MY_INFO, QUESTION_BANKS } from '../data/mockData.js'; 

const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbykpc4zubNxgaHYtDxkzpt4vmj9wuEKSbPMulbVahByUC_70Pe7st1n5MBAMuBn6_Y9kg/exec';

// Hàm helper để chuyển đổi dữ liệu thô từ sheet sang kiểu Question của ứng dụng
function transformQuestion(rawData) {
    const options = [];
    if (rawData.opt1 && rawData.opt1 !== 'N/A') options.push(rawData.opt1);
    if (rawData.opt2 && rawData.opt2 !== 'N/A') options.push(rawData.opt2);
    if (rawData.opt3 && rawData.opt3 !== 'N/A') options.push(rawData.opt3);
    if (rawData.opt4 && rawData.opt4 !== 'N/A') options.push(rawData.opt4);

    let stats = {};
    try {
        // stats trong dữ liệu của người dùng là một chuỗi JSON
        stats = JSON.parse(rawData.stats);
    } catch (e) {
        console.error(`Không thể phân tích stats cho câu hỏi ID ${rawData.id}:`, rawData.stats);
    }

    return {
        id: rawData.id,
        text: rawData.question,
        options,
        stats,
    };
}

/**
 * Tải danh sách các chủ đề từ Google Sheet.
 * @throws Sẽ ném lỗi nếu không thể tải hoặc dữ liệu không hợp lệ.
 */
export async function getTopics() {
    try {
        const params = new URLSearchParams({ action: 'getTopics' });
        params.set('v', new Date().getTime().toString()); // Cache buster
        const url = `${GOOGLE_SHEET_URL}?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }
        
        const jsonResponse = await response.json();
        const data = jsonResponse.data || jsonResponse;

        if (!Array.isArray(data)) {
             if (typeof data === 'object' && data !== null && data.status === 'error' && data.message) {
                 throw new Error(`Apps Script error fetching topics: ${data.message}`);
            }
            throw new Error("Topic data from sheet is not a valid array.");
        }
        
        if (data.length > 0 && (data[0].id === undefined || data[0].name === undefined || data[0].description === undefined)) {
            console.error("Invalid topic structure received:", data[0]);
            throw new Error("Topic data has an incorrect structure. Ensure 'id', 'name', and 'description' columns exist in 'Mylist' sheet.");
        }
        
        return data;

    } catch (error) {
         console.warn(`Không thể tải danh sách chủ đề. Sử dụng dữ liệu dự phòng. Lỗi:`, error);
         return MY_LIST;
    }
}


/**
 * Tải danh sách nhà tài trợ từ Google Sheet.
 */
export async function getSponsors() {
    try {
        const params = new URLSearchParams({ action: 'getSponsors' });
        params.set('v', new Date().getTime().toString());
        const url = `${GOOGLE_SHEET_URL}?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status} for sponsors`);
        }
        
        const jsonResponse = await response.json();
        const data = jsonResponse.data || jsonResponse;

        if (!Array.isArray(data)) {
             if (data.status === 'error' && data.message) {
                throw new Error(`Apps Script error fetching sponsors: ${data.message}`);
            }
            throw new Error("Sponsor data is not a valid array.");
        }
        
        return data.map(item => ({
            ...item,
            isActive: String(item.isActive).toUpperCase() === 'TRUE'
        }));

    } catch (error) {
        console.warn(`Không thể tải nhà tài trợ. Sử dụng dữ liệu dự phòng. Lỗi:`, error);
        return MY_INFO;
    }
}

/**
 * Tải các câu hỏi cho một chủ đề cụ thể.
 * @param topicId - ID của chủ đề cần tải câu hỏi.
 */
export async function getQuestionsForTopic(topicId) {
    try {
        const params = new URLSearchParams({
            action: 'getQuestions',
            topicId: topicId
        });
        params.set('v', new Date().getTime().toString());
        const url = `${GOOGLE_SHEET_URL}?${params.toString()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Lỗi mạng khi tải câu hỏi: ${response.status}`);
        }

        const rawQuestionsResponse = await response.json();
        const rawData = rawQuestionsResponse.data || rawQuestionsResponse;

        if (!Array.isArray(rawData) || rawData.length === 0) {
            throw new Error(`Dữ liệu câu hỏi cho chủ đề ${topicId} không hợp lệ hoặc rỗng.`);
        }
        
        return rawData.map(transformQuestion);

    } catch (error) {
        console.warn(`Không thể tải câu hỏi cho '${topicId}'. Sử dụng dữ liệu dự phòng. Lỗi:`, error);
        const fallbackBank = QUESTION_BANKS[topicId] || [];
        if (fallbackBank.length === 0) {
             throw new Error(`Không tìm thấy câu hỏi nào (kể cả dự phòng) cho chủ đề '${topicId}'.`);
        }
        return fallbackBank.map(q => ({
            ...q,
            stats: typeof q.stats === 'string' ? JSON.parse(q.stats) : q.stats,
        }));
    }
}

/**
 * Tải tất cả câu hỏi từ tất cả các chủ đề.
 * @param topics - Danh sách các chủ đề để lấy câu hỏi.
 */
export async function getAllQuestions(topics) {
    try {
        // Tải song song câu hỏi cho tất cả các chủ đề
        const questionPromises = topics.map(topic => getQuestionsForTopic(topic.id));
        const questionArrays = await Promise.all(questionPromises);
        
        // Gộp tất cả các mảng câu hỏi thành một
        return questionArrays.flat();
    } catch (error) {
        console.warn(`Không thể tải tất cả câu hỏi. Sử dụng dữ liệu dự phòng. Lỗi:`, error);
        // Fallback: Gộp tất cả câu hỏi từ mock data
        return Object.values(QUESTION_BANKS).flat().map(q => ({
             ...q,
            stats: typeof q.stats === 'string' ? JSON.parse(q.stats) : q.stats,
        }));
    }
}


/**
 * Gửi câu trả lời của người dùng đến Google Sheet bằng phương thức GET.
 * Hàm này giờ đây sẽ kiểm tra phản hồi để ghi lại lỗi nếu có.
 * @param topicId - ID của chủ đề hiện tại
 * @param questionId - ID của câu hỏi đã trả lời
 * @param selectedOption - Lựa chọn của người dùng
 */
export async function submitAnswer(topicId, questionId, selectedOption) {
    const params = new URLSearchParams({
        action: 'submit',
        topicId: topicId,
        questionId: questionId,
        selectedOption: selectedOption
    });
    params.set('v', new Date().getTime().toString()); // Cache buster

    const url = `${GOOGLE_SHEET_URL}?${params.toString()}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Lỗi khi gửi câu trả lời: Server phản hồi với status ${response.status}. Body:`, errorText.substring(0, 500));
        } else {
             console.log(`Đã gửi thành công câu trả lời cho ${questionId}: ${selectedOption}`);
        }
    } catch (error) {
        console.error('Lỗi mạng khi gửi câu trả lời:', error);
    }
}

// FIX: Export test functions required by APITestCard.tsx
/**
 * Functions for API Diagnostics Tool
 */

export async function getSpreadsheetName() {
    const params = new URLSearchParams({ action: 'getSpreadsheetName' });
    params.set('v', new Date().getTime().toString());
    const url = `${GOOGLE_SHEET_URL}?${params.toString()}`;

    try {
        const response = await fetch(url);
        const jsonResponse = await response.json();

        if (!response.ok || jsonResponse.status === 'error') {
            const errorMessage = jsonResponse.message || `Server responded with status ${response.status}`;
            return { success: false, message: `Lỗi kết nối: ${errorMessage}` };
        }

        return { success: true, name: jsonResponse.data.name, message: 'Kết nối thành công.' };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown network error.';
        return { success: false, message: `Lỗi mạng khi kiểm tra kết nối: ${message}` };
    }
}

export async function testWriteConnection() {
    const params = new URLSearchParams({ action: 'test' });
    params.set('v', new Date().getTime().toString());
    const url = `${GOOGLE_SHEET_URL}?${params.toString()}`;

    try {
        const response = await fetch(url);
        const jsonResponse = await response.json();

        if (!response.ok || jsonResponse.status === 'error') {
            const errorMessage = jsonResponse.message || `Server responded with status ${response.status}`;
            return { success: false, message: `Kiểm tra GHI thất bại: ${errorMessage}` };
        }

        return { success: true, message: jsonResponse.data.message || 'Xác nhận GHI thành công từ máy chủ.' };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown network error.';
        return { success: false, message: `Lỗi mạng khi kiểm tra GHI: ${message}` };
    }
}

export async function testTopicsConnection() {
    const params = new URLSearchParams({ action: 'getTopics' });
    params.set('v', new Date().getTime().toString()); // Cache buster
    const url = `${GOOGLE_SHEET_URL}?${params.toString()}`;

    try {
        const response = await fetch(url);
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
             const responseText = await response.text();
             return { success: false, message: `Tải chủ đề thất bại: Phản hồi không phải JSON. Nội dung: ${responseText.substring(0,100)}...` };
        }
        
        const jsonResponse = await response.json();

        if (!response.ok || jsonResponse.status === 'error') {
            const errorMessage = jsonResponse.message || `Server responded with status ${response.status}`;
            return { success: false, message: `Tải chủ đề thất bại: ${errorMessage}` };
        }

        const data = jsonResponse.data || jsonResponse;
        if (!Array.isArray(data)) {
            return { success: false, message: "Tải chủ đề thất bại: Dữ liệu trả về không phải là một mảng." };
        }
        
        if (data.length > 0 && (data[0].id === undefined || data[0].name === undefined || data[0].description === undefined)) {
            return { success: false, message: "Tải chủ đề thất bại: Cấu trúc dữ liệu không đúng (thiếu id, name, hoặc description)." };
        }
        
        const topics = data;

        if (topics.length === 0) {
            return { success: true, topics, message: "Tải thành công, nhưng sheet 'Mylist' không có chủ đề nào." };
        }

        return { success: true, topics, message: `Tải thành công ${topics.length} chủ đề.` };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Lỗi mạng khi tải chủ đề: ${message}` };
    }
}

export async function testReadConnection(topicId) {
    const params = new URLSearchParams({
        action: 'getQuestions',
        topicId: topicId
    });
    params.set('v', new Date().getTime().toString());
    const url = `${GOOGLE_SHEET_URL}?${params.toString()}`;

    try {
        const response = await fetch(url);
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
             const responseText = await response.text();
             return { success: false, message: `Kiểm tra ĐỌC thất bại: Phản hồi không phải JSON. Nội dung: ${responseText.substring(0,100)}...` };
        }
        
        const jsonResponse = await response.json();

        if (!response.ok || jsonResponse.status === 'error') {
            const errorMessage = jsonResponse.message || `Server responded with status ${response.status}`;
            return { success: false, message: `Kiểm tra ĐỌC thất bại: ${errorMessage}` };
        }

        const rawData = jsonResponse.data || jsonResponse;
        if (!Array.isArray(rawData) || rawData.length === 0) {
            return { success: true, message: `Đọc thành công nhưng không tìm thấy câu hỏi nào cho chủ đề '${topicId}'.` };
        }

        // Check structure of first question
        const firstQuestion = rawData[0];
        if (firstQuestion.id === undefined || firstQuestion.question === undefined) {
             return { success: false, message: `Kiểm tra ĐỌC thất bại: Cấu trúc câu hỏi không hợp lệ (thiếu 'id' hoặc 'question').` };
        }

        return { success: true, message: `Đọc thành công ${rawData.length} câu hỏi từ sheet '${topicId}'.` };

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown network error.';
        return { success: false, message: `Lỗi mạng khi kiểm tra ĐỌC: ${message}` };
    }
}
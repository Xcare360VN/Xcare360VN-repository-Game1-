import React, { useState } from 'react';
import htm from 'htm';
import { testWriteConnection, testReadConnection, testTopicsConnection, getSpreadsheetName } from '../services/gameService.js';
import Card from './ui/Card.js';
import Button from './ui/Button.js';

const html = htm.bind(React.createElement);

// Các biểu tượng tương ứng với trạng thái
const StatusIcon = ({ status }) => {
    switch (status) {
        case 'testing':
            return html`<div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>`;
        case 'success':
            return html`<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>`;
        case 'error':
            return html`<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>`;
        default:
            return html`<div className="w-4 h-4 bg-gray-500 rounded-full opacity-50"></div>`;
    }
};

const APITestCard = () => {
    const [isTesting, setIsTesting] = useState(false);
    const [connectionResult, setConnectionResult] = useState({ status: 'idle', message: 'Kiểm tra tệp Google Sheet được kết nối.' });
    const [writeResult, setWriteResult] = useState({ status: 'idle', message: 'Kiểm tra khả năng GHI dữ liệu vào Sheet.' });
    const [topicResult, setTopicResult] = useState({ status: 'idle', message: 'Kiểm tra khả năng TẢI danh sách chủ đề.' });
    const [readResult, setReadResult] = useState({ status: 'idle', message: 'Kiểm tra khả năng ĐỌC câu hỏi từ Sheet.' });

    const handleTest = async () => {
        setIsTesting(true);
        // Reset states
        setConnectionResult({ status: 'testing', message: 'Đang xác định tệp Sheet được kết nối...' });
        setWriteResult({ status: 'idle', message: 'Chờ kiểm tra kết nối...' });
        setTopicResult({ status: 'idle', message: 'Chờ kết quả kiểm tra GHI...' });
        setReadResult({ status: 'idle', message: 'Chờ kết quả kiểm tra Tải Chủ đề...' });

        // Bước 0: Kiểm tra kết nối Spreadsheet
        const connTest = await getSpreadsheetName();
        setConnectionResult({
            status: connTest.success ? 'success' : 'error',
            message: connTest.success ? `Script đang kết nối với tệp: "${connTest.name}"` : connTest.message,
        });

        if (!connTest.success) {
            setWriteResult({ status: 'skipped', message: 'Bỏ qua do không thể xác định tệp Sheet.' });
            setTopicResult({ status: 'skipped', message: 'Bỏ qua do không thể xác định tệp Sheet.' });
            setReadResult({ status: 'skipped', message: 'Bỏ qua do không thể xác định tệp Sheet.' });
            setIsTesting(false);
            return;
        }

        // Bước 1: Kiểm tra GHI
        setWriteResult({ status: 'testing', message: 'Đang gửi yêu cầu GHI...' });
        const writeTestResult = await testWriteConnection();
        setWriteResult({
            status: writeTestResult.success ? 'success' : 'error',
            message: writeTestResult.message,
        });

        // Bước 2: Nếu GHI thành công, kiểm tra Tải Chủ đề
        if (writeTestResult.success) {
            setTopicResult({ status: 'testing', message: 'Đang gửi yêu cầu Tải Chủ đề...' });
            const topicsTestResult = await testTopicsConnection();
            setTopicResult({
                status: topicsTestResult.success ? 'success' : 'error',
                message: topicsTestResult.message,
            });

            // Bước 3: Nếu Tải Chủ đề thành công, kiểm tra ĐỌC
            if (topicsTestResult.success && topicsTestResult.topics && topicsTestResult.topics.length > 0) {
                const firstTopicId = topicsTestResult.topics[0].id;
                setReadResult({ status: 'testing', message: `Đang gửi yêu cầu ĐỌC cho chủ đề "${firstTopicId}"...` });
                const readTestResult = await testReadConnection(firstTopicId); 
                setReadResult({
                    status: readTestResult.success ? 'success' : 'error',
                    message: readTestResult.message,
                });
            } else if (topicsTestResult.success) { // Thành công nhưng không tìm thấy chủ đề nào
                setReadResult({ status: 'skipped', message: "Bỏ qua do 'Mylist' không chứa chủ đề nào để kiểm tra." });
            } else { // Thất bại khi lấy chủ đề
                 setReadResult({ status: 'skipped', message: 'Bỏ qua do kiểm tra Tải Chủ đề thất bại.' });
            }
        } else {
            setTopicResult({ status: 'skipped', message: 'Bỏ qua do kiểm tra GHI thất bại.' });
            setReadResult({ status: 'skipped', message: 'Bỏ qua do kiểm tra Tải Chủ đề thất bại.' });
        }

        setIsTesting(false);
    };
    
    // Xác định màu sắc tổng thể của card
    const getOverallStatus = () => {
        if (!isTesting && connectionResult.status === 'success' && writeResult.status === 'success' && readResult.status === 'success' && topicResult.status === 'success') return 'success';
        if (!isTesting && (connectionResult.status === 'error' || writeResult.status === 'error' || readResult.status === 'error' || topicResult.status === 'error')) return 'error';
        if (isTesting) return 'testing';
        return 'idle';
    }

    const overallStatus = getOverallStatus();
    const statusStyles = {
        idle: { bg: 'bg-white/10', border: 'border-white/20' },
        testing: { bg: 'bg-blue-500/20', border: 'border-blue-500/50' },
        success: { bg: 'bg-green-500/20', border: 'border-green-500/50' },
        error: { bg: 'bg-red-500/20', border: 'border-red-500/50' },
    };
    const currentStyle = statusStyles[overallStatus];
    
    const textStyles = {
        idle: 'text-indigo-200',
        testing: 'text-blue-200',
        success: 'text-green-200',
        error: 'text-red-200',
        skipped: 'text-gray-400'
    };
    
    const TestItem = ({ title, result }) => html`
         <div className="flex items-start gap-3">
            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center pt-0.5">
                <${StatusIcon} status=${result.status} />
            </div>
            <div>
                <p className="font-semibold text-white/90 text-sm">${title}</p>
                <p className=${`text-xs ${textStyles[result.status]}`}>${result.message}</p>
            </div>
        </div>
    `;


    return html`
        <${Card} className=${`border ${currentStyle.border} ${currentStyle.bg} transition-colors duration-300`}>
             <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="flex-grow w-full">
                    <h3 className="font-bold text-white mb-4">Công Cụ Chẩn Đoán API</h3>
                    <div className="space-y-2">
                        <${TestItem} title="Kiểm tra Kết nối Sheet" result=${connectionResult} />
                        <${TestItem} title="Kiểm tra Ghi Dữ liệu" result=${writeResult} />
                        <${TestItem} title="Kiểm tra Tải Chủ đề" result=${topicResult} />
                        <${TestItem} title="Kiểm tra Đọc Dữ liệu" result=${readResult} />
                    </div>
                </div>
                <${Button} 
                    onClick=${handleTest} 
                    disabled=${isTesting}
                    variant="secondary"
                    className="w-full md:w-auto flex-shrink-0 mt-4 md:mt-0"
                >
                    ${isTesting ? 'Đang kiểm tra...' : 'Chạy Chẩn Đoán'}
                </>
            </div>
        </>
    `;
};

export default APITestCard;
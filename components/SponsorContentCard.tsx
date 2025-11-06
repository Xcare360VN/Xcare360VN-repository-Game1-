import React from 'react';
import htm from 'htm';
import Card from './ui/Card.js';

const html = htm.bind(React.createElement);

const SponsorContentCard = ({ sponsor }) => {
    // Không render gì nếu không có nhà tài trợ hoặc nhà tài trợ không có nội dung
    if (!sponsor || !sponsor.content) {
        return null;
    }

    return html`
        <${Card} className="animate-fade-in">
            <h4 className="text-sm font-bold uppercase tracking-widest text-cyan-300 mb-3 text-center">
                Thông điệp từ nhà tài trợ
            </h4>
            <p className="text-center text-cyan-100/80">
                ${sponsor.content}
            </p>
        </>
    `;
};

export default SponsorContentCard;

import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const SponsorBanner = ({ sponsor }) => {
    if (!sponsor) {
        return null;
    }

    return html`
        <div className="text-center py-4 mt-auto">
            <p className="text-xs text-white/50 mb-2">Được tài trợ bởi</p>
            <a href=${sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 group">
                <img src=${sponsor.logoUrl} alt=${`${sponsor.name} logo`} className="w-8 h-8 rounded-full" />
                <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">${sponsor.name}</span>
            </a>
        </div>
    `;
};

export default SponsorBanner;

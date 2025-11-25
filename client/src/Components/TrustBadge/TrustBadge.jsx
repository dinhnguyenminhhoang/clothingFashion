import React from 'react';
import { motion } from 'framer-motion';

/**
 * Trust Badge Component - Vietnamese E-commerce Style
 * Displays various trust signals like "Chính hãng", "Freeship", etc.
 */
const TrustBadge = ({ type, text, icon }) => {
    const badgeStyles = {
        authentic: {
            bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
            icon: '✓',
            text: text || 'Chính hãng'
        },
        freeship: {
            bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
            icon: '🚚',
            text: text || 'Freeship'
        },
        return: {
            bg: 'bg-gradient-to-r from-orange-500 to-red-500',
            icon: '↺',
            text: text || 'Đổi trả 30 ngày'
        },
        official: {
            bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
            icon: '👑',
            text: text || 'Official Store'
        },
        hot: {
            bg: 'bg-gradient-to-r from-red-500 to-pink-500',
            icon: '🔥',
            text: text || 'Hot'
        },
        sale: {
            bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
            icon: '⚡',
            text: text || 'Giảm giá'
        }
    };

    const style = badgeStyles[type] || badgeStyles.authentic;

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`
        ${style.bg}
        text-white text-xs font-bold px-2 py-1 rounded
        flex items-center gap-1
        shadow-md
        whitespace-nowrap
      `}
        >
            <span className="text-xs">{icon || style.icon}</span>
            <span>{style.text}</span>
        </motion.div>
    );
};

/**
 * Trust Badges Group Component
 * Displays multiple trust badges in a flex container
 */
export const TrustBadges = ({ badges = [], className = '' }) => {
    if (!badges || badges.length === 0) return null;

    return (
        <div className={`flex flex-wrap gap-1.5 ${className}`}>
            {badges.map((badge, index) => (
                <TrustBadge
                    key={index}
                    type={badge.type}
                    text={badge.text}
                    icon={badge.icon}
                />
            ))}
        </div>
    );
};

/**
 * Sold Count Badge - Vietnamese Style
 * Shows "Đã bán XXX" with animation
 */
export const SoldCountBadge = ({ count, className = '' }) => {
    if (!count || count === 0) return null;

    const formatCount = (num) => {
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}k`;
        }
        return num.toString();
    };

    return (
        <div className={`flex items-center gap-1 text-gray-600 text-xs ${className}`}>
            <span className="font-medium">Đã bán</span>
            <span className="font-bold text-gray-800">{formatCount(count)}</span>
        </div>
    );
};

/**
 * Viewing Count Badge
 * Shows "XX người đang xem"
 */
export const ViewingCountBadge = ({ count, className = '' }) => {
    if (!count || count === 0) return null;

    return (
        <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`flex items-center gap-1 text-orange-600 text-xs font-medium ${className}`}
        >
            <span>👁️</span>
            <span>{count} người đang xem</span>
        </motion.div>
    );
};

export default TrustBadge;

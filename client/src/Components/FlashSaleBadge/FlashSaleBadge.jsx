import React from 'react';
import { motion } from 'framer-motion';
import CountdownTimer from '../CountdownTimer/CountdownTimer';

const FlashSaleBadge = ({ discount, compact = false }) => {
    if (!discount || !discount.endDate) return null;

    const endDate = new Date(discount.endDate);
    const now = new Date();
    const timeLeft = endDate - now;

    // Don't show if expired
    if (timeLeft <= 0) return null;

    // Only show for discounts ending within 7 days
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (timeLeft > sevenDays) return null;

    const isVeryUrgent = timeLeft < 60 * 60 * 1000; // < 1 hour
    const isUrgent = timeLeft < 24 * 60 * 60 * 1000; // < 24 hours

    if (compact) {
        return (
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold
          ${isVeryUrgent
                        ? 'bg-red-600 text-white animate-pulse'
                        : isUrgent
                            ? 'bg-orange-500 text-white'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    }
          shadow-lg
        `}
            >
                <span>⚡ FLASH SALE</span>
                <CountdownTimer endDate={discount.endDate} compact={true} />
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`
        rounded-lg p-3 text-center
        ${isVeryUrgent
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : isUrgent
                        ? 'bg-gradient-to-r from-orange-500 to-red-500'
                        : 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500'
                }
        shadow-lg
      `}
        >
            <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xl">⚡</span>
                <h3 className="text-white font-black text-lg uppercase tracking-wide">
                    Flash Sale
                </h3>
                <span className="text-xl">⚡</span>
            </div>

            <p className="text-white/90 text-xs mb-3 font-medium">
                {isVeryUrgent
                    ? '🔥 SẮP KẾT THÚC!'
                    : isUrgent
                        ? '⏰ Kết thúc trong hôm nay!'
                        : 'Ưu đãi có thời hạn'
                }
            </p>

            <CountdownTimer endDate={discount.endDate} />

            <div className="mt-3 pt-3 border-t border-white/20">
                <p className="text-white text-xs">
                    <span className="font-bold">{discount.name}</span>
                    <span className="mx-1.5">•</span>
                    <span className="font-bold text-base text-yellow-300">-{discount.percentage}%</span>
                </p>
            </div>
        </motion.div>
    );
};

export default FlashSaleBadge;

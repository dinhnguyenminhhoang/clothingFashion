import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CountdownTimer = ({ endDate, onExpire, urgentThreshold = 24 * 60 * 60 * 1000, compact = false }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = new Date(endDate) - new Date();

        if (difference <= 0) {
            return { expired: true };
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            totalMs: difference,
            expired: false
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            if (newTimeLeft.expired && onExpire) {
                onExpire();
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate, onExpire]);

    if (timeLeft.expired) {
        return null;
    }

    const isUrgent = timeLeft.totalMs < urgentThreshold;
    const isVeryUrgent = timeLeft.totalMs < 60 * 60 * 1000; // < 1 hour

    const TimeUnit = ({ value, label, isLast }) => (
        <div className="flex flex-col items-center relative">
            <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: isVeryUrgent ? Infinity : 0 }}
                className={`
          ${compact ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base'} 
          flex items-center justify-center font-black rounded-lg
          ${isVeryUrgent
                        ? 'bg-red-600 text-white'
                        : isUrgent
                            ? 'bg-orange-500 text-white'
                            : 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                    }
          shadow-md
        `}
            >
                {String(value).padStart(2, '0')}
            </motion.div>
            {!compact && (
                <span className="text-[10px] text-white/80 mt-1 font-medium">{label}</span>
            )}
            {!isLast && !compact && (
                <span className="absolute right-[-8px] top-3 text-lg font-bold text-white/60">:</span>
            )}
        </div>
    );

    if (compact) {
        return (
            <div className="flex items-center gap-0.5">
                {timeLeft.days > 0 && (
                    <>
                        <div className={`
              min-w-[20px] h-5 px-1 flex items-center justify-center font-black text-[10px] rounded
              ${isVeryUrgent
                                ? 'bg-red-600 text-white'
                                : isUrgent
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-purple-600 text-white'
                            }
            `}>
                            {String(timeLeft.days).padStart(2, '0')}
                        </div>
                        <span className="text-[10px] font-bold mx-0.5">:</span>
                    </>
                )}
                <div className={`
          min-w-[20px] h-5 px-1 flex items-center justify-center font-black text-[10px] rounded
          ${isVeryUrgent
                        ? 'bg-red-600 text-white'
                        : isUrgent
                            ? 'bg-orange-500 text-white'
                            : 'bg-purple-600 text-white'
                    }
        `}>
                    {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <span className="text-[10px] font-bold mx-0.5">:</span>
                <div className={`
          min-w-[20px] h-5 px-1 flex items-center justify-center font-black text-[10px] rounded
          ${isVeryUrgent
                        ? 'bg-red-600 text-white'
                        : isUrgent
                            ? 'bg-orange-500 text-white'
                            : 'bg-purple-600 text-white'
                    }
        `}>
                    {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <span className="text-[10px] font-bold mx-0.5">:</span>
                <div className={`
          min-w-[20px] h-5 px-1 flex items-center justify-center font-black text-[10px] rounded
          ${isVeryUrgent
                        ? 'bg-red-600 text-white'
                        : isUrgent
                            ? 'bg-orange-500 text-white'
                            : 'bg-purple-600 text-white'
                    }
        `}>
                    {String(timeLeft.seconds).padStart(2, '0')}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center gap-2">
            {timeLeft.days > 0 && <TimeUnit value={timeLeft.days} label="Ngày" />}
            <TimeUnit value={timeLeft.hours} label="Giờ" />
            <TimeUnit value={timeLeft.minutes} label="Phút" />
            <TimeUnit value={timeLeft.seconds} label="Giây" isLast />
        </div>
    );
};

export default CountdownTimer;

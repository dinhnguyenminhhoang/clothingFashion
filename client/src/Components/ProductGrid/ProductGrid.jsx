import React, { useEffect, useState } from "react";
import ProductItem from "../ProductItem/ProductItem";

// Custom hook to detect mobile
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return isMobile;
};

/**
 * ProductGrid - Dual Layout Component
 * Desktop: Standard 4-column grid 
 * Mobile: Shopee-style compact 2-column grid
 */
const ProductGrid = ({ products, onQuickView }) => {
    const isMobile = useIsMobile();

    // Mobile Shopee-style Layout
    if (isMobile) {
        return (
            <div className="grid grid-cols-2 gap-2 px-2">
                {products?.map((product) => (
                    <div key={product._id} className="shopee-product-card">
                        <ProductItem product={product} onQuickView={onQuickView} />
                    </div>
                ))}

                {/* Mobile-specific styling */}
                <style jsx>{`
          .shopee-product-card {
            /* Override ProductItem desktop styles for mobile */
          }
          
          .shopee-product-card :global(.group) {
            border-radius: 0.5rem !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
          }
          
          .shopee-product-card :global(.group:hover) {
            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
            transform: none !important;
          }
          
          /* Smaller padding on mobile */
          .shopee-product-card :global(motion > div:last-child) {
            padding: 0.5rem !important;
          }
          
          /* Smaller text on mobile */
          .shopee-product-card :global(h3) {
            font-size: 0.875rem !important;
            line-height: 1.25rem !important;
          }
          
          /* Compact price */
          .shopee-product-card :global(.text-xl) {
            font-size: 1rem !important;
          }
          
          /* Hide some elements on mobile for cleaner look */
          .shopee-product-card :global(.space-y-3) {
            gap: 0.5rem !important;
          }
          
          /* Responsive touch targets */
          @media (max-width: 768px) {
            .shopee-product-card :global(button) {
              min-width: 40px !important;
              min-height: 40px !important;
            }
          }
        `}</style>
            </div>
        );
    }

    // Desktop Standard Grid Layout
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.map((product) => (
                <ProductItem key={product._id} product={product} onQuickView={onQuickView} />
            ))}
        </div>
    );
};

export default ProductGrid;

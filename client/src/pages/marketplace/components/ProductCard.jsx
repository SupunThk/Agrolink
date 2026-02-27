import React from "react";
import "./productCard.css";

export default function ProductCard({ product }) {
    const PF = "http://localhost:5000/images/";

    // Format price
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(product.price);

    return (
        <div className="productCard">
            <div className="productCardImgWrapper">
                {product.image_url ? (
                    <img className="productCardImg" src={product.image_url} alt={product.crop_name} />
                ) : (
                    <div className="productCardImgPlaceholder">
                        <i className="fas fa-box-open"></i>
                    </div>
                )}
                <div className="productCardImgOverlay"></div>
                <span className="productCardBadge">{product.category_id}</span>
            </div>

            <div className="productCardInfo">
                <div className="productCardHeader">
                    <h3 className="productCardTitle">{product.crop_name}</h3>
                    <span className="productCardPrice">{formattedPrice}</span>
                </div>

                <p className="productCardDesc">{product.description}</p>

                <div className="productCardDetails">
                    <div className="productDetail">
                        <i className="fas fa-weight-hanging"></i>
                        <span>{product.quantity}</span>
                    </div>
                    <div className="productDetail">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{product.location}</span>
                    </div>
                </div>

                <div className="productCardFooter">
                    <div className="productCardSeller">
                        <div className="sellerAvatar">
                            <i className="fas fa-user-circle"></i>
                        </div>
                        <span className="sellerName">{product.seller_id}</span>
                    </div>
                    <button className="productCardContactBtn">
                        Contact
                    </button>
                </div>
            </div>
        </div>
    );
}

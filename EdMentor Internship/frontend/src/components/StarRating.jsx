import React, { useState } from 'react';

const StarRating = ({ rating = 0, onRatingChange = null, size = 18 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (val) => {
    if (onRatingChange) {
      onRatingChange(val);
    }
  };

  const handleMouseEnter = (val) => {
    if (onRatingChange) {
      setHoverRating(val);
    }
  };

  const handleMouseLeave = () => {
    if (onRatingChange) {
      setHoverRating(0);
    }
  };

  const currentVal = hoverRating || rating;

  return (
    <div className="star-rating-box">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star-node ${star <= currentVal ? 'star-filled' : 'star-empty'} ${onRatingChange ? 'star-interactive' : ''}`}
          style={{ fontSize: `${size}px`, cursor: onRatingChange ? 'pointer' : 'default' }}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
        >
          ★
        </span>
      ))}

      <style>{`
        .star-rating-box {
          display: inline-flex;
          gap: 2px;
        }

        .star-node {
          line-height: 1;
          user-select: none;
          transition: transform var(--transition-fast);
        }

        .star-interactive:hover {
          transform: scale(1.2);
        }

        .star-filled {
          color: var(--warning);
        }

        .star-empty {
          color: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default StarRating;

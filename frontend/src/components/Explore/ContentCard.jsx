import React from 'react';
import './ContentCard.css'; // We'll create this CSS file next

const ContentCard = ({ title, description, buttonText, imageUrl, type }) => {
  return (
    <div className={`content-card ${type || ''}`}>
      {imageUrl && (
        <div className="card-image-placeholder">
          <img src={imageUrl} alt={title} />
        </div>
      )}
      {!imageUrl && type !== 'documentation' && <div className="card-icon-placeholder">📄</div>}
      {type === 'documentation' && <div className="card-icon-placeholder-doc">📚</div>}


      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
        {buttonText && <button className="card-action-button">{buttonText}</button>}
      </div>
    </div>
  );
};

export default ContentCard;
